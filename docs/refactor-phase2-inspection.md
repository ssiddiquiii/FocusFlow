# FocusFlow Refactor — Phase 2 Inspection Report (Final Revised)

**Phase Name:** Phase 2 — Application Bootstrap and Data Access Architecture  
**Inspection Basis:** Detailed repository audit of `FocusFlowDB.js`, `schemas.js`, `useFocusFlow.js`, `youtubeApi.js`, and component consumers  
**Primary Objective:** Decouple monolithic data access, eliminate redundant live query subscriptions, fix multi-trigger database initialization, and establish an isolated, high-performance data architecture.

---

## 1. Exact Dexie Schema & Index Reality Audit

### 1.1 Current Table Declarations (`FocusFlowDB.js` Version 3)

```javascript
this.version(3).stores({
  courses: 'id, title, type',
  lessons: 'id, courseId, index, type',
  progress: 'id, courseId, lessonId, completed, lastWatched',
  notes: '++id, courseId, lessonId, [courseId+lessonId], timestamp',
  practiceProgress: 'id, courseId, lessonId, completed'
});
```

### 1.2 Table Primary Keys & Index Audit Matrix

| Table | Primary Key | Single Indexes | Compound Indexes | Multi-Entry Indexes |
|---|---|---|---|---|
| `courses` | `id` (string) | `title`, `type` | None | None |
| `lessons` | `id` (string) | `courseId`, `index`, `type` | None | None |
| `progress` | `id` (string: `${courseId}_${lessonId}`) | `courseId`, `lessonId`, `completed`, `lastWatched` | None | None |
| `notes` | `++id` (auto-increment integer) | `courseId`, `lessonId`, `timestamp` | `[courseId+lessonId]` | None |
| `practiceProgress` | `id` (string: `${lessonId}_${practiceIndex}`) | `courseId`, `lessonId`, `completed` | None | None |

### 1.3 IndexedDB Specification & Query Reality

> [!IMPORTANT]
> **IndexedDB Key Characteristic Rule:** According to W3C IndexedDB Specification Section 3.3.1, boolean values (`true`/`false`) are **NOT valid IndexedDB keys**.
> Therefore, attempting `db.progress.where('completed').equals(true)` is INVALID in IndexedDB and cannot be used for boolean equality filtering.

### 1.4 Query Compatibility & Index Mapping Evaluation

| Proposed Query Pattern | Supported by Current Schema? | Exact Index Used | Fallback / Execution Strategy | Dexie Migration Required? |
|---|:---:|---|---|:---:|
| `db.courses.toArray()` | **Yes** | Primary key scan | Preserves catalog storage order | **No** |
| `db.courses.get(courseId)` | **Yes** | Primary key `id` | Direct key lookup | **No** |
| `db.lessons.where('courseId').equals(courseId).sortBy('index')` | **Yes** | Index `courseId` | Indexed query + index sort | **No** |
| `db.progress.where('courseId').equals(courseId).toArray()` | **Yes** | Index `courseId` | Scoped indexed query | **No** |
| `db.progress.get(`${courseId}_${lessonId}`)` | **Yes** | Primary key `id` | Direct key lookup | **No** |
| `db.notes.where({ courseId, lessonId }).sortBy('timestamp')` | **Yes** | Compound index `[courseId+lessonId]` | Compound indexed lookup | **No** |
| `db.practiceProgress.toArray()` | **Yes** | Primary key scan | Table scan | **No** |
| `db.practiceProgress.where('lessonId').equals(lessonId).toArray()` | **Yes** | Index `lessonId` | Scoped indexed query | **No** |
| `Dashboard Progress Stats Query` | **Yes** | Table scan on `progress` | Single load of `progress.toArray()`, calculate `completed` and `watchTime` in JS | **No** |

**Final Migration Decision:** **ZERO Dexie schema migrations required.** All required scoped data access patterns are natively supported by the existing Dexie Schema Version 3.

---

## 2. Verified Record Primary Keys & Identity Formats

Proven directly from `FocusFlowDB.js`, `schemas.js`, and `useFocusFlow.js`:

1. **`courses` Primary Key**: `id` string (e.g. `'udemy-agentic-ai'`, `'PLu71SKxNbfoBuX3f4EOACle2y-tRC5Q37'`).
2. **`lessons` Primary Key**: `id` string (e.g. `'lesson_1_1'`, `'v12345'`).
3. **`progress` Primary Key**: `id` string = `${courseId}_${lessonId}` (Proven in `useFocusFlow.js` L155 and `schemas.js` L39).
4. **`notes` Primary Key**: `id` auto-increment integer = Dexie `++id` (Proven in `schemas.js` L52).
5. **`practiceProgress` Primary Key**: `id` string = `${lessonId}_${practiceIndex}` (Proven in `useFocusFlow.js` L228 and `schemas.js` L66).

### 2.1 Lesson Primary-Key Collision Analysis (Baseline Identity Limitation)
- **Primary Key:** `id` (string).
- **Imported YouTube Lessons:** Use YouTube video ID string (e.g. `'v123'`).
- **Same YouTube Video in Two Courses:**
  - `db.lessons.bulkPut` performs a Dexie `put` on matching `id`, **overwriting the existing lesson record**.
  - The `courseId` property on the lesson record in `db.lessons` updates to the second course's ID.
  - The two courses CANNOT retain independent copies of the same video under the current schema.
  - `progress` records (`${courseId}_${lessonId}`) remain under Course A, but Course A's query `where('courseId').equals(courseA)` will no longer find the overwritten lesson.
  - `practiceProgress` records (`${lessonId}_${practiceIndex}`) will be shared if the video ID and practice index match.
- **Phase 2 Decision:** **Do NOT change the lesson ID format in Phase 2.** Deferred as an existing identity limitation to the later Practice/data-identity phase. Phase 2 command extraction preserves current behavior strictly.

---

## 3. Persistent Initialization Marker & Exact Seeding Policy

### 3.1 Initialization Marker Decision
- **Inspection Finding:** No persistent first-run or seeding initialization marker currently exists in `FocusFlowDB.js`, `useFocusFlow.js`, or `localStorage`.
- **Proposed Versioned Marker Key:** `focusflow.initialSeedCompleted.v1`
- **Storage Location:** Browser `window.localStorage`
- **Why No Dexie Migration Is Required:** Storing the initialization marker in `localStorage` completely decouples it from IndexedDB schema stores. No new Dexie table is defined, leaving `FocusFlowDB.js` strictly at Schema Version 3 (`this.version(3)`).

