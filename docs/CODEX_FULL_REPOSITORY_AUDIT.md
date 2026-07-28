# FocusFlow Complete Repository Audit

**Audit date:** 2026-07-29
**Branch:** `refactor/focusflow-production-hardening`
**Audited commit:** `c3253cb` (`chore: add Codex engineering contract`)
**Scope:** Every tracked file, excluding generated/dependency directories (`node_modules`, `dist`, `coverage`, `.git`)
**Contract:** `AGENTS.md` is controlling. Application source was not modified during this audit.

## Executive conclusion

Phase 0 evidence and the seven Phase 1 source changes are present, and the current build plus the existing standalone verification scripts pass. Phase 1 improved backup file handling, practice URL normalization, the notes statistic, streak calculation, and frontend secret isolation.

However, Phase 1 cannot be treated as a complete correctness/data-safety closure. The source of truth exposes four blocker-class data/progress defects:

1. startup seeding can overwrite seed-course metadata and delete records for hard-coded legacy course IDs on every `useFocusFlow()` mount;
2. backup validation removes legacy `currentTime` and replaces it with `watchTime: 0`;
3. `saveProgress()` can turn an already-completed lesson back into incomplete;
4. lesson primary keys are global video IDs, so importing the same video into a second course overwrites the first course's lesson ownership.

The repository has no package-level unit-test or Playwright test command, no Playwright configuration, and no tracked Playwright dependency. The existing browser checks depend on extraneous local packages and therefore are not reproducible from `package-lock.json`.

## Evidence and audit method

- Read `AGENTS.md` and all six mandatory refactor documents completely.
- Enumerated all tracked files with `git ls-files`.
- Inspected all tracked `src/`, `api/`, `scripts/`, public/PWA, configuration, package manifest/lockfile, documentation, and evidence files.
- Inspected branch, clean status, tags, and the latest 15 commits.
- Compared Phase 0/1/2 documentation claims against current code.
- Ran build, lint, every tracked Phase 1 verification script, the browser E2E script, the live API smoke script, dependency inventory, bundle generation, and frontend key scan.
- Reviewed existing responsive, overflow, performance, profiler, and PWA evidence.

Binary images/icons and `docs/evidence.rar` were inventoried; the PNG screenshot matrix is independently catalogued by the tracked manifest and JSON measurements.

## Repository and tooling reality

| Area | Actual repository state |
|---|---|
| Runtime | React 19.2.7, React Router 7.18.1, Vite 8.1.5 |
| Persistence | Dexie 4.4.4, application schema version 3 |
| UI state | Zustand 5.0.14 |
| Validation | Zod 4.4.3 |
| Styling/PWA | Tailwind 4.3.3, `vite-plugin-pwa` 1.3.0 |
| Lint | `oxlint` through `.oxlintrc.json`; no ESLint config |
| Tests | No `test` or `test:e2e` package script; standalone Node scripts only |
| Playwright | No config and not tracked in `package.json`/lockfile; present locally as extraneous |
| Vercel | `api/youtube.js` only; no `vercel.json` |
| TypeScript | Documentation claims strict TypeScript, but application code is JavaScript/JSX |
| PWA | Workbox `generateSW`, `registerType: autoUpdate`, default navigation behavior |

## Findings by classification

### Blockers

#### B-01 — Repeated startup seeding mutates and deletes persisted catalog data

**Evidence:** `useFocusFlow()` calls `db.seedIfEmpty()` from an effect in every consumer. `seedIfEmpty()` always deletes four hard-coded course IDs and their lessons, then `put()`s every seed course and bulk-puts lessons when the stored count is lower.

**Impact:** A returning user can lose a course with a legacy ID, have user-edited seed metadata overwritten, and receive partial seed repair repeatedly. StrictMode and multiple consumers amplify the calls. Progress/notes can become orphaned after the hard-coded course/lesson deletion.

**Files:** `src/hooks/useFocusFlow.js`, `src/db/FocusFlowDB.js`, `src/db/seedData.json`.

**Required correction:** One application bootstrap, no destructive legacy cleanup during ordinary startup, transactional first-install seeding only, and preservation tests for populated/partial/empty databases. Keep Dexie version 3.

#### B-02 — Backup import silently destroys the legacy `currentTime` value

