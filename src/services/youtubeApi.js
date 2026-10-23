/**
 * FocusFlow Resilient YouTube Integration Service.
 * Supports:
 * - Full Playlist URLs & IDs (e.g. https://www.youtube.com/playlist?list=...)
 * - Single Video Crash Courses (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)
 * - Serverless API proxy (/api/youtube) with automatic direct client-side fallback
 * - Custom user API keys from Settings / localStorage
 */

// Fallback Google Cloud YouTube Data API v3 Key
const DEFAULT_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || '';

export function getActiveApiKey() {
  const customKey = localStorage.getItem('focusflow_custom_youtube_api_key');
  if (customKey && customKey.trim().length > 10) {
    return customKey.trim();
  }
  return DEFAULT_API_KEY;
}

/**
 * Extracts Playlist ID from various YouTube URL formats.
 */
export function extractPlaylistId(inputUrlOrId) {
  if (!inputUrlOrId) return null;
  const trimmed = inputUrlOrId.trim();
  
  // Direct playlist ID format check (starts with PL, RD, UU, etc.)
  if (/^[a-zA-Z0-9_-]{18,}$/.test(trimmed) && !trimmed.includes('http')) {
    return trimmed;
  }

  try {
    const urlObj = new URL(trimmed);
    const listId = urlObj.searchParams.get('list');
    if (listId) return listId;
  } catch (_) {
    const match = trimmed.match(/[&?]list=([a-zA-Z0-9_-]+)/);
    if (match) return match[1];
  }
  return null;
}

/**
 * Extracts Single Video ID from YouTube URL formats.
 */
export function extractVideoId(inputUrlOrId) {
  if (!inputUrlOrId) return null;
  const trimmed = inputUrlOrId.trim();

  // Direct 11-char video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const urlObj = new URL(trimmed);
    if (urlObj.hostname.includes('youtu.be')) {
      const pathId = urlObj.pathname.replace(/^\//, '');
      if (pathId.length >= 11) return pathId.slice(0, 11);
    }
    const vParam = urlObj.searchParams.get('v');
    if (vParam) return vParam;
  } catch (_) {
    const match = trimmed.match(/(?:youtu\.be\/|watch\?v=)([a-zA-Z0-9_-]{11})/);
    if (match) return match[1];
  }
  return null;
}

/**
 * Converts ISO 8601 duration (e.g. PT1H2M34S) to digital string (1:02:34 or 15:20)
 */
export function parseISODuration(durationISO) {
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
 * Direct client-side fetch for YouTube Playlist using YouTube Data API v3.
 */
async function fetchPlaylistDirectClient(playlistId, apiKey) {
  const fetchOptions = { signal: AbortSignal.timeout(15000) };

  // 1. Fetch Playlist Info
  const playlistUrl = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${encodeURIComponent(playlistId)}&key=${apiKey}`;
  const playlistRes = await fetch(playlistUrl, fetchOptions);

  if (!playlistRes.ok) {
    if (playlistRes.status === 403 || playlistRes.status === 429) {
      throw new Error('YouTube API quota reached. You can add your personal API key in Settings.');
    }
    if (playlistRes.status === 404) {
      throw new Error('Playlist not found. Please verify the URL or ensure the playlist is Public or Unlisted.');
    }
    throw new Error(`YouTube API request failed with status ${playlistRes.status}`);
  }

  const playlistData = await playlistRes.json();
  if (!playlistData.items || playlistData.items.length === 0) {
    throw new Error('Playlist not found or contains no videos.');
  }

  const snippet = playlistData.items[0].snippet;
  const course = {
    id: playlistId,
    title: snippet.title || 'Untitled Playlist',
    description: snippet.description || 'YouTube Playlist Course',
    thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || '',
    channelName: snippet.channelTitle || 'YouTube Creator',
    type: 'youtube',
    udemyUrl: ''
  };

  // 2. Fetch Playlist Items
  let rawLessons = [];
  let nextPageToken = '';
  let hasNextPage = true;
  let index = 1;
  const MAX_ITEMS = 200;

  while (hasNextPage) {
    const itemsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${encodeURIComponent(playlistId)}&key=${apiKey}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
    const itemsRes = await fetch(itemsUrl, fetchOptions);
    if (!itemsRes.ok) {
      break;
    }
    const itemsData = await itemsRes.json();

    if (itemsData.items) {
      for (const item of itemsData.items) {
        const title = item.snippet?.title || '';
        if (title !== 'Private video' && title !== 'Deleted video') {
          const videoId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
          if (videoId) {
            rawLessons.push({
              id: videoId,
              courseId: playlistId,
              title: title || `Lecture ${index}`,
              description: item.snippet?.description || '',
              thumbnailUrl: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || '',
              duration: '0:00',
              index: index++,
              type: 'youtube'
            });
          }
        }
      }
    }

    if (rawLessons.length >= MAX_ITEMS) break;
    nextPageToken = itemsData.nextPageToken;
    hasNextPage = !!nextPageToken;
  }

  if (rawLessons.length === 0) {
    throw new Error('No public videos found in this playlist.');
  }

  // 3. Batch fetch durations
  const videoIds = rawLessons.map(l => l.id).filter(Boolean);
  const durationMap = {};

  for (let i = 0; i < videoIds.length; i += 50) {
    const batchIds = videoIds.slice(i, i + 50).join(',');
    const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${batchIds}&key=${apiKey}`;
    try {
      const videosRes = await fetch(videosUrl, fetchOptions);
      if (videosRes.ok) {
        const videosData = await videosRes.json();
        if (videosData.items) {
          videosData.items.forEach(v => {
            durationMap[v.id] = parseISODuration(v.contentDetails?.duration);
          });
        }
      }
    } catch (_) {}
  }

  const lessons = rawLessons.map(lesson => ({
    ...lesson,
    duration: durationMap[lesson.id] || '0:00'
  }));

  return { course, lessons };
}

