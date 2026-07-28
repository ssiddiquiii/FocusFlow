# FocusFlow Production Refactor Baseline (Phase 0 Audit Report)

**Date:** July 2026  
**Repository:** `ssiddiquiii/FocusFlow`  
**Safety Branch:** `refactor/focusflow-production-hardening`  
**Baseline Tag:** `pre-refactor-stable`  
**Audit Status:** Phase 0 Baseline Evidence Completed (0 application source code files modified)

---

## 1. Master Contract Acknowledgment & Setup Verification

### 1.1 Master Contract Acknowledgment
Antigravity hereby acknowledges the FocusFlow Master Refactor Contract (`docs/FOCUSFLOW_ANTIGRAVITY_MASTER_REFACTOR.md`).
- **Core Mission**: Preserve product identity, local-first IndexedDB persistence, existing course/lesson IDs, practice history, backup compatibility, and distraction-free developer experience.
- **Execution Discipline**: Work strictly on one phase or approved subphase per session. Inspect before modifying code. Run builds, lints, and tests after every change. No unapproved architectural rewrites or unvetted dependencies.

### 1.2 Git Environment Status
- **Current Branch**: `refactor/focusflow-production-hardening` (Verified created & checked out)
- **Stable Baseline Tag**: `pre-refactor-stable` (Verified tagged on initial commit `09901a4`)
- **Application Source Code Status**: **0 source files modified** in `src/`.

---

## 2. Generated Evidence Artifacts Directory Structure

All empirical evidence captured during Phase 0 is stored in the following repository paths:

- **Screenshots Matrix**: [`docs/evidence/screenshots/`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/docs/evidence/screenshots/) (Contains 80+ screenshots across 9 viewports & 11 routes/overlays)
- **Horizontal Overflow Metrics**: [`docs/evidence/overflow/horizontal_overflow_measurements.json`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/docs/evidence/overflow/horizontal_overflow_measurements.json)
- **Web Vitals & Performance**: [`docs/evidence/lighthouse/web_vitals_baseline.json`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/docs/evidence/lighthouse/web_vitals_baseline.json)
- **React Profiler Traces**: [`docs/evidence/profiler/react_profiler_evidence.json`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/docs/evidence/profiler/react_profiler_evidence.json)
- **PWA & Offline Persistence Audit**: [`docs/evidence/pwa_baseline_audit.json`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/docs/evidence/pwa_baseline_audit.json)

---

## 3. Responsive Viewport & Overflow Evidence Matrix

### 3.1 Tested Viewports & Screenshot Evidence
Screenshots were captured using Playwright Chromium across all required viewports and routes:

| Viewport Name | Resolution | Routes & Overlays Captured in [`docs/evidence/screenshots/`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/docs/evidence/screenshots/) |
|---|---:|---|
| **Small Phone** | `320 × 568` | Dashboard, Course Detail, Watch, Practice List, Practice Flashcards, Settings, Import Modal, Command Palette, Pomodoro, Streak, Offline |
| **Common Phone** | `360 × 800` | Dashboard, Course Detail, Watch, Practice List, Practice Flashcards, Settings, Import Modal, Command Palette, Pomodoro, Streak, Offline |
| **Modern Phone** | `390 × 844` | Dashboard, Course Detail, Watch, Practice List, Practice Flashcards, Settings, Import Modal, Command Palette, Pomodoro, Streak, Offline |
| **Large Phone** | `412 × 915` | Dashboard, Course Detail, Watch, Practice List, Practice Flashcards, Settings, Import Modal, Command Palette, Pomodoro, Streak, Offline |
| **Tablet Portrait** | `768 × 1024` | Dashboard, Course Detail, Watch, Practice List, Practice Flashcards, Settings, Import Modal, Command Palette, Pomodoro, Streak, Offline |
| **Tablet Landscape** | `1024 × 768` | Dashboard, Course Detail, Watch, Practice List, Practice Flashcards, Settings, Import Modal, Command Palette, Pomodoro, Streak, Offline |
| **Compact Laptop** | `1280 × 800` | Dashboard, Course Detail, Watch, Practice List, Practice Flashcards, Settings, Import Modal, Command Palette, Pomodoro, Streak, Offline |
| **Desktop** | `1440 × 900` | Dashboard, Course Detail, Watch, Practice List, Practice Flashcards, Settings, Import Modal, Command Palette, Pomodoro, Streak, Offline |
| **Phone Landscape** | `844 × 390` | Dashboard, Course Detail, Watch, Practice List, Practice Flashcards, Settings, Import Modal, Command Palette, Pomodoro, Streak, Offline |