**Evidence:** `UserProgressSchema` does not declare `currentTime`; Zod strips unknown keys. It defaults missing `watchTime` to `0`. `BackupSchema.parse()` is applied before import and export.

**Impact:** Importing an older backup containing only `currentTime` converts resumable progress to zero. Exporting such an existing record also emits the normalized loss. This violates the explicit permanent guarantee to preserve legacy progress fields.

**Files:** `src/types/schemas.js`, `src/db/FocusFlowDB.js`.

**Required correction:** Preserve `currentTime` verbatim and derive/fill `watchTime` without deleting the legacy field. Add legacy export/import/export and IndexedDB round-trip tests.

#### B-03 — Saving playback can un-complete a completed lesson

**Evidence:** `saveProgress()` overwrites the entire progress record with the caller's `completed` boolean. Watch calls it every 10 seconds and on pause.

**Impact:** Reopening a completed lesson and pausing or persisting before 90% changes `completed: true` to `false`, corrupting course progress and Continue Learning behavior.

**Files:** `src/hooks/useFocusFlow.js`, `src/pages/Watch.jsx`.

**Required correction:** Merge the existing record and make completion sticky unless an explicit manual-uncomplete command is invoked. Preserve unknown/legacy fields.

#### B-04 — Global lesson IDs allow cross-course lesson overwrite

**Evidence:** `lessons` uses `id` as its primary key. Imported lessons use the YouTube video ID. `importCourse()` calls `bulkPut()`. The same video in two playlists overwrites `courseId` on the existing lesson.

**Impact:** The first course loses the lesson from its scoped list while its progress/notes remain, producing orphaned learning data and wrong course progress.

**Files:** `src/db/FocusFlowDB.js`, `src/hooks/useFocusFlow.js`, `api/youtube.js`, `src/types/schemas.js`.

**Required correction:** Before any schema decision, add collision characterization and preservation tests. Because course and lesson IDs must remain stable and schema version changes require approval, the safe initial policy is to reject a conflicting import without mutation and explain the conflict. A composite-identity migration is a separately approved future option.

### High priority

#### H-01 — Backup validation lacks version and referential-integrity enforcement

`BackupSchema` accepts any positive version. Import does not verify that lessons, progress, notes, and practice rows reference included courses/lessons. A structurally valid but relationally invalid backup replaces valid current data atomically with unusable/orphaned data.

Files: `src/types/schemas.js`, `src/db/FocusFlowDB.js`, `src/pages/Settings.jsx`.

#### H-02 — Continue Learning selects zero-time incomplete records

The first query filters only `!completed`, so a newly written or reset zero-time record can outrank an actually watched lesson. Its fallback differs from the documented “in-progress” rule.

Files: `src/hooks/useFocusFlow.js`, `src/pages/Dashboard.jsx`.

#### H-03 — Course progress can count progress from the wrong course

`getCourseProgress()` queries progress by lesson IDs only. With globally reused IDs or orphan records, another course's completion can be counted.

Files: `src/hooks/useFocusFlow.js`.

#### H-04 — Watch player lifecycle can lose recent progress

Watch persists on a 10-second interval, pause, and ended state, but not reliably on route exit/unmount, visibility change, or page lifecycle events. The player effect has extensive missing dependencies and no final synchronous state snapshot contract.

Files: `src/pages/Watch.jsx`.

#### H-05 — Caption preference is forcibly disabled

Player initialization and playback explicitly unload captions and schedule two more “force off” operations. This contradicts persistent accessibility preferences and makes the `C` control state unreliable.

Files: `src/pages/Watch.jsx`.

#### H-06 — Practice mastery identity changes by entry context

Progress ID is `${lessonId}_${questionId}`. The global Practice Hub hard-codes `courseId="global"` and JavaScript lesson `yY0bKZNYmJs` while allowing JavaScript and Git catalogs. The same question opened from a course lesson receives another ID, so solved status diverges.

Files: `src/pages/PracticeHub.jsx`, `src/components/PracticeTab.jsx`, `src/pages/Watch.jsx`, both practice JSON files.

#### H-07 — Practice ID schema/documentation is inconsistent

Comments and reports describe numeric `practiceIndex`, but callers pass string question IDs. Data happens to work because interpolation accepts either, but the contract, tests, and migration assumptions are unreliable.

