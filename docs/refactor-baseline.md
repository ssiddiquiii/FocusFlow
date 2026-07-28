# FocusFlow Production Refactor Baseline (Phase 0 Audit Report)

**Date:** July 2026  
**Repository:** `ssiddiquiii/FocusFlow`  
**Safety Branch:** `refactor/focusflow-production-hardening`  
**Baseline Tag:** `pre-refactor-stable`  
**Audit Status:** Phase 0 Baseline Evidence Completed (0 application source code files modified)

---

## 1. Master Contract Acknowledgment & Setup Verification

### 1.1 Master Contract Acknowledgment
Antigravity hereby acknowledges the FocusFlow Master Refactor Contract ([`./FOCUSFLOW_ANTIGRAVITY_MASTER_REFACTOR.md`](./FOCUSFLOW_ANTIGRAVITY_MASTER_REFACTOR.md)).
- **Core Mission**: Preserve product identity, local-first IndexedDB persistence, existing course/lesson IDs, practice history, backup compatibility, and distraction-free developer experience.
- **Execution Discipline**: Work strictly on one phase or approved subphase per session. Inspect before modifying code. Run builds, lints, and tests after every change. No unapproved architectural rewrites or unvetted dependencies.

### 1.2 Git Environment Status
- **Current Branch**: `refactor/focusflow-production-hardening` (Verified created & checked out)
- **Stable Baseline Tag**: `pre-refactor-stable` (Verified tagged on initial commit `09901a4`)
- **Application Source Code Status**: **0 source files modified** in `src/`.
- **API Key Guard**: Zero new API keys were added to the codebase. Hardcoded API key in client source code is marked for replacement with a server-side `YOUTUBE_API_KEY` environment variable in Phase 1.

---

## 2. Generated Evidence Artifacts Directory Structure

All empirical evidence captured during Phase 0 is stored in the following repository-relative paths:

- **Screenshot Evidence Directory**: [`./evidence/screenshots/`](./evidence/screenshots/) (Contains 99 captured screenshots across 9 viewports & 11 routes/overlays)
- **Screenshot Manifest**: [`./evidence/screenshots/manifest.json`](./evidence/screenshots/manifest.json) (Catalog of expected, captured, missing, and failed screenshots)
- **Page Horizontal Overflow Metrics**: [`./evidence/overflow/horizontal_overflow_measurements.json`](./evidence/overflow/horizontal_overflow_measurements.json)
- **Overlay Bounding Box & Clipping Metrics**: [`./evidence/overflow/overlay_bounding_box_measurements.json`](./evidence/overflow/overlay_bounding_box_measurements.json)
- **Playwright Performance Web Vitals**: [`./evidence/performance/playwright_web_vitals_baseline.json`](./evidence/performance/playwright_web_vitals_baseline.json)
- **React Profiler & Interaction Traces**: [`./evidence/profiler/react_profiler_evidence.json`](./evidence/profiler/react_profiler_evidence.json)
- **PWA & Offline Persistence Audit**: [`./evidence/pwa_baseline_audit.json`](./evidence/pwa_baseline_audit.json)

---

## 3. Responsive Viewport, Screenshot Manifest & Overflow Evidence Matrix

### 3.1 Tested Viewports & Screenshot Manifest Summary
Screenshots were captured using Playwright Chromium across all required viewports and routes. Real Course Detail and real Watch screens were reached via UI click navigation after IndexedDB seeding completed.

Manifest Summary ([`./evidence/screenshots/manifest.json`](./evidence/screenshots/manifest.json)):
- **Total Expected**: 99 (9 viewports × 11 routes/overlays)
- **Total Captured**: 99 (100% complete file existence)
- **Total Missing**: 0
- **Total Failed**: 0

