import { PracticeProgressSchema } from '../../../src/types/schemas.js';

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

console.log('--- PracticeProgressSchema practiceUrl Normalization Verification ---');

// Test 1: Valid URL string -> preserved
const res1 = PracticeProgressSchema.parse({
  id: 'lesson1_0',
  courseId: 'c1',
  lessonId: 'l1',
  practiceUrl: 'https://leetcode.com/problems/two-sum',
  completed: true
});
assert(res1.practiceUrl === 'https://leetcode.com/problems/two-sum', 'Valid URL preserved: ' + res1.practiceUrl);

// Test 2: Legacy empty string "" -> normalized to null
const res2 = PracticeProgressSchema.parse({
  id: 'lesson1_1',
  courseId: 'c1',
  lessonId: 'l1',
  practiceUrl: '',
  completed: false
});
assert(res2.practiceUrl === null, 'Empty string "" normalized to null: ' + JSON.stringify(res2.practiceUrl));

// Test 3: Explicit null -> allowed as null
const res3 = PracticeProgressSchema.parse({
  id: 'lesson1_2',
  courseId: 'c1',
  lessonId: 'l1',
  practiceUrl: null,
  completed: false
});
assert(res3.practiceUrl === null, 'Explicit null preserved as null: ' + JSON.stringify(res3.practiceUrl));

// Test 4: Missing practiceUrl property -> defaults to null
const res4 = PracticeProgressSchema.parse({
  id: 'lesson1_3',
  courseId: 'c1',
  lessonId: 'l1',
  completed: false
});
assert(res4.practiceUrl === null, 'Missing property defaults to null: ' + JSON.stringify(res4.practiceUrl));

console.log(`\nResults: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