Files: `src/hooks/useFocusFlow.js`, `src/types/schemas.js`, `src/components/PracticeTab.jsx`, `docs/refactor-phase2-inspection.md`.

#### H-08 — Existing browser tests are not reproducible from a clean install

Browser scripts import Playwright, but Playwright is absent from `package.json` and `package-lock.json`; `npm ls` reports `playwright` and `playwright-core` as extraneous. There is no config or package script.

Files: `package.json`, `package-lock.json`, `scripts/verification/phase1/*`.

#### H-09 — PWA auto-update can replace an active session without consent

`registerType: 'autoUpdate'` is enabled, but there is no update-available UI, active player coordination, explicit runtime cache policy, or stale-cache recovery test.

Files: `vite.config.js`, `src/main.jsx`, `src/App.jsx`.

#### H-10 — Responsive evidence confirms clipped critical UI

Tracked evidence records a top-clipped Practice flashcard at 320×568 and 844×390, a bottom-clipped command palette at 844×390, left-clipped Pomodoro at 320×568, and top/bottom-clipped streak modal at 844×390. These are critical responsive failures under the controlling contract.

Files: `docs/evidence/overflow/overlay_bounding_box_measurements.json`, affected UI components.

#### H-11 — Dialogs and navigation lack complete accessible interaction

Mobile drawer, command palette, import modal, and streak modal lack a complete focus trap/restoration contract and dialog semantics. Several icon-only buttons rely on `title`, backdrop close is inconsistent, active navigation lacks `aria-current`, and the dashboard search trigger is a clickable `div`.

Files: `src/App.jsx`, `src/components/CommandPalette.jsx`, `src/components/ImportPlaylistModal.jsx`, `src/components/StreakModal.jsx`, `src/pages/Dashboard.jsx`.

#### H-12 — YouTube proxy has incomplete upstream validation

The server does not validate its constructed course/lesson payload with Zod, permits `Access-Control-Allow-Origin: *`, ignores duration-batch failures and returns `0:00`, and may include an item without a video ID. The client has no abort signal.

Files: `api/youtube.js`, `src/services/youtubeApi.js`.

### Normal roadmap work

#### N-01 — Monolithic reactive data hook and repeated queries

Every hook instance subscribes to five full tables and initializes the database. Dashboard performs N per-course queries and an imperative Continue Learning query after each progress change. Course Detail repeats DB queries from already-loaded data.

#### N-02 — Large mixed-responsibility components

`Watch.jsx` is 1,146 lines, `PracticeTab.jsx` 525, `Dashboard.jsx` 469, `PomodoroTimer.jsx` 409, and `App.jsx` 274. Each crosses state, domain, responsive, and accessibility responsibilities.

#### N-03 — Player display ticks rerender the large Watch tree

The 250 ms UI timer updates Watch-level state. Notes, tabs, syllabus, and surrounding layout share the render boundary.

#### N-04 — Pomodoro performs recurring synchronous storage writes

The timer writes `remaining` to `localStorage` every 500 ms despite updating its UI roughly once per second. The hook warning indicates stale dependency risk. The fixed-width panel and permanent animation/compositing choices need later correction.

#### N-05 — Responsive shell breakpoints are too early

Desktop dock begins at `md` (768 px), while the intended contract calls for mobile/tablet navigation below 1024 px. Watch enables its fixed side pane at `lg` and mixes `aspect-video` with minimum heights, distorting small layouts.

#### N-06 — Practice interaction semantics are weak

The custom select lacks a full keyboard/listbox pattern. Flashcard uses a clickable container with nested controls. Repeated `.some()` scans scale poorly. Filter/lesson changes can leave topic/index state stale.

#### N-07 — Route transition configuration is invalid/incomplete

`AnimatePresence mode="initial"` is not a supported mode value, and no exit animation is defined.

#### N-08 — Loading/error/empty states are inconsistent

Bootstrap errors are logged and then shown as initialized. Course Detail conflates initial empty query values with not-found. Multiple async surfaces expose raw `err.message`.

#### N-09 — Asset and chunk performance needs measurement-led work

The build produces a 442.99 kB main JS asset (140.84 kB gzip), a 197.80 kB shared data/hook asset, and a 129.00 kB Watch asset. Both large practice datasets are shipped; only `jsTopicPractice.json` drives Practice while `jsPracticeMap.json` drives Reading. They overlap conceptually and must not be deleted without a content/import comparison.