| Viewport Name | Resolution | Captured Routes & Overlays in [`./evidence/screenshots/`](./evidence/screenshots/) | Manifest Status |
|---|---:|---|:---:|
| **Small Phone** | `320 × 568` | Dashboard, Course Detail, Watch, Practice List, Practice Flashcard, Settings, Import Modal, Command Palette, Pomodoro, Streak, Offline | **11/11 Captured** |
| **Common Phone** | `360 × 800` | Dashboard, Course Detail, Watch, Practice List, Practice Flashcard, Settings, Import Modal, Command Palette, Pomodoro, Streak, Offline | **11/11 Captured** |
| **Modern Phone** | `390 × 844` | Dashboard, Course Detail, Watch, Practice List, Practice Flashcard, Settings, Import Modal, Command Palette, Pomodoro, Streak, Offline | **11/11 Captured** |
| **Large Phone** | `412 × 915` | Dashboard, Course Detail, Watch, Practice List, Practice Flashcard, Settings, Import Modal, Command Palette, Pomodoro, Streak, Offline | **11/11 Captured** |
| **Tablet Portrait** | `768 × 1024` | Dashboard, Course Detail, Watch, Practice List, Practice Flashcard, Settings, Import Modal, Command Palette, Pomodoro, Streak, Offline | **11/11 Captured** |
| **Tablet Landscape** | `1024 × 768` | Dashboard, Course Detail, Watch, Practice List, Practice Flashcard, Settings, Import Modal, Command Palette, Pomodoro, Streak, Offline | **11/11 Captured** |
| **Compact Laptop** | `1280 × 800` | Dashboard, Course Detail, Watch, Practice List, Practice Flashcard, Settings, Import Modal, Command Palette, Pomodoro, Streak, Offline | **11/11 Captured** |
| **Desktop** | `1440 × 900` | Dashboard, Course Detail, Watch, Practice List, Practice Flashcard, Settings, Import Modal, Command Palette, Pomodoro, Streak, Offline | **11/11 Captured** |
| **Phone Landscape** | `844 × 390` | Dashboard, Course Detail, Watch, Practice List, Practice Flashcard, Settings, Import Modal, Command Palette, Pomodoro, Streak, Offline | **11/11 Captured** |

### 3.2 Page Horizontal Overflow Measurements
Measured `document.documentElement.scrollWidth` vs `document.documentElement.clientWidth` across all required viewports (stored in [`./evidence/overflow/horizontal_overflow_measurements.json`](./evidence/overflow/horizontal_overflow_measurements.json)):

- **Dashboard**: `scrollWidth` === `clientWidth` (`diff: 0px`) across all 9 viewports.
- **Course Detail**: `scrollWidth` === `clientWidth` (`diff: 0px`) across all 9 viewports.
- **Watch Page**: `scrollWidth` === `clientWidth` (`diff: 0px`) across all 9 viewports.
- **Practice List**: `scrollWidth` === `clientWidth` (`diff: 0px`) across all 9 viewports.
- **Settings**: `scrollWidth` === `clientWidth` (`diff: 0px`) across all 9 viewports.

### 3.3 Overlay Bounding Box, Clipping & Scrollability Audit
Audited using DOM BoundingRect APIs across all viewports (stored in [`./evidence/overflow/overlay_bounding_box_measurements.json`](./evidence/overflow/overlay_bounding_box_measurements.json)):

| Target Overlay | Viewport | Found | Bounding Rect (x, y, w, h) | Viewport (w, h) | Clipping (L, R, T, B) | Internal Scroll | Selector Used |
|---|---|:---:|:---:|:---:|:---:|:---:|---|
| **Practice Flashcard** | `320 × 568` | `true` | (28, 78, 264, 247) | (320, 568) | (F, F, F, F) | `false` | `.glass-panel, [class*="card"]` |
| **Import Playlist Modal** | `320 × 568` | `true` | (16, 114, 288, 340) | (320, 568) | (F, F, F, F) | `true` | `.fixed.inset-0 > div, [role="dialog"]` |
| **Command Palette** | `320 × 568` | `true` | (16, 74, 288, 420) | (320, 568) | (F, F, F, F) | `true` | `.fixed.inset-0 > div, [role="dialog"]` |
| **Pomodoro Expanded** | `320 × 568` | `true` | (-8, 206, 320, 350) | (320, 568) | **(T, F, F, F)** | `false` | `.fixed.bottom-3, [class*="Pomodoro"]` |
| **Streak Modal** | `320 × 568` | `true` | (16, 24, 288, 520) | (320, 568) | (F, F, F, F) | `true` | `.fixed.inset-0 > div, [role="dialog"]` |
| **Offline Page** | `320 × 568` | `true` | (14, 70, 292, 428) | (320, 568) | (F, F, F, F) | `false` | `main, .glass-panel` |

*Key Finding*: `Pomodoro Expanded` exhibits **`isClipped.left: true`** (`x: -8px`) on `320×568` small phone viewports due to fixed right-aligned container offsets.

---

## 4. Playwright Performance & Web Vitals Baseline

**Measurement Methodology & Environment Configuration**:
- **Measurement Method**: Custom Playwright Performance & Timings Instrumentation (`PerformanceObserver` for LCP/CLS, `performance.getEntriesByType('navigation')` for DOMContentLoaded and Load Event).
- **Measurement Limits & Qualification**: These values represent synthetic Playwright automated measurements on an unthrottled local preview server (`http://localhost:4174`), not full Chrome Lighthouse audit scores. Full Lighthouse CLI scores will be evaluated during Phase 10 release testing.
- **Network Configuration**: Unthrottled local HTTP static preview server.
- **CPU Configuration**: Native host CPU (unthrottled).

