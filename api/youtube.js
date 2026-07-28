/**
 * Converts ISO 8601 duration string (e.g. PT1H2M10S, PT45S) into standard MM:SS or HH:MM:SS string.
 * @param {string} durationISO ISO 8601 duration string.
 * @returns {string} Formatted duration.
 */
function parseISODuration(durationISO) {
  if (!durationISO) return '0:00';
  const match = durationISO.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  
  const hours = parseInt(match[1] || 0, 10);
  const minutes = parseInt(match[2] || 0, 10);
  const seconds = parseInt(match[3] || 0, 10);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Vercel Serverless Function proxying YouTube Data API requests.
 * Protects server-side YOUTUBE_API_KEY and normalizes status codes.
 */
export default async function handler(request, response) {
  // Handle CORS preflight if requested
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // Reject unsupported HTTP methods
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method Not Allowed. Only GET requests are supported.' });
  }

  const { playlistId } = request.query || {};

  // Validate playlistId input
  if (!playlistId || typeof playlistId !== 'string' || !/^[a-zA-Z0-9_-]{10,64}$/.test(playlistId.trim())) {
    return response.status(400).json({ error: 'Invalid or missing playlistId parameter.' });
  }

  const cleanPlaylistId = playlistId.trim();

  // Read server-side API Key
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return response.status(503).json({ error: 'YouTube API service unconfigured on server.' });
  }

  try {
    const fetchOptions = { signal: AbortSignal.timeout(10000) }; // 10s timeout

    // 1. Fetch Playlist Info
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${cleanPlaylistId}&key=${apiKey}`;
    const playlistRes = await fetch(playlistUrl, fetchOptions);

    if (!playlistRes.ok) {
      if (playlistRes.status === 403 || playlistRes.status === 429) {
        return response.status(429).json({ error: 'YouTube API quota exceeded or forbidden access.' });
      }
      if (playlistRes.status === 404) {
        return response.status(404).json({ error: 'Playlist not found or private.' });
      }
      return response.status(502).json({ error: 'Upstream YouTube API error fetching playlist metadata.' });
    }

    const playlistData = await playlistRes.json();
    if (!playlistData.items || playlistData.items.length === 0) {
      return response.status(404).json({ error: 'Playlist not found or contains no items.' });
    }

    const playlistSnippet = playlistData.items[0].snippet;
    const course = {
      id: cleanPlaylistId,
      title: playlistSnippet.title || 'Untitled Playlist',
      description: playlistSnippet.description || 'YouTube Playlist Course',
      thumbnailUrl: playlistSnippet.thumbnails?.high?.url || playlistSnippet.thumbnails?.medium?.url || playlistSnippet.thumbnails?.default?.url || '',
      channelName: playlistSnippet.channelTitle || 'YouTube Creator',
      type: 'youtube',
      udemyUrl: ''
    };

    // 2. Fetch Playlist Items with pagination limit (Max 200 items)
    let rawLessons = [];
    let nextPageToken = '';
    let hasNextPage = true;
    let index = 1;
    const MAX_ITEMS = 200;

    while (hasNextPage) {
      const itemsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${cleanPlaylistId}&key=${apiKey}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
      const itemsRes = await fetch(itemsUrl, fetchOptions);

      if (!itemsRes.ok) {
        if (itemsRes.status === 403 || itemsRes.status === 429) {
          return response.status(429).json({ error: 'YouTube API quota exceeded.' });
        }
        return response.status(502).json({ error: 'Upstream YouTube API error fetching playlist items.' });
      }

      const itemsData = await itemsRes.json();

      if (itemsData.items) {
        for (const item of itemsData.items) {
          if (item.snippet?.title !== 'Private video' && item.snippet?.title !== 'Deleted video') {
            rawLessons.push({
              id: item.contentDetails?.videoId || item.snippet?.resourceId?.videoId,
              courseId: cleanPlaylistId,
              title: item.snippet?.title || 'Untitled Video',
              description: item.snippet?.description || '',
              thumbnailUrl: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || '',
              duration: '0:00',
              index: index++,
              type: 'youtube'
            });
          }
        }
      }

      // Check item count limit
      if (rawLessons.length > MAX_ITEMS) {
        return response.status(400).json({ error: `Playlist exceeds the maximum supported limit of ${MAX_ITEMS} videos.` });
      }

      nextPageToken = itemsData.nextPageToken;
      hasNextPage = !!nextPageToken;
    }

    if (rawLessons.length === 0) {
      return response.status(404).json({ error: 'No public videos found in this playlist.' });
    }

    // 3. Batch fetch video durations (max 50 per request)
    const videoIds = rawLessons.map(l => l.id).filter(Boolean);
    const durationMap = {};

    for (let i = 0; i < videoIds.length; i += 50) {
      const batchIds = videoIds.slice(i, i + 50).join(',');
      const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${batchIds}&key=${apiKey}`;
      const videosRes = await fetch(videosUrl, fetchOptions);

      if (videosRes.ok) {
        const videosData = await videosRes.json();
        if (videosData.items) {
          videosData.items.forEach(v => {
            durationMap[v.id] = parseISODuration(v.contentDetails?.duration);
          });
        }
      }
    }

    const lessons = rawLessons.map(lesson => ({
      ...lesson,
      duration: durationMap[lesson.id] || '0:00'
    }));

    // Cache successful responses for 1 hour
    response.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return response.status(200).json({ course, lessons });

  } catch (error) {
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return response.status(504).json({ error: 'Upstream YouTube API request timed out.' });
    }
    return response.status(502).json({ error: 'Upstream network failure connecting to YouTube services.' });
  }
}