#### N-10 — PWA/offline behavior is only partially defined

The offline route exists and prior evidence confirms app-shell reachability and IndexedDB persistence. Runtime caching, offline navigation intent, failed API response caching, update prompts, and stale cache cleanup remain untested.

#### N-11 — Security hardening remains

The frontend/API source and generated bundle scan contain no Google key pattern, and external Reading links use safe `rel`. Still needed: repeatable secret scanning, payload validation, safer CORS policy, dependency audit, and removal of raw error propagation to UI.

#### N-12 — Documentation encoding and link quality

Many tracked Markdown files contain mojibake and `file:///c:/...` links. `docs/README.md` links to missing Phase 2–5 documents in another folder. This impairs maintainability but does not change runtime behavior.

### Deferred/non-blocking

- Unused imports/variables and hook warnings account for 58 current lint warnings; zero errors.
- `@tanstack/react-query`, `@distube/ytpl`, and several scaffolding packages appear unused in application code and should be reviewed during bundle/dependency work.
- `src/assets/vite.svg` is tracked but unused.
- Several content-generation scripts embed mutable output paths and remote-fetch assumptions; they are development utilities, not runtime code.
- Documentation claims “exactly four courses,” TypeScript strict mode, and an allowlist, while the current product supports two seeded courses plus arbitrary imports in JavaScript.
- Some public SVG/PNG assets overlap, but removal should wait for an asset-reference audit.
- `docs/evidence.rar` duplicates evidence in an opaque binary archive.

## Documentation reconciliation

| Claim | Source-code verdict |
|---|---|
| Phase 0 completed without app changes | Supported by history and reports |
| Phase 1 removed frontend API key | Supported; source and bundle scan pass |
| Phase 1 backup import is atomic | Transaction rollback is atomic after validation; incomplete because relational validation and legacy-field preservation are missing |
| Phase 1 preserves all IndexedDB compatibility | Contradicted by `currentTime` stripping and seed behavior |
| Phase 1 has no remaining issues | Contradicted by B-01 through B-04 and H-01 |
| Phase 2 needs no schema bump | Correct for bootstrap/query refactor; practice identity may later need a separately approved migration |
| Phase 2 seeding policy is implemented | False; it exists only in inspection documentation |
| Phase 2 `saveProgress` sticky merge is implemented | False; it exists only as a proposal |
| Existing tests are Playwright tests | Partly true operationally, but no tracked runner/config/dependency makes them reproducible |
| No horizontal overflow | Page-root measurements are zero, but critical overlays are visibly clipped per the same evidence set |

## Quality-gate results

| Command | Result |
|---|---|
| `npm run lint` | Passed: 0 errors, 58 warnings |
| `npm run build` | Passed: 2,327 modules; built in 919 ms |
| Phase 1 schema test | Passed: 4/4 |
| Phase 1 streak test | Passed: 8/8 |
| Phase 1 API unit test | Passed: 5/5 |
| Phase 1 full API test | Passed: 14/14 |
| Phase 1 bundle secret scan | Passed: 16 JS assets, 0 key patterns |
| Browser backup/dashboard E2E | Passed: 9/9 |
| Dashboard non-zero notes | Passed: 4/4 |
| Invalid backup sentinel preservation | Passed: 17/17 |
| Practice URL backup round-trip | Passed: 6/6 |
| Live API smoke | Passed: 8/8 |
| Package-defined unit tests | Not available |
| Package-defined Playwright tests | Not available |

Passing results establish the behavior those scripts assert; they do not cover the blocker scenarios listed above.

## Data compatibility assessment

- Dexie schema remains version 3; this audit did not change it.
- No IndexedDB data was mutated by repository evaluation commands. Browser verification scripts use their own test browser state.
- Current export/import is transactionally all-or-nothing after Zod parsing.
- Compatibility is not yet acceptable because legacy `currentTime`, seed-course customization, and cross-course lesson ownership can be lost.

## Immediate implementation recommendation

The next approved implementation must be the data-safety/correctness closure defined as Phase 2A in `CODEX_FINAL_IMPLEMENTATION_PLAN.md`. Do not begin responsive or architectural refactoring until B-01 through B-04 and H-01 are covered by preservation tests and fixed without changing Dexie schema version.
