import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

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

async function runPracticeUrlRoundTripTest() {
  console.log('--- Step 4: Backup Practice URL Variants Round-Trip Test ---');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:5173/settings', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const testBackupPath = path.resolve('scripts/verification/phase1/practice_urls_backup.json');
    const testPayload = {
      version: 1,
      exportedAt: Date.now(),
      courses: [{
        id: 'c_url_test',
        title: 'URL Test Course',
        description: 'Testing URL variants',
        type: 'youtube'
      }],
      lessons: [{
        id: 'l_url_test',
        courseId: 'c_url_test',
        title: 'URL Test Lesson',
        index: 1,
        type: 'youtube'
      }],
      progress: [],
      notes: [],
      practiceProgress: [
        {
          id: 'l_url_test_0',
          courseId: 'c_url_test',
          lessonId: 'l_url_test',
          practiceUrl: 'https://leetcode.com/problems/two-sum',
          completed: true,
          completedAt: Date.now()
        },
        {
          id: 'l_url_test_1',
          courseId: 'c_url_test',
          lessonId: 'l_url_test',
          practiceUrl: '',
          completed: false
        },
        {
          id: 'l_url_test_2',
          courseId: 'c_url_test',
          lessonId: 'l_url_test',
          practiceUrl: null,
          completed: false
        },
        {
          id: 'l_url_test_3',
          courseId: 'c_url_test',
          lessonId: 'l_url_test',
          completed: true
        }
      ]
    };

    fs.writeFileSync(testBackupPath, JSON.stringify(testPayload), 'utf-8');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testBackupPath);
    await page.waitForSelector('div[class*="text-emerald-400"]', { timeout: 5000 });

    const successText = await page.locator('div[class*="text-emerald-400"]').first().innerText();
    assert(successText.includes('Backup restored successfully'), 'Backup containing all 4 practiceUrl variants restored successfully');

    if (fs.existsSync(testBackupPath)) fs.unlinkSync(testBackupPath);

    const records = await page.evaluate(async () => {
      const indexedDB = window.indexedDB;
      return new Promise((resolve) => {
        const req = indexedDB.open('FocusFlowDB');
        req.onsuccess = (e) => {
          const db = e.target.result;
          const tx = db.transaction('practiceProgress', 'readonly');
          const store = tx.objectStore('practiceProgress');
          const getAllReq = store.getAll();
          getAllReq.onsuccess = () => resolve(getAllReq.result);
        };
      });
    });

    console.log('Restored PracticeProgress records:', records);
    assert(records.length === 4, '4 PracticeProgress records restored');

    const rec0 = records.find(r => r.id === 'l_url_test_0');
    const rec1 = records.find(r => r.id === 'l_url_test_1');
    const rec2 = records.find(r => r.id === 'l_url_test_2');
    const rec3 = records.find(r => r.id === 'l_url_test_3');

    assert(rec0.practiceUrl === 'https://leetcode.com/problems/two-sum', 'Variant A (valid URL): preserved as "https://leetcode.com/problems/two-sum"');
    assert(rec1.practiceUrl === null, 'Variant B (legacy empty string ""): normalized to null');
    assert(rec2.practiceUrl === null, 'Variant C (explicit null): preserved as null');
    assert(rec3.practiceUrl === null, 'Variant D (missing property): defaulted to null');

  } catch (err) {
    console.error('Practice URL Round-Trip Error:', err);
    failed++;
  } finally {
    await browser.close();
  }

  console.log(`\nPractice URL Round-Trip Results: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runPracticeUrlRoundTripTest();
