# FocusFlow Production Refactor Baseline (Phase 0 Audit Report)

**Date:** July 2026  
**Repository:** `ssiddiquiii/FocusFlow`  
**Safety Branch:** `refactor/focusflow-production-hardening`  
**Baseline Tag:** `pre-refactor-stable`  
**Audit Purpose:** Comprehensive Phase 0 evidence capture and baseline metrics before any source code changes.

---

## 1. Master Contract Acknowledgment & Setup Verification

### 1.1 Master Contract Acknowledgment
Antigravity hereby acknowledges the FocusFlow Master Refactor Contract (`docs/FOCUSFLOW_ANTIGRAVITY_MASTER_REFACTOR.md`).
- **Core Mission**: Preserve product identity, local-first IndexedDB persistence, existing course/lesson IDs, practice history, backup compatibility, and distraction-free developer experience.
- **Execution Discipline**: Work strictly on one phase or approved subphase per session. Inspect before modifying code. Run builds, lints, and tests after every change. No unapproved architectural rewrites or unvetted dependencies.

### 1.2 Git Environment Status
- **Current Branch**: `refactor/focusflow-production-hardening` (Verified created & checked out)
- **Stable Baseline Tag**: `pre-refactor-stable` (Verified tagged on initial commit `09901a4`)
- **Application Source Code Status**: 0 source files modified during Phase 0.

---

## 2. Environment & Tooling Audit

### 2.1 Technology Stack
- **Framework & Runtime**: React `^19.2.7`, React DOM `^19.2.7`, React Router DOM `^7.18.1`
- **Build Tooling**: Vite `^8.1.1`, `@vitejs/plugin-react` `^6.0.3`
- **Styling**: Tailwind CSS `^4.3.3`, `@tailwindcss/vite` `^4.3.3`, `lucide-react` `^1.25.0`
- **Database & State**: Dexie `^4.4.4`, `dexie-react-hooks` `^4.4.0`, Zustand `^5.0.14`, Zod `^4.4.3`
- **PWA & UI Libraries**: `vite-plugin-pwa` `^1.3.0`, Framer Motion `^12.42.2`, `@base-ui/react` `^1.6.0`, `@tanstack/react-query` `^5.101.2`
- **Linter**: `oxlint` `^1.71.0`

### 2.2 Build & Lint Baseline Check
- **Build Execution (`npm run build`)**: **PASSED** (Duration ~1.1s - 2.8s)
  - Output bundle:
    - `dist/index.html` (0.66 kB)
    - `dist/assets/index-*.css` (85.29 kB)
    - `dist/assets/Watch-*.js` (129.00 kB)
    - `dist/assets/useFocusFlow-*.js` (197.53 kB)
    - `dist/assets/index-*.js` (443.03 kB)
    - PWA Service Worker `dist/sw.js` (27 precached entries, 913.49 KiB)
- **Linter Execution (`npm run lint` via oxlint)**: **53 Warnings, 0 Errors**
  - All 53 warnings relate to missing hook dependencies (`react-hooks/exhaustive-deps`) in `Watch.jsx`, `Dashboard.jsx`, `PracticeTab.jsx`, `App.jsx`, etc.
- **Automated Tests**: No automated test runner (Jest/Vitest/Playwright) is currently configured in `package.json`. Test suite implementation is targeted for Phase 10.

---

## 3. Source Code Architecture & Hotspot Analysis

### 3.1 Source File Size & Hotspot Matrix

| File Path | Line Count | Primary Responsibilities & Architectural Hotspots |
|---|---:|---|
| `src/pages/Watch.jsx` | **1,147** | Video player iframe lifecycle, custom controls, captions toggle, progress tracking interval, notes tab, reading tab, syllabus grid, chapter navigator, and mobile study tools tabs all combined in one monolithic component. |
| `src/components/PracticeTab.jsx` | **488** | Topic practice categorization, difficulty filtering, search, view toggle (List vs Flashcard), completion toggle, and flashcard deck navigation all combined. |
| `src/pages/Dashboard.jsx` | **468** | Course progress aggregation, continue learning path derivation, dynamic streak calculation, course cards, 50/50 vertical hero split, search trigger, and quote sandbox. |
| `src/components/PomodoroTimer.jsx` | **410** | Countdown timer engine, local-storage timestamp persistence, rest lock overlay, custom duration modal, and floating widget UI combined. |
| `src/App.jsx` | **275** | Desktop/mobile navigation drawers, command palette shortcut binding, error boundary wrapping, floating dock, and top-level router. |
| `src/db/FocusFlowDB.js` | **155** | Dexie schema versioning (v1, v2, v3), default course seeding (`seedIfEmpty`), backup export (`exportBackup`), backup import (`importBackup`), and progress clearing. |

---

## 4. Confirmed Functional Defects & Defect Matrix

