import fs from 'fs';
import path from 'path';

console.log('--- Production Bundle Google API Key Audit ---');

const distAssetsDir = path.resolve('dist/assets');

if (!fs.existsSync(distAssetsDir)) {
  console.error(`[FAIL] Production assets directory not found at ${distAssetsDir}. Did 'npm run build' run?`);
  process.exit(1);
}

const files = fs.readdirSync(distAssetsDir).filter(f => f.endsWith('.js'));
const googleApiKeyRegex = /AIza[0-9A-Za-z-_]{35}/g;
const viteEnvRegex = /VITE_YOUTUBE_API_KEY/g;

let matchesFound = 0;

files.forEach(file => {
  const filePath = path.join(distAssetsDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');

  const keyMatches = content.match(googleApiKeyRegex) || [];
  const envMatches = content.match(viteEnvRegex) || [];

  if (keyMatches.length > 0) {
    console.error(`[FAIL] ${file} contains ${keyMatches.length} Google API Key pattern matches!`);
    matchesFound += keyMatches.length;
  }

  if (envMatches.length > 0) {
    console.error(`[FAIL] ${file} contains ${envMatches.length} VITE_YOUTUBE_API_KEY references!`);
    matchesFound += envMatches.length;
  }
});

if (matchesFound === 0) {
  console.log(`[PASS] Verified ${files.length} production bundle JS assets: 0 Google API key patterns found.`);
  process.exit(0);
} else {
  console.error(`[FAIL] Total ${matchesFound} security violations detected in production bundle.`);
  process.exit(1);
}
