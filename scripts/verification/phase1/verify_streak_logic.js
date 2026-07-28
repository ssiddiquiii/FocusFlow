import { toLocalDateString, getActiveDateSet, calculateStreak } from '../../../src/utils/streakUtils.js';

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

console.log('--- Streak Logic & Local Date Normalization Verification ---');

const today = new Date();
const todayMs = today.getTime();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayMs = yesterday.getTime();

const todayStr = toLocalDateString(today);
const yesterdayStr = toLocalDateString(yesterday);

// Test 1: watchTime = 5s must NOT count
const set1 = getActiveDateSet([{ watchTime: 5, lastWatched: todayMs }]);
assert(!set1.has(todayStr), 'watchTime = 5s is NOT active');

// Test 2: watchTime = 600s must count
const set2 = getActiveDateSet([{ watchTime: 600, lastWatched: todayMs }]);
assert(set2.has(todayStr), 'watchTime = 600s IS active');

// Test 3: currentTime legacy fallback = 600s must count
const set3 = getActiveDateSet([{ currentTime: 600, updatedAt: todayMs }]);
assert(set3.has(todayStr), 'currentTime fallback = 600s IS active');

// Test 4: completed = true (even with 0 watchTime) must count
const set4 = getActiveDateSet([{ watchTime: 0, completed: true, lastWatched: todayMs }]);
assert(set4.has(todayStr), 'completed = true IS active');

// Test 5: Practice completion must count
const set5 = getActiveDateSet([], [{ completed: true, completedAt: todayMs }]);
assert(set5.has(todayStr), 'Practice completion IS active');

// Test 6: Midnight boundary check (23:59:59 vs 00:00:01)
const d1 = new Date(2026, 6, 15, 23, 59, 59); // July 15, 2026 23:59:59
const d2 = new Date(2026, 6, 16, 0, 0, 1);    // July 16, 2026 00:00:01
assert(toLocalDateString(d1) === '2026-07-15', 'Local date for 23:59:59 is 2026-07-15');
assert(toLocalDateString(d2) === '2026-07-16', 'Local date for 00:00:01 is 2026-07-16');

// Test 7: Consecutive streak calculation
const streak = calculateStreak([
  { watchTime: 600, lastWatched: todayMs },
  { watchTime: 650, lastWatched: yesterdayMs }
]);
assert(streak === 2, `Consecutive streak is 2 days (actual: ${streak})`);

console.log(`\nResults: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