### 3.2 Empirical Horizontal Overflow Measurements
Measured `document.documentElement.scrollWidth` vs `document.documentElement.clientWidth` across all required viewports (stored in [`docs/evidence/overflow/horizontal_overflow_measurements.json`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/docs/evidence/overflow/horizontal_overflow_measurements.json)):

- **Dashboard**: `scrollWidth` === `clientWidth` (`diff: 0px`) across all 9 viewports.
- **Course Detail**: `scrollWidth` === `clientWidth` (`diff: 0px`) across all 9 viewports.
- **Watch Page**: `scrollWidth` === `clientWidth` (`diff: 0px`) across all 9 viewports.
- **Practice List**: `scrollWidth` === `clientWidth` (`diff: 0px`) across all 9 viewports.
- **Settings**: `scrollWidth` === `clientWidth` (`diff: 0px`) across all 9 viewports.

*Note*: Root page-level horizontal overflow is currently 0px; however, inner component padding and flex layout wrapping on narrow devices (`< 360px`) require fine-tuning in future phases.

---

## 4. Performance & Web Vitals Baseline

Measured using Playwright Performance API (stored in [`docs/evidence/lighthouse/web_vitals_baseline.json`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/docs/evidence/lighthouse/web_vitals_baseline.json)):

### 4.1 Mobile Viewport (375 × 667)
- **Dashboard**: LCP = `636 ms`, CLS = `0.0313`, DOMContentLoaded = `456 ms`, Load = `459 ms`
- **Watch**: LCP = `564 ms`, CLS = `0.0340`, DOMContentLoaded = `448 ms`, Load = `451 ms`
- **Practice**: LCP = `920 ms`, CLS = `0.1145` (*Note*: CLS > 0.1 threshold due to dynamic list card mounting), DOMContentLoaded = `426 ms`, Load = `429 ms`

### 4.2 Desktop Viewport (1440 × 900)
- **Dashboard**: LCP = `1228 ms`, CLS = `0.0653`, DOMContentLoaded = `503 ms`, Load = `506 ms`
- **Watch**: LCP = `828 ms`, CLS = `0.0108`, DOMContentLoaded = `430 ms`, Load = `433 ms`
- **Practice**: LCP = `1112 ms`, CLS = `0.0382`, DOMContentLoaded = `472 ms`, Load = `474 ms`

---

## 5. React Profiler & Interaction Trace Evidence

Measured interaction traces (stored in [`docs/evidence/profiler/react_profiler_evidence.json`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/docs/evidence/profiler/react_profiler_evidence.json)):

1. **10-Second Video Playback**:
   - **Trigger**: HTML5 / YouTube Video TimeUpdate Interval (200ms - 1000ms ticks)
   - **Components Rerendered**: `Watch`, `VideoControls`, `ProgressBar`
   - **Approximate Render Count**: 40 renders in 10s
   - **Average Commit Duration**: `2.4 ms`
2. **Editing Notes**:
   - **Trigger**: Controlled textarea `onChange` input events
   - **Components Rerendered**: `NotesTab`, `NoteInput`
   - **Approximate Render Count**: 30 renders during typing session
   - **Average Commit Duration**: `1.8 ms`
3. **Changing Practice Filters**:
   - **Trigger**: Topic / Difficulty filter selection state change
   - **Components Rerendered**: `PracticeTab`, `QuestionList`
   - **Approximate Render Count**: 2 renders
   - **Average Commit Duration**: `3.1 ms`
4. **Marking Practice Question Solved**:
   - **Trigger**: Dexie `practiceProgress` mutation
   - **Components Rerendered**: `PracticeTab`, `QuestionCard`, `StatsBadge`
   - **Approximate Render Count**: 3 renders
   - **Average Commit Duration**: `4.2 ms`
5. **10-Second Pomodoro Timer Run**:
   - **Trigger**: `setInterval` 1000ms tick
   - **Components Rerendered**: `PomodoroTimerWidget`
   - **Approximate Render Count**: 10 renders in 10s
   - **Average Commit Duration**: `0.9 ms`

---

## 6. Exact Production Bundle API-Key Exposure Verification

### 6.1 Audit Command & Empirical Result
- **Executed Command**:
  ```bash
  node -e "const fs = require('fs'); const content = fs.readFileSync('dist/assets/' + fs.readdirSync('dist/assets').find(f => f.startsWith('Dashboard-')), 'utf8'); const matches = content.match(/AIza[0-9A-Za-z-_]{35}|YOUTUBE_API_KEY/g); console.log('Matches:', matches);"
  ```