### 3.2 Exact Startup Seeding Policy Matrix

| Case | Startup State Condition | Required Action | Product Rationale |
|---|---|---|---|
| **A** | **Marker absent AND all 5 tables empty** | **Seed default courses & lessons in ONE transaction**, then write marker `focusflow.initialSeedCompleted.v1 = 'true'`. | First-ever fresh installation receives default seed catalog. |
| **B** | **Marker absent BUT any table contains existing data** | **Do NOT seed.** Write marker `focusflow.initialSeedCompleted.v1 = 'true'` immediately. | Existing installations upgrading to this version preserve all existing user notes/progress/courses without default re-injection. |
| **C** | **Marker present AND all tables contain data** | **Do NOT seed.** Proceed cleanly to `'ready'`. | Normal application startup with active user data. |
| **D** | **Marker present AND all 5 tables are empty** | **Do NOT seed.** Proceed cleanly to `'ready'`. | Intentionally empty database (e.g. user deleted all courses). Prevents defaults from returning automatically. |
| **E** | **Marker present AND database is partially populated** | **Do NOT seed or repair.** Proceed cleanly to `'ready'`. | Partial database (e.g. user deleted default courses but kept notes, or imported custom courses). No silent repair. |
| **F** | **Marker storage cleared (localStorage wiped) BUT IndexedDB still contains user data** | **Do NOT seed.** Write marker `focusflow.initialSeedCompleted.v1 = 'true'` immediately. | Fallback check against IndexedDB record counts ensures user data is NEVER overwritten if localStorage is cleared. |

### 3.3 Transactional Initial Seed
Seeding default courses and lessons occurs within ONE single Dexie readwrite transaction (`this.transaction('rw', [this.courses, this.lessons], ...)`):
- Step 1: Clean up legacy course IDs (`udemy-agentic-ai`, `PLu71SKxNbfoDqgPchmvIsL4hTnJIrtige`, `PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW`, `PLd1s-PEC5Pio`).
- Step 2: Bulk add default courses (`this.courses.bulkAdd(seedCourses)`).
- Step 3: Bulk add default lessons (`this.lessons.bulkAdd(seedLessons)`).
- **Atomic Rollback Guarantee:** If any write operation fails or aborts, Dexie automatically rolls back the entire transaction.
- **Marker Commit:** The initialization marker (`localStorage.setItem('focusflow.initialSeedCompleted.v1', 'true')`) is written ONLY after the seed transaction successfully commits.

### 3.4 Atomic Factory Reset Policy
Factory reset (`resetDatabase()`) executes in ONE single Dexie readwrite transaction covering all 5 tables:
- Clears `courses`, `lessons`, `progress`, `notes`, and `practiceProgress`.
- Writes default seed courses and lessons inside the exact same transaction.
- Sets marker `focusflow.initialSeedCompleted.v1 = 'true'` after transaction commit.
- **Rollback Guarantee:** If any clear or write operation fails, the full factory reset rolls back completely.

### 3.5 Migration Decision
**Dexie migration required: NO**  
*Rationale:* The initialization marker `focusflow.initialSeedCompleted.v1` is stored in browser `localStorage`. No Dexie tables, schemas, or version declarations are altered. IndexedDB schema remains strictly Version 3 (`this.version(3)`).

---

## 4. Concrete Application Startup Architecture

```text
[React Root (main.jsx)]
       ↓
  BootstrapGate
       ├── State: 'initializing' ──> Render Loading Skeleton UI
       ├── State: 'failed'       ──> Render Fatal Database Error UI with [Retry Database] Button
       └── State: 'ready'        ──> Render App Router (<App />)
```

- **Single-Flight Promise & Retry:**
  ```javascript
  let bootstrapPromise = null;

  export function bootstrapApp() {
    if (!bootstrapPromise) {
      bootstrapPromise = (async () => {
        await db.open();
        await seedInitialDataIfRequired();
      })().catch((err) => {
        bootstrapPromise = null; // Reset lock so Retry can re-attempt
        throw err;
      });
    }
    return bootstrapPromise;
  }

  export function retryBootstrap() {
    bootstrapPromise = null;
    return bootstrapApp();
  }
  ```

---

## 5. Phase 2B: Database Command Semantics & Extraction Audit

### 5.1 Exact `togglePractice` Semantics
- **Final Primary Key:** `id = `${lessonId}_${practiceIndex}`` (e.g. `'v123_0'`).
- **`practiceUrl` Storage Value:** Passed string URL, empty string `""`, or `null`.
- **Fields Written (`completed === true`):** `id`, `courseId`, `lessonId`, `practiceUrl`, `completed: true`, `completedAt: Date.now()`.
- **`completedAt` Behavior:** Recreated (`Date.now()`) on EVERY call where `completed === true`.
- **Behavior when `completed === false`:** Calls `db.practiceProgress.delete(id)`. Unchecking a practice challenge DELETES the row from IndexedDB.
- **Exact Dexie Return Value:**
  - `completed === true`: `Promise<string>` (returns primary key string `id`).
  - `completed === false`: `Promise<void>`.
- **Caller Usage:** Neither `PracticeHub.jsx` nor `Watch.jsx` captures or uses the return value.
- **Error Propagation:** Dexie write/delete errors propagate naturally to caller.

### 5.2 Progress Record Preservation & `saveProgress` Contract
- **Record Shape:** `{ id, courseId, lessonId, completed, watchTime, lastWatched, updatedAt }`.
- **Meaning of `watchTime`**: Current playback position in seconds (`Math.round(seconds)`).
- **Meaning of `currentTime`**: Legacy fallback field present in older progress records.
- **Sticky Completion Merger:**
  ```javascript
  export async function saveProgress(courseId, lessonId, seconds, completed = false) {
    const progressId = `${courseId}_${lessonId}`;
    const now = Date.now();
    const existing = await db.progress.get(progressId);

    const isCompleted = completed || (existing ? existing.completed === true : false);

    await db.progress.put({
      ...existing,
      id: progressId,
      courseId,
      lessonId,
      completed: isCompleted,
      watchTime: Math.round(seconds),
      lastWatched: now,
      updatedAt: now
    });
  }
  ```

