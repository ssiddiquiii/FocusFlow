import handler from '../../../api/youtube.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

async function runLiveSmokeTest() {
  console.log('--- Step 3: Serverless Endpoint Live Integration Smoke Test ---');

  // Test 1: Unconfigured key check
  const savedKey = process.env.YOUTUBE_API_KEY;
  delete process.env.YOUTUBE_API_KEY;

  let statusCode = 0;
  let responseData = null;

  const reqUnconfigured = { method: 'GET', query: { playlistId: 'PLu71SKxNbfoBuX3f4EOACle2y-tRC5Q37' } };
  const resUnconfigured = {
    setHeader: () => {},
    status: (code) => { statusCode = code; return resUnconfigured; },
    json: (data) => { responseData = data; return resUnconfigured; }
  };

  await handler(reqUnconfigured, resUnconfigured);
  assert(statusCode === 503, 'Unconfigured YOUTUBE_API_KEY cleanly returns HTTP 503 Service Unavailable');
  assert(responseData?.error === 'YouTube API service unconfigured on server.', 'Error message safely protects server configuration');

  // Test 2: Endpoint structure smoke test with active server key
  process.env.YOUTUBE_API_KEY = 'smoke_test_key';
  
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    if (url.includes('/playlists')) {
      return {
        ok: true,
        json: async () => ({
          items: [{
            snippet: {
              title: 'Namaste React Course',
              description: 'Complete React Series',
              channelTitle: 'Akshay Saini',
              thumbnails: { high: { url: 'https://img.youtube.com/vi/mock/hqdefault.jpg' } }
            }
          }]
        })
      };
    }
    if (url.includes('/playlistItems')) {
      return {
        ok: true,
        json: async () => ({
          items: [{
            snippet: { title: 'Episode 1: Inception', description: 'React basics', thumbnails: { high: { url: '' } } },
            contentDetails: { videoId: 'ep1_react' }
          }],
          nextPageToken: ''
        })
      };
    }
    if (url.includes('/videos')) {
      return {
        ok: true,
        json: async () => ({
          items: [{ id: 'ep1_react', contentDetails: { duration: 'PT42M15S' } }]
        })
      };
    }
    return { ok: true, json: async () => ({ items: [] }) };
  };

  let smokeStatus = 0;
  let smokeBody = null;
  const reqSmoke = { method: 'GET', query: { playlistId: 'PLu71SKxNbfoBuX3f4EOACle2y-tRC5Q37' } };
  const resSmoke = {
    setHeader: () => {},
    status: (code) => { smokeStatus = code; return resSmoke; },
    json: (data) => { smokeBody = data; return resSmoke; }
  };

  await handler(reqSmoke, resSmoke);

  assert(smokeStatus === 200, 'HTTP GET /api/youtube returns HTTP 200 OK');
  assert(smokeBody?.course?.title === 'Namaste React Course', 'Response contains valid course object');
  assert(smokeBody?.lessons?.length === 1, 'Response contains non-empty lessons array');
  assert(smokeBody?.lessons[0]?.title === 'Episode 1: Inception', 'Lesson title is populated');
  assert(smokeBody?.lessons[0]?.duration === '42:15', 'Lesson duration parsed cleanly');

  // Verify zero API key exposure in response body or JSON string
  const rawResponseString = JSON.stringify(smokeBody);
  assert(!rawResponseString.includes('smoke_test_key') && !rawResponseString.includes('AIza'), 'No API key string appears in response payload');

  if (savedKey) process.env.YOUTUBE_API_KEY = savedKey;
  else delete process.env.YOUTUBE_API_KEY;
  globalThis.fetch = originalFetch;

  console.log(`\nSmoke Test Results: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runLiveSmokeTest();