Stored in [`./evidence/performance/playwright_web_vitals_baseline.json`](./evidence/performance/playwright_web_vitals_baseline.json):

### 4.1 Mobile Viewport (375 × 667)
- **Dashboard**: LCP = `636 ms`, CLS = `0.0313`, DOMContentLoaded = `456 ms`, Load = `459 ms`
- **Watch**: LCP = `564 ms`, CLS = `0.0340`, DOMContentLoaded = `448 ms`, Load = `451 ms`
- **Practice**: LCP = `920 ms`, CLS = `0.1145` (*Note*: CLS > 0.1 threshold due to dynamic list card mounting), DOMContentLoaded = `426 ms`, Load = `429 ms`

### 4.2 Desktop Viewport (1440 × 900)
- **Dashboard**: LCP = `1228 ms`, CLS = `0.0653`, DOMContentLoaded = `503 ms`, Load = `506 ms`
- **Watch**: LCP = `828 ms`, CLS = `0.0108`, DOMContentLoaded = `430 ms`, Load = `433 ms`
- **Practice**: LCP = `1112 ms`, CLS = `0.0382`, DOMContentLoaded = `472 ms`, Load = `474 ms`

---

## 5. Playwright Timings & Interaction Trace Evidence

**Instrumentation Method**: Custom Playwright Timings Instrumentation (recording interaction durations, trigger events, re-rendering component trees, and commit durations).

Stored in [`./evidence/profiler/react_profiler_evidence.json`](./evidence/profiler/react_profiler_evidence.json):

1. **10-Second Video Playback**:
   - **Trigger**: HTML5 / YouTube Video TimeUpdate Interval (200ms - 1000ms ticks)
   - **Components Rerendered**: `Watch`, `VideoControls`, `ProgressBar`
   - **Approximate Render Count**: 40 renders in 10s
   - **Average Commit Duration**: `2.4 ms`
2. **Changing Practice Filters**:
   - **Trigger**: Topic / Difficulty filter selection state change
   - **Components Rerendered**: `PracticeTab`, `QuestionList`
   - **Approximate Render Count**: 2 renders
   - **Average Commit Duration**: `3.1 ms`
3. **10-Second Pomodoro Timer Run**:
   - **Trigger**: `setInterval` 1000ms tick
   - **Components Rerendered**: `PomodoroTimerWidget`
   - **Approximate Render Count**: 10 renders in 10s
   - **Average Commit Duration**: `0.9 ms`

---

## 6. Exact Production Bundle API-Key Exposure Audit

### 6.1 Audit Command & Redaction Verification
- **Executed Audit Command**:
  ```bash
  node -e "const fs = require('fs'); const content = fs.readFileSync('dist/assets/' + fs.readdirSync('dist/assets').find(f => f.startsWith('Dashboard-')), 'utf8'); const matches = content.match(/AIza[0-9A-Za-z-_]{35}|YOUTUBE_API_KEY/g); console.log('Matches:', matches);"
  ```
- **Finding**: **Confirmed Defect**. A Google YouTube API key starting with `AIza...` was found hardcoded in client source code (`src/services/youtube.js`) and compiled into production bundle `dist/assets/Dashboard-DMU5UL-V.js`.
- **Phase 0 Redaction Action**: All complete key values in documentation and evidence files have been replaced with `[REDACTED_GOOGLE_API_KEY]`. The exposed key is marked for revocation and replacement with a server-side `YOUTUBE_API_KEY` environment variable in Phase 1.
- **Affected Files**: `src/services/youtube.js` (Client source file containing key - to be remediated in Phase 1), `dist/assets/Dashboard-DMU5UL-V.js` (Production asset containing key).

---

## 7. Database Versioning & PWA Baseline Audit

### 7.1 Database Layer Versioning Clarification
Audited via browser IndexedDB connection (stored in [`./evidence/pwa_baseline_audit.json`](./evidence/pwa_baseline_audit.json)):
- **Dexie Application Schema Version**: **`3`** (High-level schema definition in `FocusFlowDB.js` via `this.version(3).stores(...)`).
- **Native Browser IndexedDB Database Version**: **`30`** (Observed in `indexedDB.open('FocusFlowDB').version`).
- **Architectural Clarification**: Dexie's application schema version (v3) represents the high-level schema contract. The native browser IndexedDB version 30 represents Dexie's internal IndexedDB version mapping for schema version 3, not accumulated changes across browser instances.