### 5.3 Final Phase 2B Command Matrix (10 Active Commands)

| Command | Signature | Existing / Corrected | Return Value | Errors | Callers | Final Implementation Decision |
|---|---|---|---|---|---|---|
| **`importCourse`** | `importCourse(course, lessonsList)` | Existing | `Promise<void>` | Zod validation / Dexie transaction errors | `ImportPlaylistModal.jsx` | Move to `src/services/dataCommands.js` |
| **`deleteCourse`** | `deleteCourse(courseId)` | Existing | `Promise<void>` | Dexie transaction errors | `Dashboard.jsx` | Move to `src/services/dataCommands.js` |
| **`saveProgress`** | `saveProgress(courseId, lessonId, seconds, completed)` | Corrected | `Promise<void>` | Dexie write errors | `Watch.jsx` | Correct sticky completion merge in `src/services/dataCommands.js` |
| **`createNote`** | `createNote({ courseId, lessonId, timestamp, content })` | Existing | `Promise<number>` | Dexie write errors | `Watch.jsx` | Move to `src/services/dataCommands.js` |
| **`deleteNote`** | `deleteNote(noteId)` | Existing | `Promise<void>` | Dexie delete errors | `Watch.jsx` | Move to `src/services/dataCommands.js` |
| **`togglePractice`** | `togglePractice(courseId, lessonId, practiceIndex, practiceUrl, completed)` | Existing | `Promise<string \| void>` | Dexie write/delete errors | `PracticeHub.jsx`, `Watch.jsx` | Move to `src/services/dataCommands.js` |
| **`exportBackup`** | `exportBackup()` | Existing | `Promise<BackupPayload>` | Zod parse / Dexie read errors | `Settings.jsx` | Direct arrow wrapper `export const exportBackup = () => db.exportBackup();` |
| **`importBackup`** | `importBackup(rawBackup)` | Existing | `Promise<void>` | Zod parse / Dexie transaction errors | `Settings.jsx` | Direct arrow wrapper `export const importBackup = (b) => db.importBackup(b);` |
| **`clearProgressAndNotes`** | `clearProgressAndNotes()` | Existing | `Promise<void>` | Dexie transaction errors | `Settings.jsx` | Direct arrow wrapper `export const clearProgressAndNotes = () => db.clearProgressAndNotes();` |
| **`resetDatabase`** | `resetDatabase()` | Existing | `Promise<void>` | Dexie transaction errors | `Settings.jsx` | Direct arrow wrapper `export const resetDatabase = () => db.resetDatabase();` |

---

## 6. Complete Consumer Replacement Mapping

| Consumer Component | Current Destructured Properties | Replacement Hooks / Services | Secret `useFocusFlow` Call? |
|---|---|---|:---:|
| [`Dashboard.jsx`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/src/pages/Dashboard.jsx) | `courses`, `stats`, `isInitializing`, `getContinueLearningPath`, `deleteCourse` | `useDashboardData()`, `deleteCourse`, `importCourse`, `exportNotes` | **NO** |
| [`CourseDetail.jsx`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/src/pages/CourseDetail.jsx) | `courses`, `lessons`, `progressList`, `getCourseProgress`, `getLastWatchedLesson` | `useCourseDetail(courseId)` | **NO** |
| [`Watch.jsx`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/src/pages/Watch.jsx) | `courses`, `lessons`, `progressList`, `practiceProgressList`, `saveProgress`, `togglePractice` | `useCourse(courseId)`, `useCourseLessons(courseId)`, `useCourseProgress(courseId)`, `useLessonProgress(cId, lId)`, `useLessonNotes(cId, lId)`, `useLessonPracticeProgress(cId, lId)`, `saveProgress()`, `togglePractice()`, Note CRUD | **NO** |
| [`PracticeHub.jsx`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/src/pages/PracticeHub.jsx) | `practiceProgressList`, `togglePractice` | `usePracticeProgress()`, `togglePractice()` | **NO** |
| [`Settings.jsx`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/src/pages/Settings.jsx) | `exportBackup`, `importBackup`, `resetDatabase`, `clearProgressAndNotes` | Direct Service Commands (`exportBackup`, `importBackup`, `resetDatabase`, `clearProgressAndNotes`) | **NO** |
| [`ImportPlaylistModal.jsx`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/src/components/ImportPlaylistModal.jsx) | `importCourse` | Direct Service Command (`importCourse`) | **NO** |

---

## 7. Staged Implementation Sequence

1. **Stage 1: Single-Flight Bootstrap & Persistent Seeder Policy** (`src/db/bootstrap.js`, `FocusFlowDB.js`)
2. **Stage 2: Named Service Commands Extraction** (`src/services/dataCommands.js`)
3. **Stage 3: Pure Selectors** (`src/utils/selectors.js`)
4. **Stage 4: Scoped Reactive Data Hooks Creation** (`src/hooks/useDashboardData.js`, `src/hooks/useCourseDetail.js`)
5. **Stage 5: Migrate `Settings.jsx` and `ImportPlaylistModal.jsx`**
6. **Stage 6: Migrate `PracticeHub.jsx`**
7. **Stage 7: Migrate `CourseDetail.jsx`**
8. **Stage 8: Migrate `Dashboard.jsx`**
9. **Stage 9: Migrate `Watch.jsx` Last** (Data-access substitutions only — ZERO changes to player controls, timing, notes UI, or layout)
10. **Stage 10: Confirm Zero `useFocusFlow` Consumers & Deprecate Monolithic Hook**
11. **Stage 11: Run Verification Suite & Quality Gates**

---

## 8. Executable Verification Strategy & Quality Gates

### 8.1 Browser Playwright IndexedDB Test Environment (`scripts/verification/phase2/`)
- **`verify_single_bootstrap.js`**: Verify concurrent startup calls share single-flight promise and execute database initialization ONCE.
- **`verify_bootstrap_retry.js`**: Verify failed database opening resets `bootstrapPromise` and allows successful retry via `retryBootstrap()`.
- **`verify_seeder_policy.js`**: Verify default courses are seeded ONLY when all 5 tables are empty, and user edits / partial databases are NOT overwritten under cases A–F.
- **`verify_scoped_queries.js`**: Verify `useCourseLessons` returns ONLY lessons matching `courseId`.
- **`verify_rerender_isolation.js`**: Playwright render-counter test verifying that note edits in `Watch` do NOT trigger rerenders in `Settings.jsx` or `PracticeHub.jsx`.
- **`verify_backup_roundtrip_phase2.js`**: Backup export/import regression test.

