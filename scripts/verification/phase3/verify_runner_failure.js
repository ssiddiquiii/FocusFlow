import { spawn } from 'node:child_process';

const child = spawn(
  process.execPath,
  ['scripts/verification/run-suite.js', 'probe-failure'],
  { cwd: process.cwd(), stdio: 'pipe' }
);

let stderr = '';
child.stderr.on('data', chunk => {
  stderr += chunk;
});

child.once('error', error => {
  console.error(error);
  process.exit(1);
});

child.once('exit', code => {
  const propagatedFailure = code !== 0 && stderr.includes('[expected failure]');
  if (!propagatedFailure) {
    console.error(`[FAIL] verification runner returned ${code} without propagating the fixture failure`);
    process.exit(1);
  }
  console.log(`[PASS] verification runner propagates a non-zero child exit (runner exit ${code})`);
});