/**
 * Direct client-side fetch for a single YouTube video tutorial/crash course.
 */
async function fetchSingleVideoDirectClient(videoId, apiKey) {
  const fetchOptions = { signal: AbortSignal.timeout(15000) };
  const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${encodeURIComponent(videoId)}&key=${apiKey}`;
  const res = await fetch(videosUrl, fetchOptions);

  if (!res.ok) {
    throw new Error('Failed to fetch video details from YouTube.');
  }

  const data = await res.json();
  if (!data.items || data.items.length === 0) {
    throw new Error('Video not found or is set to private.');
  }

  const item = data.items[0];
  const snippet = item.snippet;
  const duration = parseISODuration(item.contentDetails?.duration);

  const course = {
    id: videoId,
    title: snippet.title || 'YouTube Crash Course',
    description: snippet.description || '',
    thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || '',
    channelName: snippet.channelTitle || 'YouTube Creator',
    type: 'youtube',
    udemyUrl: ''
  };

  const lessons = [{
    id: videoId,
    courseId: videoId,
    title: snippet.title || 'Full Tutorial',
    description: snippet.description || '',
    thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || '',
    duration: duration || '0:00',
    index: 1,
    type: 'youtube'
  }];

  return { course, lessons };
}

/**
 * Primary Unified YouTube Course Fetcher.
 * Accepts:
 * - Playlist URL or Playlist ID
 * - Single Video URL or Video ID
 * Tries serverless proxy first, automatically falls back to direct client API.
 * @param {string} inputUrlOrId 
 * @returns {Promise<{ course: object, lessons: Array<object> }>}
 */
export async function fetchYouTubePlaylistData(inputUrlOrId) {
  if (!inputUrlOrId) {
    throw new Error('YouTube URL or ID is required.');
  }

  const apiKey = getActiveApiKey();
  const playlistId = extractPlaylistId(inputUrlOrId);

  // If it is a playlist:
  if (playlistId) {
    // 1. Try serverless proxy if running in serverless environment (e.g. Vercel production)
    try {
      const endpointUrl = `/api/youtube?playlistId=${encodeURIComponent(playlistId)}`;
      const response = await fetch(endpointUrl, { signal: AbortSignal.timeout(6000) });
      const contentType = response.headers.get('content-type') || '';

      if (response.ok && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.course && Array.isArray(data.lessons)) {
          return { course: data.course, lessons: data.lessons };
        }
      }
    } catch (_) {
      // Fallback to direct client API
    }

    // 2. Client-side fallback
    return await fetchPlaylistDirectClient(playlistId, apiKey);
  }

  // If it's a single video tutorial (e.g. 1-hour to 12-hour crash courses)
  const videoId = extractVideoId(inputUrlOrId);
  if (videoId) {
    return await fetchSingleVideoDirectClient(videoId, apiKey);
  }

  throw new Error('Please enter a valid YouTube playlist URL or video tutorial link.');
}