### 8.2 Quality Gates
- **Linter Check (`npm run lint`):** MUST have 0 errors. Warning count must not increase above baseline (**<= 67 warnings**).
- **Production Build (`npm run build`):** MUST complete cleanly.

---

## 9. Phase 2C-1: Reactive Data Contracts — Dashboard.jsx & CourseDetail.jsx

### 9.1 Dashboard.jsx — Current Data Flow Audit

#### 9.1.1 Properties Destructured from `useFocusFlow()`

```javascript
const {
  courses,              // full courses table — reactive
  progressList,         // full progress table — reactive
  practiceProgressList, // full practiceProgress table — reactive
  notes,                // full notes table — reactive (raw array)
  stats,                // useMemo derived from notes + progressList (inside hook)
  isInitializing,       // boolean flag from seedIfEmpty() useEffect
  getCourseProgress,    // imperative async function (called per-course in useEffect)
  getContinueLearningPath, // imperative async function (called in useEffect)
  deleteCourse,         // async command
  importCourse          // async command
} = useFocusFlow();
```

#### 9.1.2 Local Derived State & Computation

| Local State / useMemo | Trigger | What It Computes |
|---|---|---|
| `streakCount` | `useMemo([progressList, practiceProgressList])` | Calls `calculateStreak(progressList, practiceProgressList)` from `streakUtils.js` — scans both full arrays in JS |
| `sortedCourses` | `useMemo([courses, progressList])` | Sorts courses by explicit comparator: (1) most-recent `updatedAt \|\| lastWatched` from `progressList`, (2) alphabetical `title` fallback |
| `courseProgressMap` | `useEffect([courses, progressList, getCourseProgress])` | Calls `getCourseProgress(course.id)` for every course in parallel via `Promise.all`. Stores result in local `useState({})` |
| `continuePath` | `useEffect([progressList, getContinueLearningPath])` | Calls `getContinueLearningPath()` once; stores result in local `useState(null)` |

#### 9.1.3 Fields Actually Rendered

| Rendered Value | Source |
|---|---|
| Streak badge count | `streakCount` (from `calculateStreak`) |
| Stats card — Watch Time | `stats.totalHours` (from monolithic `useMemo` in hook) |
| Stats card — Lectures Done | `stats.completedLessons` (from monolithic `useMemo` in hook) |
| Stats card — Practices Solved | `practiceProgressList.filter(p => p.completed).length` (raw in JSX, line 335) |
| Stats card — Notes Written | `stats.totalNotes \|\| 0` |
| Export Notes button | Passes raw `notes` array to `exportNotesToMarkdown(notes, ...)` (line 219) |
| Course cards progress % | `courseProgressMap[course.id]` (populated by `getCourseProgress` useEffect) |
| Course card ordering | `sortedCourses` (explicit comparator: most-recent timestamp, then alphabetical) |
| Continue Learning banner | `continuePath` (from `getContinueLearningPath` useEffect) |
| Streak modal props | `stats`, `progressList`, `practiceProgressList` passed to `<StreakModal />` |

#### 9.1.4 Tables Actually Required by Dashboard

| Table | Why Required |
|---|---|
| `courses` | Course card list, `sortedCourses` ordering |
| `lessons` | NOT currently subscribed reactively — used only inside `getCourseProgress` and `getContinueLearningPath` as one-shot async reads. **After Phase 2:** subscribed once so `courseProgressMap` and `selectContinueLearningPath` can be computed in JS with zero extra DB reads. |
| `progress` | `sortedCourses` sort key, `stats.completedLessons`, `stats.totalHours`, `streakCount`, `courseProgressMap`, `continuePath`, `StreakModal` |
| `practiceProgress` | "Practices Solved" stat (line 335), `streakCount`, `StreakModal` |
| `notes` | `stats.totalNotes` (**count only** needed reactively). Raw array needed only on Export Notes click (one-time read). |

#### 9.1.5 Current Rerender Problem Analysis

1. **Five full-table subscriptions in one hook instance.** Any write to any of courses / progress / practiceProgress / notes causes Dashboard to rerender.
2. **`getCourseProgress` is async-imperative inside `useEffect`.** Every `progressList` change re-fires a `Promise.all(courses.map(getCourseProgress))` N-call fan-out — N IndexedDB reads per progress write.
3. **`getContinueLearningPath` is async-imperative inside `useEffect`.** Fires on every `progressList` change; issues an `orderBy('lastWatched').reverse()` IndexedDB walk and N per-lesson `db.progress.get(...)` lookups inside a loop, even though `courses`, `lessons`, and `progressList` are all already available as reactive arrays.
4. **`stats` monolithic useMemo in hook.** Computed from both `notes` and `progressList`; Dashboard gets a new `stats` reference on every note or progress write. The full `notes` array is kept in reactive state even though only the count is needed in steady state.
5. **`notes` subscribed as raw array.** `useFocusFlow` always delivers the full notes array to Dashboard. The array is only needed when the user clicks Export Notes; keeping it reactive causes unnecessary rerenders on every note write.

#### 9.1.6 Exact `getContinueLearningPath` Algorithm (Current)

The existing `getContinueLearningPath()` in `useFocusFlow.js` (lines 80–145) performs the following three-priority lookup via IndexedDB:

```
Step 1 — Most recently watched incomplete lesson
  db.progress.orderBy('lastWatched').reverse()
    .filter(p => !p.completed).first()
  → If found: return { courseId: p.courseId, lessonId: p.lessonId }

Step 2 — First incomplete lesson in most recently touched course
  db.progress.orderBy('lastWatched').reverse().first()  → recentWatchedAny
  db.lessons.where('courseId').equals(recentWatchedAny.courseId).sortBy('index')
    → for each lesson in order:
        prog = await db.progress.get(`${courseId}_${lesson.id}`)
        if (!prog || !prog.completed) return { courseId, lessonId: lesson.id }

Step 3 — Fallback: first lesson of first course ordered by title
  db.courses.orderBy('title').first()
  db.lessons.where('courseId').equals(firstCourse.id).sortBy('index')
    → return { courseId: firstCourse.id, lessonId: firstLesson[0].id }

Step 4 — No courses / no lessons: return null
```

