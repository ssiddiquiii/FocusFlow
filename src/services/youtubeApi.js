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
 * Fetches full playlist details, all video items, and durations via serverless API proxy.
 * Protects server-side API Key from browser exposure.
 * @param {string} playlistId The extracted YouTube playlist ID.
 * @returns {Promise<{ course: object, lessons: Array<object> }>}
 */
export async function fetchYouTubePlaylistData(playlistId) {
  if (!playlistId) {
    throw new Error('Playlist ID is required.');
  }

  const endpointUrl = `/api/youtube?playlistId=${encodeURIComponent(playlistId)}`;
  const response = await fetch(endpointUrl);
  
  if (!response.ok) {
    let errorMsg = 'Failed to fetch playlist details.';
    try {
      const errData = await response.json();
      if (errData.error) {
        errorMsg = errData.error;
      }
    } catch (_) {
      // Fallback to HTTP status text if JSON parsing fails
    }
    throw new Error(errorMsg);
  }

  const data = await response.json();
  if (!data.course || !Array.isArray(data.lessons)) {
    throw new Error('Invalid playlist response structure returned from server API.');
  }

  return {
    course: data.course,
    lessons: data.lessons
  };
}
