const ALLOWLIST = [
  'PLu71SKxNbfoBuX3f4EOACle2y-tRC5Q37', // JavaScript
  'PLu71SKxNbfoDqgPchmvIsL4hTnJIrtige', // ReactJS
  'PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW'  // Backend
];

/**
 * Parses ISO 8601 duration string (e.g. PT1H2M10S, PT45S) into standard MM:SS or HH:MM:SS string.
 * @param {string} durationISO ISO 8601 duration string.
 * @returns {string} Formatted duration.
 */
function parseISODuration(durationISO) {
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
 * Vercel Serverless Function to proxy YouTube API requests.
 * Protects YouTube API Key from client exposure and checks playlist allowlist.
 */
export default async function handler(request, response) {
  // Enable CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  const { playlistId } = request.query;

  if (!playlistId) {
    return response.status(400).json({ error: 'Missing playlistId parameter.' });
  }

  // Security Check: Enforce Allowlist
  if (!ALLOWLIST.includes(playlistId)) {
    return response.status(403).json({ error: 'Requested Playlist ID is not allowlisted.' });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return response.status(500).json({ error: 'Server configuration error: Missing YOUTUBE_API_KEY.' });
  }

  try {
    // 1. Fetch Playlist Info (Title, Description, Author)
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`;
    const playlistRes = await fetch(playlistUrl);
    if (!playlistRes.ok) {
      throw new Error(`YouTube API returned status ${playlistRes.status} on playlists request.`);
    }
    const playlistData = await playlistRes.json();
    if (!playlistData.items || playlistData.items.length === 0) {
      throw new Error('Playlist not found on YouTube.');
    }

    const playlistSnippet = playlistData.items[0].snippet;
    const course = {
      id: playlistId,
      title: playlistSnippet.title,
      description: playlistSnippet.description,
      thumbnailUrl: playlistSnippet.thumbnails?.high?.url || playlistSnippet.thumbnails?.medium?.url || playlistSnippet.thumbnails?.default?.url || '',
      channelName: playlistSnippet.channelTitle || 'Chai aur Code',
      type: 'youtube',
      udemyUrl: ''
    };

    // 2. Fetch Playlist Items (Recursively handle pagination)
    let lessons = [];
    let nextPageToken = '';
    let hasNextPage = true;
    let index = 1;

    while (hasNextPage) {
      const itemsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${apiKey}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
      const itemsRes = await fetch(itemsUrl);
      if (!itemsRes.ok) {
        throw new Error(`YouTube API returned status ${itemsRes.status} on playlistItems request.`);
      }
      const itemsData = await itemsRes.json();
      
      if (itemsData.items) {
        // Collect video metadata
        itemsData.items.forEach(item => {
          lessons.push({
            id: item.contentDetails.videoId,
            courseId: playlistId,
            title: item.snippet.title,
            description: item.snippet.description || '',
            thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
            duration: '0:00', // To be filled in subsequent details step
            index: index++,
            type: 'youtube'
          });
        });
      }

      nextPageToken = itemsData.nextPageToken;
      hasNextPage = !!nextPageToken;
    }

    // 3. Batch fetch video durations (max 50 per request)
    const videoIds = lessons.map(l => l.id);
    const durationMap = {};

    for (let i = 0; i < videoIds.length; i += 50) {
      const batchIds = videoIds.slice(i, i + 50).join(',');
      const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${batchIds}&key=${apiKey}`;
      const videosRes = await fetch(videosUrl);
      if (videosRes.ok) {
        const videosData = await videosRes.json();
        if (videosData.items) {
          videosData.items.forEach(v => {
            durationMap[v.id] = parseISODuration(v.contentDetails.duration);
          });
        }
      }
    }

    // Map duration strings back to lessons
    lessons = lessons.map(lesson => ({
      ...lesson,
      duration: durationMap[lesson.id] || '0:00'
    }));

    return response.status(200).json({ course, lessons });
  } catch (error) {
    console.error('Error in Vercel API YouTube handler:', error.message);
    return response.status(500).json({ error: error.message });
  }
}