> [!NOTE]
> **Step 1 uses the `lastWatched` index on `progress`.** This is valid (timestamp, not boolean). Step 3 uses the `title` index on `courses`. Both are supported by the current schema with no migration.

> [!IMPORTANT]
> **Legacy playback seconds field:** Both `p.watchTime` and the legacy `p.currentTime` field may be present on older stored progress records. Every selection rule that tests playback seconds **must** use:
> ```
> p.watchTime ?? p.currentTime ?? 0
> ```
> The same rule applies to: total watch time stat, last-watched selection, resume data, and `selectContinueLearningPath`. Do not remove `currentTime` from stored records.

#### 9.1.7 Dashboard Target Hook Architecture (Phase 2 Design)

**Principle:** `useDashboardData()` subscribes to exactly the tables needed, computes all derived values in JS using the reactive arrays (zero extra DB reads), and uses a **notes count-only** reactive subscription. Raw notes are fetched on demand.

```javascript
// src/hooks/useDashboardData.js

export function useDashboardData() {
  // --- Reactive subscriptions ---
  const courses              = useLiveQuery(() => db.courses.toArray())              ?? [];
  const lessons              = useLiveQuery(() => db.lessons.toArray())              ?? [];
  const progressList         = useLiveQuery(() => db.progress.toArray())             ?? [];
  const practiceProgressList = useLiveQuery(() => db.practiceProgress.toArray())     ?? [];
  // Only the count is kept reactive — no full notes array in steady-state
  const notesCount           = useLiveQuery(() => db.notes.count())                  ?? 0;

  // --- Pre-computed stats (stable references) ---
  const stats = useMemo(() => {
    const completedLessons = progressList.filter(p => p.completed).length;
    // Legacy field: p.watchTime ?? p.currentTime ?? 0
    const totalSeconds = progressList.reduce(
      (acc, p) => acc + (p.watchTime ?? p.currentTime ?? 0), 0
    );
    const totalHours = (totalSeconds / 3600).toFixed(1);
    const practicesSolved = practiceProgressList.filter(p => p.completed).length;
    return { completedLessons, totalHours, practicesSolved, totalNotes: notesCount };
  }, [progressList, practiceProgressList, notesCount]);

  const streakCount = useMemo(
    () => calculateStreak(progressList, practiceProgressList),
    [progressList, practiceProgressList]
  );

  // --- Per-course completion % (JS-derived, zero extra DB reads) ---
  const courseProgressMap = useMemo(() => {
    const map = {};
    courses.forEach(course => {
      const courseLessons = lessons.filter(l => l.courseId === course.id);
      if (courseLessons.length === 0) { map[course.id] = 0; return; }
      const lessonIds = new Set(courseLessons.map(l => l.id));
      const completed = progressList.filter(
        p => lessonIds.has(p.lessonId) && p.completed === true
      ).length;
      map[course.id] = Math.round((completed / courseLessons.length) * 100);
    });
    return map;
  }, [courses, lessons, progressList]);

  // --- Course ordering: explicit comparator (not insertion/storage order) ---
  // Rule 1: most-recent progress timestamp (updatedAt ?? lastWatched) descending
  // Rule 2: alphabetical title ascending (locale-aware)
  // NOTE: db.courses.toArray() does NOT guarantee any particular order.
  //       Order is defined solely by this comparator.
  const sortedCourses = useMemo(() => {
    return [...courses].sort((a, b) => {
      const progressA = progressList.filter(p => p.courseId === a.id);
      const maxTimeA = progressA.length > 0
        ? Math.max(...progressA.map(p => p.updatedAt || p.lastWatched || 0)) : 0;
      const progressB = progressList.filter(p => p.courseId === b.id);
      const maxTimeB = progressB.length > 0
        ? Math.max(...progressB.map(p => p.updatedAt || p.lastWatched || 0)) : 0;
      return maxTimeB !== maxTimeA ? maxTimeB - maxTimeA : a.title.localeCompare(b.title);
    });
  }, [courses, progressList]);

  // --- Continue Learning path (pure selector, no DB reads) ---
  const continuePath = useMemo(
    () => selectContinueLearningPath(courses, lessons, progressList),
    [courses, lessons, progressList]
  );

  return {
    courses, sortedCourses, courseProgressMap,
    progressList, practiceProgressList,
    notesCount, stats, streakCount, continuePath
  };
}
```

> [!IMPORTANT]
> **`notes` is NOT returned from `useDashboardData()`.** The raw notes array is not kept in reactive state. Export Notes calls `exportNotes()` on demand (see §9.1.8).

> [!IMPORTANT]
> **`continuePath` is now a pure `useMemo`, not a `useEffect` + `useState`.** It is computed by `selectContinueLearningPath` (see §9.1.9) from the already-reactive `courses`, `lessons`, and `progressList` arrays. No additional IndexedDB reads are performed.

> [!NOTE]
> **`courseProgressMap` is now purely JS-derived.** This eliminates the N-call `Promise.all(courses.map(getCourseProgress))` fan-out. The trade-off is that `lessons` is now subscribed in `useDashboardData`. Dashboard is reactive when lessons are added/removed — which is correct behavior.

> [!NOTE]
> **`db.courses.toArray()` does NOT guarantee insertion or catalog storage order.** The course display order is defined exclusively by the explicit sort comparator: most-recent progress timestamp descending, alphabetical title ascending as a tiebreaker.

#### 9.1.8 Export Notes One-Time Command

The raw notes array must **not** be kept in Dashboard reactive state. Export Notes reads notes once at click time:

```javascript
// src/services/dataCommands.js

export async function exportNotes() {
  return db.notes.toArray();
}
```

Dashboard usage:

```javascript
import { exportNotes } from '../services/dataCommands';

const handleExportNotes = async () => {
  const notes = await exportNotes();
  exportNotesToMarkdown(notes, 'FocusFlow_Mastery_Notes');
};
```

This means:
- `db.notes.count()` reactive subscription drives the "Notes Written" stat card.
- `db.notes.toArray()` is called **only** when the user clicks Export Notes.
- No notes array sits in Dashboard reactive memory between clicks.

#### 9.1.9 `selectContinueLearningPath` — Pure Selector

