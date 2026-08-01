import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import {
  buildPracticeCatalog,
  classifyPracticeRecord,
  createQuestionIdentity,
  getQuestionSolvedState
} from '../../../src/features/practice/practiceIdentity.js';

let passed = 0;
let failed = 0;
const assert = (condition, description) => {
  if (condition) { passed++; console.log(`[PASS] ${description}`); }
  else { failed++; console.error(`[FAIL] ${description}`); }
};

const topicBytes = readFileSync('src/data/jsTopicPractice.json');
const readingBytes = readFileSync('src/data/jsPracticeMap.json');
const modules = JSON.parse(topicBytes);
const readingMap = JSON.parse(readingBytes);
const catalog = buildPracticeCatalog(modules);
const questions = modules.flatMap(module => module.questions);
const descriptor = catalog.questionsById.get('q1_1')[0];
const canonicalId = createQuestionIdentity(descriptor);
const legacy = { id: 'route_lesson_q1_1', completed: true };
const canonicalFalse = { id: canonicalId, ...descriptor, completed: false };

assert(catalog.valid, 'static Practice catalog validates');
assert(modules.length === 18 && questions.length === 140, 'catalog retains 18 topics and 140 questions');
assert(catalog.identities.size === 140, 'all stable question identities are unique');
assert(canonicalId === 'practice-question:v1:javascript:cat-1-variables-datatypes:q1_1', 'stable identity is deterministic and route-independent');
assert(classifyPracticeRecord(legacy, catalog).status === 'legacy-unambiguous', 'legacy lesson/question record maps unambiguously');
assert(classifyPracticeRecord({ id: 'route_lesson_git_q1_1', completed: true }, catalog).descriptor.questionId === 'git_q1_1', 'longest suffix preserves legacy Git identity without a JavaScript collision');
assert(getQuestionSolvedState([legacy], descriptor, catalog), 'legacy solved record remains solved');
assert(!getQuestionSolvedState([legacy, canonicalFalse], descriptor, catalog), 'canonical state deduplicates and overrides retained legacy state');

const duplicateModules = structuredClone(modules);
duplicateModules[1].questions.push(structuredClone(duplicateModules[0].questions[0]));
const duplicateCatalog = buildPracticeCatalog(duplicateModules);
const ambiguous = classifyPracticeRecord(legacy, duplicateCatalog);
assert(!duplicateCatalog.valid && duplicateCatalog.issues.some(issue => issue.type === 'ambiguous-legacy-question-id'), 'duplicate question IDs are detected');
assert(ambiguous.status === 'legacy-ambiguous' && ambiguous.candidates.length === 2, 'ambiguous legacy records remain classified with candidates');
assert(classifyPracticeRecord({ id: 'unknown_record', completed: true }, catalog).status === 'stale', 'unreferenced legacy records remain recoverably classified');
assert(Object.keys(readingMap).every(key => !catalog.questionsById.has(key)), 'reading map lesson keys do not conflict with Practice question IDs');

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
assert(sha256(topicBytes) === 'd1a8cfd991866b119ec2ad5bfa2809af044094284f08061eadb5da8dfa3d69c5', 'Practice educational question content is byte-for-byte unchanged');
assert(sha256(readingBytes) === '3a956f4d7a1908cd2f71695a2136c37c26f70e1e2a5665efee34e4cde33856f1', 'reading educational content is byte-for-byte unchanged');

console.log(`\nPhase 7A identity results: ${passed} passed, ${failed} failed.`);
if (failed) process.exit(1);
