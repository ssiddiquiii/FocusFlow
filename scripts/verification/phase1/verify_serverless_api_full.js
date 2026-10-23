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

function createMockReqRes(method, query) {
  const req = { method, query };
  let statusCode = 200;
  let headers = {};
  let body = null;

  const res = {
    setHeader: (k, v) => { headers[k] = v; },
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      body = data;
      return res;
    },
    end: () => res,
    getStatusCode: () => statusCode,
    getBody: () => body,
    getHeaders: () => headers
  };

  return { req, res };
}

console.log('--- Step 5: Serverless API Full Verification (api/youtube.js) ---');

async function runApiTests() {
  const originalFetch = globalThis.fetch;

  const { req: reqA, res: resA } = createMockReqRes('POST', { playlistId: 'PLu71SKxNbfoBuX3f4EOACle2y-tRC5Q37' });
  await handler(reqA, resA);
  assert(resA.getStatusCode() === 405, 'POST request returns 405 Method Not Allowed');

  const { req: reqB, res: resB } = createMockReqRes('GET', { playlistId: 'short<script>' });
  await handler(reqB, resB);
  assert(resB.getStatusCode() === 400, 'Malformed playlistId returns 400 Bad Request');

  const savedKey = process.env.YOUTUBE_API_KEY;
  delete process.env.YOUTUBE_API_KEY;
  const { req: reqC, res: resC } = createMockReqRes('GET', { playlistId: 'PLu71SKxNbfoBuX3f4EOACle2y-tRC5Q37' });
  await handler(reqC, resC);
  assert(resC.getStatusCode() === 503, 'Missing process.env.YOUTUBE_API_KEY returns 503 Service Unavailable');
  process.env.YOUTUBE_API_KEY = 'mock_server_key_for_testing';

  globalThis.fetch = async () => ({
    ok: false,
    status: 404,
    json: async () => ({ error: { message: 'Playlist not found' } })
  });
  const { req: reqD, res: resD } = createMockReqRes('GET', { playlistId: 'PLu71SKxNbfoBuX3f4EOACle2y-tRC5Q37' });
  await handler(reqD, resD);
  assert(resD.getStatusCode() === 404, 'Upstream 404 maps to 404 Not Found');

  globalThis.fetch = async () => ({
    ok: false,
    status: 403,
    json: async () => ({ error: { message: 'Quota exceeded' } })
  });
  const { req: reqE, res: resE } = createMockReqRes('GET', { playlistId: 'PLu71SKxNbfoBuX3f4EOACle2y-tRC5Q37' });
  await handler(reqE, resE);
  assert(resE.getStatusCode() === 429, 'Upstream quota 403/429 maps to 429 Too Many Requests');

  globalThis.fetch = async () => {
    throw new TypeError('Failed to fetch');
  };
  const { req: reqF, res: resF } = createMockReqRes('GET', { playlistId: 'PLu71SKxNbfoBuX3f4EOACle2y-tRC5Q37' });
  await handler(reqF, resF);
  assert(resF.getStatusCode() === 502, 'Upstream network failure maps to 502 Bad Gateway');

  globalThis.fetch = async () => {
    const err = new Error('The operation was aborted');
    err.name = 'AbortError';
    throw err;
  };
  const { req: reqG, res: resG } = createMockReqRes('GET', { playlistId: 'PLu71SKxNbfoBuX3f4EOACle2y-tRC5Q37' });
  await handler(reqG, resG);
  assert(resG.getStatusCode() === 504, 'Upstream 10s timeout maps to 504 Gateway Timeout');

  globalThis.fetch = async (url) => {
    if (url.includes('/playlists')) {
      return {
        ok: true,
        json: async () => ({
          items: [{ snippet: { title: 'Huge Playlist', description: 'Over 200 videos' } }]
        })
      };
    }
    if (url.includes('/playlistItems')) {
      const items = Array.from({ length: 201 }, (_, i) => ({
        snippet: { title: `Video ${i + 1}`, description: '' },
        contentDetails: { videoId: `video_${i + 1}` }
      }));
      return {
        ok: true,
        json: async () => ({ items, nextPageToken: '' })
      };
    }
    return { ok: true, json: async () => ({ items: [] }) };
  };
  const { req: reqH, res: resH } = createMockReqRes('GET', { playlistId: 'PLu71SKxNbfoBuX3f4EOACle2y-tRC5Q37' });
  await handler(reqH, resH);
  assert(resH.getStatusCode() === 400, 'Playlist exceeding 200 videos returns 400 Bad Request');
  assert(resH.getBody()?.error.includes('200 videos'), 'Returns clear 200 video limit error message');

  globalThis.fetch = async (url) => {
    if (url.includes('/playlists')) {
      return {
        ok: true,
        json: async () => ({
          items: [{ snippet: { title: 'Valid JavaScript Course', description: 'JS Tutorial', channelTitle: 'Chai aur Code' } }]
        })
      };
    }
    if (url.includes('/playlistItems')) {
      return {
        ok: true,
        json: async () => ({
          items: [{
            snippet: { title: 'JS Lesson 1', description: 'Intro' },
            contentDetails: { videoId: 'v12345' }
          }],
          nextPageToken: ''
        })
      };
    }
    if (url.includes('/videos')) {
      return {
        ok: true,
        json: async () => ({
          items: [{ id: 'v12345', contentDetails: { duration: 'PT15M30S' } }]
        })
      };
    }
    return { ok: true, json: async () => ({ items: [] }) };
  };

  const { req: reqI, res: resI } = createMockReqRes('GET', { playlistId: 'PLu71SKxNbfoBuX3f4EOACle2y-tRC5Q37' });
  await handler(reqI, resI);
  assert(resI.getStatusCode() === 200, 'Valid public playlist returns 200 OK');
  
  const bodyI = resI.getBody();
  assert(bodyI?.course?.title === 'Valid JavaScript Course', 'Response contains valid course title');
  assert(bodyI?.lessons?.length === 1, 'Response contains valid lessons array');
  assert(bodyI?.lessons[0]?.duration === '15:30', 'Video duration parsed as 15:30');
  assert(resI.getHeaders()['Cache-Control'].includes('s-maxage=3600'), 'Cache-Control header set for 1 hour');

  if (savedKey) process.env.YOUTUBE_API_KEY = savedKey;
  else delete process.env.YOUTUBE_API_KEY;
  globalThis.fetch = originalFetch;

  console.log(`\nAPI Test Results: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runApiTests();