This selector replaces the async-imperative `getContinueLearningPath()` for Dashboard. It takes the already-reactive in-memory arrays and applies the same three-priority algorithm without any IndexedDB reads.

**Exact algorithm preserved:**

```
Priority 1 — Most recently watched incomplete lesson
  candidates = progressList where !p.completed && (p.watchTime ?? p.currentTime ?? 0) > 0
  sort by p.lastWatched descending
  → If any candidate: return { courseId, lessonId } of the first

Priority 2 — First incomplete lesson in the most recently touched course
  anchor = progressList record with highest p.lastWatched (any, including completed)
  if anchor:
    courseId = anchor.courseId
    courseLessons = lessons where l.courseId === courseId, sorted by l.index ascending
    for each lesson in courseLessons:
      prog = progressList record where p.id === `${courseId}_${lesson.id}`
      if (!prog || !prog.completed): return { courseId, lessonId: lesson.id }

Priority 3 — First lesson of the first course ordered by title
  firstCourse = courses sorted by title ascending [0]
  if firstCourse:
    courseLessons = lessons where l.courseId === firstCourse.id, sorted by l.index
    if courseLessons.length > 0: return { courseId: firstCourse.id, lessonId: courseLessons[0].id }

Fallback — return null
```

**Implementation:**

```javascript
// src/utils/selectors.js

/**
 * Pure in-memory selector for "Continue Learning" path.
 * Preserves the exact three-priority algorithm of getContinueLearningPath()
 * without performing any IndexedDB reads.
 *
 * @param {object[]} courses
 * @param {object[]} lessons
 * @param {object[]} progressList
 * @returns {{ courseId: string, lessonId: string } | null}
 */
export function selectContinueLearningPath(courses, lessons, progressList) {
  // Priority 1: Most recently watched incomplete lesson
  // Legacy field: p.watchTime ?? p.currentTime ?? 0
  const inProgress = progressList
    .filter(p => !p.completed && (p.watchTime ?? p.currentTime ?? 0) > 0)
    .sort((a, b) => (b.lastWatched || 0) - (a.lastWatched || 0));

  if (inProgress.length > 0) {
    return { courseId: inProgress[0].courseId, lessonId: inProgress[0].lessonId };
  }

  // Priority 2: First incomplete lesson in most recently touched course
  const anchor = progressList
    .slice()
    .sort((a, b) => (b.lastWatched || 0) - (a.lastWatched || 0))[0] ?? null;

  if (anchor) {
    const courseLessons = lessons
      .filter(l => l.courseId === anchor.courseId)
      .sort((a, b) => a.index - b.index);

    for (const lesson of courseLessons) {
      const prog = progressList.find(p => p.id === `${anchor.courseId}_${lesson.id}`);
      if (!prog || !prog.completed) {
        return { courseId: anchor.courseId, lessonId: lesson.id };
      }
    }
  }

  // Priority 3: First lesson of first course (alphabetical by title)
  const firstCourse = courses.slice().sort((a, b) => a.title.localeCompare(b.title))[0] ?? null;
  if (firstCourse) {
    const courseLessons = lessons
      .filter(l => l.courseId === firstCourse.id)
      .sort((a, b) => a.index - b.index);
    if (courseLessons.length > 0) {
      return { courseId: firstCourse.id, lessonId: courseLessons[0].id };
    }
  }

  return null;
}
```

> [!IMPORTANT]
> **`selectContinueLearningPath` is placed in `src/utils/selectors.js`, NOT in `src/services/dataCommands.js`.** It is a pure function with no side effects and no database access. `dataCommands.js` is reserved for functions that perform Dexie writes or one-time reads.

> [!NOTE]
> **Behavioral equivalence with `getContinueLearningPath()`:** The priority chain (1 → 2 → 3 → null), the sort keys (`lastWatched`), the incomplete-lesson scan order (`l.index` ascending), the `${courseId}_${lesson.id}` progress key lookup, and the `title`-alphabetical course fallback are all identical to the existing function.

#### 9.1.10 Dashboard Commands Required

| Command | Source After Phase 2 | Notes |
|---|---|---|
| `deleteCourse(courseId)` | `import { deleteCourse } from '../services/dataCommands'` | Existing contract preserved |
| `importCourse(course, lessons)` | `import { importCourse } from '../services/dataCommands'` | Existing contract preserved |
| `exportNotes()` | `import { exportNotes } from '../services/dataCommands'` | One-time read — not reactive |
| `selectContinueLearningPath` | `import { selectContinueLearningPath } from '../utils/selectors'` | Pure selector — used in `useMemo` inside `useDashboardData` |

> [!CAUTION]
> **`getContinueLearningPath` is NOT exported from `dataCommands.js`.** It is fully replaced by the pure selector `selectContinueLearningPath` consumed inside `useDashboardData`. Do not add a `getContinueLearningPath` wrapper to `dataCommands.js`.

---

### 9.2 CourseDetail.jsx — Current Data Flow Audit

#### 9.2.1 Properties Destructured from `useFocusFlow()`

```javascript
const {
  courses,              // full courses table — reactive
  lessons,              // full lessons table — reactive
  progressList,         // full progress table — reactive
  getCourseProgress,    // imperative async function
  getLastWatchedLesson  // imperative async function
} = useFocusFlow();
```

#### 9.2.2 Local Derived State & Computation

| Local State | Trigger | What It Computes |
|---|---|---|
| `courseProgress` | `useEffect([courseId, progressList])` | Calls `getCourseProgress(courseId)` — queries `lessons.where('courseId')` + `progress.where('lessonId').anyOf(lessonIds)` and counts `completed`. Stores result in `useState(0)`. |
| `lastWatched` | `useEffect([courseId, progressList])` | Calls `getLastWatchedLesson(courseId)` — queries `progress.where('courseId')` filtered to `watchTime > 0`, sorted by `lastWatched`. Returns `{lessonId, watchTime}` of most recent incomplete lesson. Stores result in `useState(null)`. |
| `course` | Inline expression | `courses.find(c => c.id === courseId)` — full scan of courses array |
| `courseLessons` | Inline expression | `lessons.filter(l => l.courseId === courseId).sort(by index)` — full scan of all lessons |
| `resumeLesson` | IIFE from `lastWatched`, `courseLessons`, `progressList` | Priority: lastWatched lesson → first incomplete → first lesson |

#### 9.2.3 Fields Actually Rendered

