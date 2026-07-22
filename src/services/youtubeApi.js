/**
 * Utility helper to extract Playlist ID from various YouTube URL formats or raw ID strings.
 * Examples supported:
 * - https://www.youtube.com/playlist?list=PLu71SKxNbfoBuX3f4EOACle2y-tRC5Q37
 * - https://youtu.be/watch?v=xxx&list=PLu71SKxNbfoBuX3f4EOACle2y-tRC5Q37
 * - PLu71SKxNbfoBuX3f4EOACle2y-tRC5Q37
 */
export function extractPlaylistId(inputUrlOrId) {
  if (!inputUrlOrId) return null;
  const trimmed = inputUrlOrId.trim();
  
  // Direct playlist ID format check
  if (/^[a-zA-Z0-9_-]{18,}$/.test(trimmed) && !trimmed.includes('http')) {
    return trimmed;
  }

  try {
    const urlObj = new URL(trimmed);
    return urlObj.searchParams.get('list');
  } catch (_) {
    // Regular expression fallback
    const match = trimmed.match(/[&?]list=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }
}

/**
 * Converts ISO 8601 duration string (e.g. PT1H2M34S or PT15M20S) into digital format (1:02:34 or 15:20)
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
 * Fetches full playlist details, all video items, and durations from YouTube Data API.
 * @param {string} playlistId The extracted YouTube playlist ID.
 * @returns {Promise<{ course: object, lessons: Array<object> }>}
 */
export async function fetchYouTubePlaylistData(playlistId) {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error('YouTube API Key missing. Please check your VITE_YOUTUBE_API_KEY environment variable.');
  }

  // 1. Fetch Playlist Info
  const playlistUrl = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`;
  const playlistRes = await fetch(playlistUrl);
  
  if (!playlistRes.ok) {
    throw new Error('Failed to fetch playlist details. Check if the playlist is public.');
  }
  
  const playlistData = await playlistRes.json();
  if (!playlistData.items || playlistData.items.length === 0) {
    throw new Error('Playlist not found. Please verify the URL or Playlist ID.');
  }

  const snippet = playlistData.items[0].snippet;

  const course = {
    id: playlistId,
    title: snippet.title || 'Untitled Course',
    description: snippet.description || `YouTube Course Playlist`,
    thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || '',
    channelName: snippet.channelTitle || 'YouTube Creator',
    type: 'youtube',
    udemyUrl: ''
  };

  // 2. Fetch All Items with Pagination
  let nextPageToken = '';
  let hasNextPage = true;
  let index = 1;
  const rawLessons = [];

  while (hasNextPage) {
    const itemsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${apiKey}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
    const itemsRes = await fetch(itemsUrl);
    
    if (!itemsRes.ok) {
      throw new Error('Error fetching playlist video items.');
    }
    
    const itemsData = await itemsRes.json();

    if (itemsData.items) {
      itemsData.items.forEach(item => {
        // Exclude deleted or private videos
        if (item.snippet.title !== 'Private video' && item.snippet.title !== 'Deleted video') {
          rawLessons.push({
            id: item.contentDetails.videoId,
            courseId: playlistId,
            title: item.snippet.title,
            description: item.snippet.description || '',
            thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || '',
            duration: '0:00',
            index: index++,
            type: 'youtube'
          });
        }
      });
    }

    nextPageToken = itemsData.nextPageToken;
    hasNextPage = !!nextPageToken;
  }

  if (rawLessons.length === 0) {
    throw new Error('No valid public videos found in this playlist.');
  }

  // 3. Batch Fetch Video Durations (50 at a time)
  const videoIds = rawLessons.map(l => l.id);
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

  // Map final durations into lessons array
  const lessons = rawLessons.map(l => ({
    ...l,
    duration: durationMap[l.id] || '0:00'
  }));

  return { course, lessons };
}