### 7.2 PWA Audit & Table Record Persistence
Audited using Chromium IndexedDB store counts before and after browser reload (stored in [`./evidence/pwa_baseline_audit.json`](./evidence/pwa_baseline_audit.json)):

- **App Shell Offline Navigation**: `appShellCached: true` (Cached static assets load successfully when offline).
- **Offline Fallback Route**: `offlineRouteReachable: true` (`/offline` route loads cleanly).
- **IndexedDB Record Persistence Verification (`recordCountsMatch: true`)**:
  - `courses`: **2 records** before reload ➔ **2 records** after reload (Sample keys: `["PLu71SKxNbfoBuX3f4EOACle2y-tRC5Q37", "git-github-masterclass-q8EevlEpQ2A"]`)
  - `lessons`: **52 records** before reload ➔ **52 records** after reload (Sample keys: `["-9knnv97wSc", "-GoKoR6aLcY", ... ]`)
  - `notes`: **0 records** before reload ➔ **0 records** after reload
  - `practiceProgress`: **0 records** before reload ➔ **0 records** after reload
  - `progress`: **0 records** before reload ➔ **0 records** after reload
- **Unverified PWA Limitations (To be evaluated in Phase 9)**:
  - Service-worker update notification toast trigger
  - Stale-cache recovery after deployment
  - Old cache storage deletion/cleanup
  - Active-session update behavior during live video playback

---

## 8. Categorized Findings & Defect Classification

### 8.1 Confirmed Defects
1. **Broken Backup Import (`Settings.jsx`)**: `handleImport` references `reader.onerror` and `reader.readAsText(file)` without declaring `const reader = new FileReader()` or setting `reader.onload`. Causes a runtime `ReferenceError` when importing JSON backups.
2. **API Key Exposure in Client Bundle**: Google API key is hardcoded in `src/services/youtube.js` and exposed in compiled production bundle `dist/assets/Dashboard-DMU5UL-V.js`.
3. **Practice URL Zod Schema Rejection (`types/schemas.ts`)**: `PracticeProgressSchema` validates `practiceUrl` as `z.string().url()`. Completed practice questions without a URL pass `""`, causing Zod validation errors during backup export/import.
4. **Dashboard Notes Count Discrepancy (`Dashboard.jsx` vs `useFocusFlow.js`)**: `Dashboard.jsx` reads `stats.notesCount` while `useFocusFlow.js` computes `stats.totalNotes`, causing Dashboard to display `0` notes.
5. **Streak Calculation Field Inconsistency (`streakUtils.js` vs `StreakModal.jsx`)**: `streakUtils.js` checks `p.watchTime || p.currentTime >= 600`, whereas `StreakModal.jsx` re-implemented inline checks on `p.currentTime`.
6. **Overlay Clipping on Small Viewports (`PomodoroTimer.jsx`)**: Pomodoro Expanded widget exhibits `isClipped.left: true` (`x: -8px`) on 320px viewport width.

### 8.2 Suspected Risks
1. **Unisolated Watch Page Rerenders**: Player time updates (every 200ms - 1000ms) re-render the parent `Watch` container. Profiler shows 40 renders in 10s (`2.4ms` avg commit duration).
2. **Pomodoro Sub-Second Storage Writes**: Pomodoro timer persistence writes to `localStorage` on timer transitions.
3. **Practice Question Identity Disconnect**: Lesson practice vs Global Practice Hub use different question ID mapping paradigms.

### 8.3 Recommendations
1. Move YouTube playlist API requests behind a serverless proxy (`api/youtube-playlist.js`) configured with a server-side `YOUTUBE_API_KEY`.
2. Decompose `Watch.jsx` into an isolated `useYouTubePlayerController` hook.
3. Allow optional/null URLs in `PracticeProgressSchema`.
4. Wrap all dialogs in a shared accessible `DialogShell` primitive.

---

## 9. Qualified Performance & Rerender Claims

- **Memoization & `will-change` Impact**: Profiler traces confirm `PomodoroTimerWidget` renders 10 times in 10s with an average commit duration of `0.9ms`. `will-change-transform` provides layer promotion in Chrome, but permanent `will-change` consumes GPU memory. Future phases will optimize layer creation based on active animation states rather than permanent CSS properties.

---

## 10. Baseline Audit Summary & Next Phase

- **Phase 0 Status**: **COMPLETED & FULLY DOCUMENTED**
- **Application Source Code Status**: **0 files modified in `src/`**.
- **Exact Next Approved Phase**: **Phase 1 — Correctness, Backup and API Security**.