| Rendered Value | Source |
|---|---|
| Course banner (title, description, thumbnail, channelName, type) | `course` object (from `courses.find`) |
| Progress bar % | `courseProgress` (from `getCourseProgress` useEffect) |
| Total lesson count | `courseLessons.length` |
| Resume button label + lesson | `resumeLesson`, `lastWatched` |
| Syllabus checklist rows | `courseLessons.map(...)` |
| Each lesson — `isCompleted` | `progressList.find(p => p.id === \`${courseId}_${lesson.id}\`)` |
| Each lesson — "In Progress" badge + mini progress bar | `lastWatched.lessonId`, `lastWatched.watchTime`, `lesson.durationSeconds` |

#### 9.2.4 Tables Actually Required by CourseDetail

| Table | Why Required |
|---|---|
| `courses` | Single course object lookup by `courseId` |
| `lessons` | Lesson list for this course (filtered client-side from full table currently) |
| `progress` | Per-lesson completion status; `getCourseProgress`; `getLastWatchedLesson`; `resumeLesson` |
| `practiceProgress` | **Not required** — not rendered, not computed |
| `notes` | **Not required** — not rendered, not computed |

#### 9.2.5 Current Problems

1. **Full `lessons` table subscription.** All lessons across all courses are loaded reactively. Every lesson write in any course triggers a CourseDetail rerender.
2. **Two async-imperative calls on every `progressList` change.** `getCourseProgress(courseId)` and `getLastWatchedLesson(courseId)` fire on every `progressList` change. Each issues multiple IndexedDB reads.
3. **`getCourseProgress` N+1 pattern.** Issues: (1) `db.lessons.where('courseId')` then (2) `db.progress.where('lessonId').anyOf(...)`. Both are computable in JS from already-subscribed reactive data.
4. **`getLastWatchedLesson` extra DB read.** Issues `db.progress.where('courseId')` even though the course-scoped progress is already available.
5. **Missing `undefined` guards on Dexie queries.** If `courseId` is `undefined` (e.g. before route params are parsed), `db.courses.get(undefined)` and `db.lessons.where('courseId').equals(undefined)` are issued to IndexedDB. IndexedDB treats `undefined` as an invalid key and will throw or return unexpected results.
6. **No distinction between loading and not-found.** `useLiveQuery` returns `undefined` while the async query is in flight and returns `null`/`undefined` for a missing record. CourseDetail currently uses `!course` to gate the "Course Not Found" render, which conflates an in-progress query with a genuinely absent course. This shows a flash of the "Course Not Found" screen on every mount.

#### 9.2.6 Guarded Query Contracts for `useCourseDetail(courseId)`

All three scoped queries must reject `undefined` before touching Dexie:

| Query | Guard Condition | Behavior if Guard Fails |
|---|---|---|
| `db.courses.get(courseId)` | `courseId` must be a non-empty string | Return `null` immediately; do not call Dexie |
| `db.lessons.where('courseId').equals(courseId)` | `courseId` must be a non-empty string | Return `[]` immediately; do not call Dexie |
| `db.progress.where('courseId').equals(courseId)` | `courseId` must be a non-empty string | Return `[]` immediately; do not call Dexie |

**Guard rule:**

```javascript
const isValidId = typeof courseId === 'string' && courseId.length > 0;
```

If `isValidId` is false, all three `useLiveQuery` calls must not execute the Dexie query.

#### 9.2.7 Loading vs Not-Found State Machine

`useLiveQuery` returns `undefined` while the async query is resolving and the resolved value (e.g. the course object or `undefined`) once complete.

| `useLiveQuery` return value | Meaning |
|---|---|
| `undefined` (first render before resolution) | Query is **loading** |
| A course object | Course exists |
| `null` / `undefined` (after resolution) | Course is absent from the database |

`useCourseDetail` must expose:

```javascript
{ isLoading, courseNotFound, course, courseLessons, courseProgressList,
  courseProgress, lastWatched, resumeLesson }
```

| State | `isLoading` | `courseNotFound` | `course` |
|---|---|---|---|
| `courseId` is undefined/invalid | `false` | `true` | `null` |
| Dexie query in flight | `true` | `false` | `null` |
| Query resolved, course found | `false` | `false` | `{ ... }` |
| Query resolved, course absent | `false` | `true` | `null` |

**UI behavior per state:**

| State | CourseDetail renders |
|---|---|
| `isLoading === true` | Skeleton / spinner — do NOT show "Course Not Found" |
| `courseNotFound === true` && `courseId` is invalid | "Course Not Found" with link back to Dashboard |
| `courseNotFound === true` && `courseId` is valid string but absent | "Course Not Found" with link back to Dashboard |
| `course` is present | Full syllabus UI |

#### 9.2.8 CourseDetail Target Hook Architecture (Phase 2 Design)

```javascript
// src/hooks/useCourseDetail.js

export function useCourseDetail(courseId) {
  const isValidId = typeof courseId === 'string' && courseId.length > 0;

  // --- Guarded scoped reactive subscriptions ---
  // useLiveQuery returns `undefined` while query is in flight, then the result.
  const courseResult = useLiveQuery(
    () => isValidId ? db.courses.get(courseId) : null,
    [courseId, isValidId]
  );

  const courseLessons = useLiveQuery(
    () => isValidId
      ? db.lessons.where('courseId').equals(courseId).sortBy('index')
      : Promise.resolve([]),
    [courseId, isValidId]
  ) ?? [];

  const courseProgressList = useLiveQuery(
    () => isValidId
      ? db.progress.where('courseId').equals(courseId).toArray()
      : Promise.resolve([]),
    [courseId, isValidId]
  ) ?? [];

  // --- Loading / not-found state machine ---
  // courseResult === undefined: query still in flight (isLoading)
  // courseResult === null or undefined after resolution: course absent (courseNotFound)
  const isLoading      = isValidId && courseResult === undefined;
  const courseNotFound = !isLoading && (courseResult == null);
  const course         = courseResult ?? null;

  // --- JS-derived values (no extra DB reads) ---
  const courseProgress = useMemo(() => {
    if (courseLessons.length === 0) return 0;
    const lessonIds = new Set(courseLessons.map(l => l.id));
    const completed = courseProgressList.filter(
      p => lessonIds.has(p.lessonId) && p.completed === true
    ).length;
    return Math.round((completed / courseLessons.length) * 100);
  }, [courseLessons, courseProgressList]);

  const lastWatched = useMemo(() => {
    // Legacy field: p.watchTime ?? p.currentTime ?? 0
    const withTime = courseProgressList
      .filter(p => (p.watchTime ?? p.currentTime ?? 0) > 0 && !p.completed)
      .sort((a, b) => (b.lastWatched || 0) - (a.lastWatched || 0));
    if (withTime.length > 0) {
      return { lessonId: withTime[0].lessonId, watchTime: withTime[0].watchTime };
    }
    return null;
  }, [courseProgressList]);

  const resumeLesson = useMemo(() => {
    if (lastWatched) {
      return courseLessons.find(l => l.id === lastWatched.lessonId) ?? null;
    }
    return (
      courseLessons.find(lesson => {
        const prog = courseProgressList.find(p => p.id === `${courseId}_${lesson.id}`);
        return !prog || !prog.completed;
      }) ?? courseLessons[0] ?? null
    );
  }, [lastWatched, courseLessons, courseProgressList, courseId]);

  return {
    isLoading,
    courseNotFound,
    course,
    courseLessons,
    courseProgressList,
    courseProgress,
    lastWatched,
    resumeLesson
  };
}
```