### 4.1 P0 Critical Defects & Data Risks
1. **Broken Backup Import (`Settings.jsx`)**:
   - In `Settings.jsx` `handleImport`: The code references `reader.onerror` and `reader.readAsText(file)` without declaring `const reader = new FileReader()` or defining `reader.onload`.
   - **Impact**: Importing a backup JSON file throws a runtime `ReferenceError: reader is not defined` and fails.
2. **Practice URL Schema Incompatibility (`types/schemas.ts` & `PracticeProgressSchema`)**:
   - `PracticeProgressSchema` validates `practiceUrl` as `z.string().url()`. However, practice questions without external links pass empty strings `""` or nullish values, causing Zod parse validation failures during backup export/import.
   - **Impact**: Exporting or importing backups fails when any practice question without a URL is completed.
3. **Inconsistent Dashboard Notes Count Property (`Dashboard.jsx` vs `useFocusFlow.js`)**:
   - `Dashboard.jsx` reads `stats.notesCount || 0`, whereas `useFocusFlow.js` computes `stats.totalNotes`.
   - **Impact**: The "Notes Written" card on the Dashboard can display `0` even when user notes exist.
4. **Streak Calculation Field Inconsistency (`streakUtils.js` vs `StreakModal.jsx`)**:
   - `streakUtils.js` calculates active days checking `p.watchTime || p.currentTime >= 600`, whereas `StreakModal.jsx` separately re-implemented logic checking `p.currentTime`.
   - **Impact**: Dashboard streak badge and Streak Modal heatmap can disagree on active dates.

### 4.2 Security & API Key Risks
1. **YouTube Playlist API Key Client Exposure**:
   - `api/youtube-playlist.js` and client-side helpers need strict server-side key encapsulation and allowlist validation so secret API keys are never exposed in browser bundles or client requests.

---

## 5. Responsive Viewport Audit Matrix

| Viewport / Device Class | Dimensions | Audit Findings & Known Responsive Risks |
|---|---:|---|
| **Small Phone** | 320 × 568 | Compact viewports require stacked controls; Pomodoro widget and mobile drawer require dynamic height (`100dvh`) to avoid overflowing screen boundaries. |
| **Common Phone** | 360 × 800 | Header title text and action buttons require flex-wrapping and text truncation (`truncate`). |
| **Modern Phone** | 390 × 844 | Mobile top bar (`h-14`) requires proper `pt-14` offset on main content to prevent top header overlaps. |
| **Tablet Portrait** | 768 × 1024 | Breakpoint transition at `md:768px`: Floating navigation dock requires `md:pl-22` padding to avoid touching main workspace elements. |
| **Tablet Landscape** | 1024 × 768 | Desktop dock activates; Watch page layout requires clean wide two-column split without crowding video controls. |
| **Compact Laptop** | 1280 × 800 | Full workspace layout; Watch right sidebar (`w-80`) and video container (`flex-1`) fit with zero horizontal scroll. |
| **Desktop** | 1440 × 900 | Dashboard Option B 2-column split hero (`lg:col-span-7` vs `lg:col-span-5`) balances horizontal whitespace. |

---

## 6. Performance & Rendering Hotspots

1. **Watch Page Time-Tick Rerenders**:
   - YouTube player time-update interval (every 200ms - 1000ms) triggers parent state updates in `Watch.jsx`, causing full-tree re-renders of the video title, notes list, and course syllabus if not properly isolated.
2. **Pomodoro Timer Ticks**:
   - Pomodoro timer interval updates `timeLeft` state every second. Component is memoized with `will-change-transform` to prevent triggering layout repaints on parent components.
3. **Dashboard Aggregate Computations**:
   - Progress mappings across courses are wrapped in `useMemo` to prevent recalculating sorted lists on un-related state changes.

---

## 7. Confirmed Phase Execution Plan

```text
Phase 0: Baseline & Evidence Capture (COMPLETED)
   ↓
Phase 1: Correctness, Backup Atomicity & API Security
   ↓
Phase 2: Application Bootstrap & Narrow Data Repositories
   ↓
Phase 3: Responsive App Shell & Shared Primitives
   ↓
Phase 4A: Dashboard & Catalog Refactor
Phase 4B: Course Detail & Unified Streak System
   ↓
Phase 5A: Watch Workspace Decomposition
Phase 5B: Responsive Player & Workspace
Phase 5C: Isolated Player Timing & Progress Persistence
Phase 5D: Unified Notes, Reading & Pomodoro Integration
   ↓
Phase 6A: Practice Stable Identity & Dexie Migration
Phase 6B: Practice Modular Architecture
Phase 6C: Practice Responsiveness & Accessibility
Phase 6D: Practice Content Rendering & Deep Linking
   ↓
Phase 7A: Pomodoro Engine & Responsive Controls
Phase 7B: Unified Settings, DialogShell & Command Palette
   ↓
Phase 8: Rendering, CSS & Compositing Optimization
   ↓
Phase 9: Accessibility & PWA Offline Reliability
   ↓
Phase 10: Full Automated Testing & Release Validation
```

---
*End of Phase 0 Baseline Report.*
