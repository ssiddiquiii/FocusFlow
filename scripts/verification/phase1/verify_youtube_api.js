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

console.log('--- YouTube Serverless API Endpoint Unit Verification ---');

async function runTests() {
  // Test 1: Method Not Allowed (POST) -> 405
  const { req: req1, res: res1 } = createMockReqRes('POST', { playlistId: 'PLu71SKxNbfoBuX3f4EOACle2y-tRC5Q37' });
  await handler(req1, res1);
  assert(res1.getStatusCode() === 405, 'POST request returns 405 Method Not Allowed');

  // Test 2: Invalid Playlist ID (too short) -> 400
  const { req: req2, res: res2 } = createMockReqRes('GET', { playlistId: 'short' });
  await handler(req2, res2);
  assert(res2.getStatusCode() === 400, 'Invalid playlist ID returns 400 Bad Request');

  // Test 3: Missing YOUTUBE_API_KEY -> 503
  delete process.env.YOUTUBE_API_KEY;
  const { req: req3, res: res3 } = createMockReqRes('GET', { playlistId: 'PLu71SKxNbfoBuX3f4EOACle2y-tRC5Q37' });
  await handler(req3, res3);
  assert(res3.getStatusCode() === 503, 'Missing process.env.YOUTUBE_API_KEY returns 503 Service Unavailable');
  assert(res3.getBody()?.error === 'YouTube API service unconfigured on server.', 'Error message cleanly returned without key exposure');

  // Test 4: OPTIONS preflight -> 200
  const { req: req4, res: res4 } = createMockReqRes('OPTIONS', {});
  await handler(req4, res4);
  assert(res4.getStatusCode() === 200, 'OPTIONS preflight returns 200 OK');

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runTests();
