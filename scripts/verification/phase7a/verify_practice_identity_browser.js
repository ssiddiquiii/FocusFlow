import { chromium } from 'playwright';

const BASE_URL = process.env.FOCUSFLOW_TEST_BASE_URL || 'http://127.0.0.1:4173';
let passed = 0;
let failed = 0;
const assert = (condition, description) => {
  if (condition) { passed++; console.log(`[PASS] ${description}`); }
  else { failed++; console.error(`[FAIL] ${description}`); }
};

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  const result = await page.evaluate(async () => {
    const { db } = await import('/src/db/FocusFlowDB.js');
    const { togglePractice } = await import('/src/services/dataCommands.js');
    const { practiceCatalog } = await import('/src/features/practice/practiceCatalog.js');
    const { getQuestionSolvedState } = await import('/src/features/practice/practiceIdentity.js');
    const tables = [db.courses, db.lessons, db.progress, db.notes, db.practiceProgress];
    await db.transaction('rw', tables, () => Promise.all(tables.map(table => table.clear())));
    const course = { id: 'phase7a-course', title: 'Phase 7A', description: '', thumbnailUrl: '', channelName: 'Test', type: 'youtube', udemyUrl: '' };
    const lesson = { id: 'phase7a_lesson', courseId: course.id, title: 'Lesson', description: '', thumbnailUrl: '', duration: '1:00', index: 1, type: 'youtube' };
    await db.courses.add(course);
    await db.lessons.add(lesson);
    const descriptor = practiceCatalog.questionsById.get('q1_1')[0];
    const oldBackup = { version: 1, exportedAt: Date.now(), courses: [course], lessons: [lesson], progress: [], notes: [], practiceProgress: [{ id: `${lesson.id}_q1_1`, courseId: course.id, lessonId: lesson.id, practiceUrl: '', completed: true, completedAt: Date.now() }] };
    await db.importBackup(oldBackup);
    const oldExport = await db.exportBackup();
    const legacyRecord = oldExport.practiceProgress[0];
    const legacySolved = getQuestionSolvedState(oldExport.practiceProgress, descriptor, practiceCatalog);

    await togglePractice(course.id, lesson.id, { ...descriptor, practiceUrl: null }, false);
    const afterUnmark = await db.practiceProgress.toArray();
    const unmarked = !getQuestionSolvedState(afterUnmark, descriptor, practiceCatalog);
    const legacyPreserved = afterUnmark.some(record => record.id === `${lesson.id}_q1_1` && record.completed === false);
    await togglePractice(course.id, lesson.id, { ...descriptor, practiceUrl: null }, true);
    const newBackup = await db.exportBackup();
    const canonical = newBackup.practiceProgress.find(record => record.identityVersion === 1);
    await db.importBackup(newBackup);
    const roundtrip = await db.exportBackup();

    await db.progress.put({ id: 'sentinel', courseId: course.id, lessonId: lesson.id, completed: true, watchTime: 9, currentTime: 7, lastWatched: Date.now() });
    const sentinelBefore = await db.progress.get('sentinel');
    let rejected = false;
    try { await db.importBackup({ ...newBackup, practiceProgress: [{ ...canonical, lessonId: 'missing' }] }); }
    catch { rejected = true; }
    const sentinelAfter = await db.progress.get('sentinel');
    return {
      dbVersion: db.verno,
      legacyRecord,
      legacySolved,
      unmarked,
      legacyPreserved,
      canonical,
      roundtripCanonical: roundtrip.practiceProgress.find(record => record.identityVersion === 1),
      rejected,
      sentinelPreserved: JSON.stringify(sentinelBefore) === JSON.stringify(sentinelAfter),
      currentTime: sentinelAfter.currentTime,
      countBefore: newBackup.practiceProgress.length,
      countAfter: roundtrip.practiceProgress.length
    };
  });

  assert(result.dbVersion === 3, 'Dexie remains version 3');
  assert(result.legacyRecord.practiceUrl === null && result.legacySolved, 'old backup normalizes nullable URL and preserves solved state');
  assert(result.unmarked && result.legacyPreserved, 'unmark preserves the legacy row without stale solved-state duplication');
  assert(result.canonical?.questionId === 'q1_1' && result.canonical?.topicId === 'cat-1-variables-datatypes', 'new record exports understandable stable identity metadata');
  assert(JSON.stringify(result.canonical) === JSON.stringify(result.roundtripCanonical), 'new backup round-trips canonical Practice records');
  assert(result.countBefore === result.countAfter, 'backup round-trip preserves every Practice record count');
  assert(result.rejected && result.sentinelPreserved, 'invalid backup rejects atomically and preserves sentinel data');
  assert(result.currentTime === 7, 'legacy currentTime survives Phase 7A data paths');
} finally {
  await browser.close();
}

console.log(`\nPhase 7A browser results: ${passed} passed, ${failed} failed.`);
if (failed) process.exit(1);