- **Empirical Output**:
  ```text
  Matches: [ 'AIzaSyAExIAyfPvaaNixl5cz7HZJfNwQdniXP_o' ]
  ```
- **Finding**: **Confirmed Defect**. The secret YouTube API key `AIzaSyAExIAyfPvaaNixl5cz7HZJfNwQdniXP_o` is hardcoded in client source code and compiled directly into production bundle asset `dist/assets/Dashboard-DMU5UL-V.js`.

---

## 7. PWA & Offline Persistence Verification

Audited using Chromium offline network emulation (stored in [`docs/evidence/pwa_baseline_audit.json`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/docs/evidence/pwa_baseline_audit.json)):

1. **App Shell Offline Navigation**: `appShellCached: true` (Cached static assets load successfully when offline).
2. **Offline Fallback Route**: `offlineRouteReachable: true` (`/offline` route loads cleanly).
3. **IndexedDB Local Data Persistence**: `dbExists: true`, `version: 30`, stores: `["courses", "lessons", "notes", "practiceProgress", "progress"]`. All local tables persist intact across browser reloads.

---

## 8. Categorized Findings & Defect Classification

### 8.1 Confirmed Defects
1. **Broken Backup Import (`Settings.jsx`)**: `handleImport` references `reader.onerror` and `reader.readAsText(file)` without declaring `const reader = new FileReader()` or setting `reader.onload`. Causes a runtime `ReferenceError` when importing JSON backups.
2. **API Key Exposure in Client Bundle**: YouTube API key `AIzaSyAExIAyfPvaaNixl5cz7HZJfNwQdniXP_o` is hardcoded in `src/services/youtube.js` and exposed in compiled production bundle `dist/assets/Dashboard-DMU5UL-V.js`.
3. **Practice URL Zod Schema Rejection (`types/schemas.ts`)**: `PracticeProgressSchema` validates `practiceUrl` as `z.string().url()`. Completed practice questions without a URL pass `""`, causing Zod validation errors during backup export/import.
4. **Dashboard Notes Count Discrepancy (`Dashboard.jsx` vs `useFocusFlow.js`)**: `Dashboard.jsx` reads `stats.notesCount` while `useFocusFlow.js` computes `stats.totalNotes`, causing Dashboard to display `0` notes.
5. **Streak Calculation Field Inconsistency (`streakUtils.js` vs `StreakModal.jsx`)**: `streakUtils.js` checks `p.watchTime || p.currentTime >= 600`, whereas `StreakModal.jsx` re-implemented inline checks on `p.currentTime`.

### 8.2 Suspected Risks
1. **Unisolated Watch Page Rerenders**: Player time updates (every 200ms - 1000ms) re-render the parent `Watch` container. Profiler shows 40 renders in 10s (`2.4ms` avg commit duration). While currently fast, adding complex UI elements could cause frame drops on low-end mobile CPUs.
2. **Pomodoro Sub-Second Storage Writes**: Pomodoro timer persistence writes to `localStorage` on timer transitions.
3. **Practice Question Identity Disconnect**: Lesson practice vs Global Practice Hub use different question ID mapping paradigms, creating risk of progress desynchronization.

### 8.3 Recommendations
1. Extract YouTube playlist API requests to a serverless backend proxy endpoint (`api/youtube-playlist.js`) to conceal secret keys.
2. Replace monolithic `Watch.jsx` state with an isolated video player controller hook (`useYouTubePlayerController`).
3. Normalize empty string practice links to `null` in `PracticeProgressSchema`.
4. Wrap all dialogs in a shared accessible `DialogShell` primitive with focus trap and body scroll locking.

---

## 9. Qualified Performance & Rerender Claims

- **Memoization & `will-change` Impact**: Profiler traces confirm `PomodoroTimerWidget` renders 10 times in 10s with an average commit duration of `0.9ms`. `will-change-transform` provides layer promotion in Chrome, but permanent `will-change` consumes GPU memory. Future phases will optimize layer creation based on active animation states rather than permanent CSS properties.

---

## 10. Baseline Audit Summary & Next Phase

- **Phase 0 Status**: **COMPLETED & FULLY DOCUMENTED**
- **Application Source Code Status**: **0 files modified in `src/`**.
- **Exact Next Approved Phase**: **Phase 1 — Correctness, Backup and API Security**.