> [!IMPORTANT]
> **All three Dexie queries are guarded against `undefined` courseId.** If `courseId` is not a valid non-empty string, no Dexie call is made. The hook returns `isLoading: false, courseNotFound: true, course: null` immediately.

> [!IMPORTANT]
> **`courseProgressList` subscription scope.** Subscribes to `db.progress.where('courseId').equals(courseId)` — not the full progress table. A `saveProgress` call in a different course causes NO rerender in CourseDetail.

> [!NOTE]
> **`getLastWatchedLesson` and `getCourseProgress` are eliminated as imperative async calls.** Both results are computed purely in JS from the already-subscribed `courseLessons` and `courseProgressList`. This removes 2 IndexedDB reads per `progressList` change and eliminates the stale-state window between async call and `useState` update.

> [!NOTE]
> **Legacy `currentTime` fallback preserved.** `lastWatched` selection uses `p.watchTime ?? p.currentTime ?? 0`. Older stored progress records with only `currentTime` are handled correctly.

#### 9.2.9 Behavioral Equivalence Verification

| Current Behavior | New Behavior | Change? |
|---|---|---|
| `course` found by `courses.find(c => c.id === courseId)` on full table. `!course` treated as "not found" immediately. | `db.courses.get(courseId)` scoped by primary key. `undefined` = loading; `null` = not found. | **Corrected** — loading state no longer shown as "Not Found" |
| `courseLessons` filtered from full `lessons` in JS | `db.lessons.where('courseId').equals(courseId).sortBy('index')` — indexed, course-scoped | Equivalent — same result |
| `courseProgress` from async `getCourseProgress` | `useMemo` from already-subscribed reactive data | Equivalent — same formula |
| `lastWatched` from async `getLastWatchedLesson` using `watchTime` only | `useMemo` using `p.watchTime ?? p.currentTime ?? 0` | **Corrected** — legacy `currentTime` honoured |
| `resumeLesson` from IIFE over full `progressList` | `useMemo` from scoped `courseProgressList` | Equivalent — same priority chain |
| No guard: `db.courses.get(undefined)` possible | Guard: `isValidId` check prevents all Dexie calls | **Corrected** |

---

### 9.3 Rerender Isolation Guarantee (Dashboard & CourseDetail)

| Write Operation | Current Behavior | After Phase 2 |
|---|---|---|
| `saveProgress` for lesson in Course A | Rerenders Dashboard AND any open CourseDetail (same full `progressList`) | Dashboard rerenders (progress). CourseDetail for Course B: **NO rerender** (scoped to Course B only). |
| `createNote` in Watch | Rerenders Dashboard (full notes array reactive) | Dashboard: rerender only if `db.notes.count()` changes. CourseDetail: **NO rerender**. |
| `togglePractice` | Rerenders Dashboard (practiceProgressList) | Dashboard: rerender (practiceProgress reactive). CourseDetail: **NO rerender**. |
| `importCourse` (new course added) | Rerenders all `useFocusFlow` consumers | Dashboard rerenders (courses + lessons changed). CourseDetail for existing course: **NO rerender** (course + lessons for current courseId unchanged). |
| User clicks Export Notes | Full `notes` array already in Dashboard reactive state | `exportNotes()` called on click — one-time `db.notes.toArray()` read. No reactive subscription change. |

---

### 9.4 Phase 2C-1 Correction Summary

| Issue | Status |
|---|---|
| Duplicate `notes.count()` + `notes.toArray()` reactive subscriptions in Dashboard | **Corrected** — only `notes.count()` reactive; `exportNotes()` one-time command on click |
| `getContinueLearningPath` DB reads on every `progressList` change | **Corrected** — replaced by pure `selectContinueLearningPath` selector in `useMemo` |
| Legacy `currentTime` not covered in playback-second calculations | **Corrected** — all calculations use `p.watchTime ?? p.currentTime ?? 0` |
| `db.courses.get(undefined)` / `.equals(undefined)` possible when courseId not yet parsed | **Corrected** — `isValidId` guard prevents all Dexie calls on invalid courseId |
| No distinction between loading and not-found in CourseDetail | **Corrected** — explicit `isLoading` / `courseNotFound` / `course` state machine |
| Incorrect claim that `db.courses.toArray()` guarantees storage/insertion order | **Corrected** — ordering is defined by explicit comparator (timestamp desc, title asc) |
| `getContinueLearningPath` incorrectly placed in `dataCommands.js` | **Corrected** — pure selector placed in `src/utils/selectors.js`; removed from `dataCommands.js` |

| Component | Hook to Create | Pure Selector | One-Time Command | Reactive Tables |
|---|---|---|---|---|
| `Dashboard.jsx` | `useDashboardData()` | `selectContinueLearningPath` (from `selectors.js`, used inside hook) | `exportNotes()` (from `dataCommands.js`) | `courses`, `lessons`, `progress`, `practiceProgress`, `notes` (count only) |
| `CourseDetail.jsx` | `useCourseDetail(courseId)` | — | — | `courses` (scoped), `lessons` (scoped), `progress` (scoped) |
