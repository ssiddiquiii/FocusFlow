# FocusFlow Refactor — Revised Phase 1 Inspection & Implementation Plan

**Scope:** Correctness, Backup and API Security  
**Safety Branch:** `refactor/focusflow-production-hardening`  
**Baseline Tag:** `pre-refactor-stable` (Commit `09901a4`)  
**Phase Status:** Revised Inspection Complete (0 source files modified)

---

## 1. Verified Defects

### Defect 1: Broken Backup Import File Handling
- **Current Behavior:** Clicking "Import Backup JSON" and selecting a valid `.json` backup file throws an uncaught JavaScript error (`ReferenceError: reader is not defined`) and fails to import.
- **Root Cause:** `handleImport` in [`src/pages/Settings.jsx`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/src/pages/Settings.jsx#L40-L51) references `reader.onerror` and `reader.readAsText(file)` without declaring `const reader = new FileReader()` and without attaching a `reader.onload` callback handler.
- **Exact File:** [`src/pages/Settings.jsx`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/src/pages/Settings.jsx)
- **Relevant Component/Function:** `Settings` component -> `handleImport`
- **User Impact:** Users are completely unable to restore exported JSON backups of their courses, watch progress, timestamped notes, and practice completion records.
- **Severity:** **P0 (Critical — Core Feature Broken)**

### Defect 2: Non-Atomic UI Handling during Backup Import
- **Current Behavior:** If a user selects a corrupted JSON file or invalid schema backup, file input state is not reset in a `finally` block, duplicate submissions are not blocked, and JSON syntax errors are not distinguished from schema validation or database errors.
- **Root Cause:** `Settings.jsx` lacks input lock state (`isImporting`), does not use modern promise-based `file.text()` parsing inside isolated try/catch/finally blocks, and does not differentiate `SyntaxError`, `ZodError`, and database errors.
- **Exact File:** [`src/pages/Settings.jsx`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/src/pages/Settings.jsx)
- **Relevant Component/Function:** `Settings.handleImport`
- **User Impact:** Invalid JSON files cause unhandled rejections, leaving file input controls locked or unresponsive without clear error guidance.
- **Severity:** **P1 (User Interface Error Recovery Risk)**

### Defect 3: Overly Restrictive Practice Progress URL Validation
- **Current Behavior:** Practice progress items with empty string URLs (`""`) cause `BackupSchema.parse()` to throw a Zod validation error (`invalid_url`), blocking backup export and import.
- **Root Cause:** `PracticeProgressSchema` in [`src/types/schemas.js`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/src/types/schemas.js#L65-L72) defines `practiceUrl: z.string().url()`, which strictly rejects empty strings `""`.
- **Exact File:** [`src/types/schemas.js`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/src/types/schemas.js)
- **Relevant Component/Function:** `PracticeProgressSchema`
- **User Impact:** Users with practice completion records containing empty URLs cannot export or restore their data backups.
- **Severity:** **P1 (Data Export/Import Blocker)**

### Defect 4: Dashboard Notes Count Contract Discrepancy
- **Current Behavior:** The Dashboard header statistics banner always displays "0 Notes Written" even when the user has written timestamped notes in IndexedDB.
- **Root Cause:** `useFocusFlow.js` calculates and returns `{ totalNotes }` in its memoized `stats` object, but [`src/pages/Dashboard.jsx`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/src/pages/Dashboard.jsx#L346) reads `stats.notesCount || 0`. Because `stats.notesCount` is `undefined`, it permanently falls back to `0`.
- **Exact File:** [`src/pages/Dashboard.jsx`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/src/pages/Dashboard.jsx) & [`src/hooks/useFocusFlow.js`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/src/hooks/useFocusFlow.js)
- **Relevant Component/Function:** `Dashboard` header stats banner / `useFocusFlow` (`stats` memo)
- **User Impact:** Dashboard displays an inaccurate zero count for notes created, misleading users about their study achievements.
- **Severity:** **P2 (UI Contract Mismatch)**

### Defect 5: Ununified and Inconsistent Streak Calculation
- **Current Behavior:** The consecutive daily streak count displayed on the Dashboard badge and the active study dates displayed in the Streak Modal heatmap calendar can diverge.
- **Root Cause:** [`src/components/StreakModal.jsx`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/src/components/StreakModal.jsx#L31-L38) duplicates streak date calculation logic inline instead of consuming `streakUtils.js`, and incorrectly checks `(p.currentTime && p.currentTime >= 600)` while ignoring `p.watchTime`.
- **Exact File:** [`src/components/StreakModal.jsx`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/src/components/StreakModal.jsx) & [`src/utils/streakUtils.js`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/src/utils/streakUtils.js)
- **Relevant Component/Function:** `StreakModal` inline streak calculation vs `calculateStreak` in `streakUtils.js`
- **User Impact:** Users see contradictory streak data between the Dashboard header badge and the monthly activity calendar dialog.
- **Severity:** **P2 (Domain Logic Inconsistency)**

### Defect 6: Hardcoded Allowlist in Server Endpoint & Exposed Client API Key
- **Current Behavior:** `api/youtube.js` contains a hardcoded `ALLOWLIST` restricting queries to 3 specific playlist IDs, breaking custom playlist imports. Concurrently, `src/services/youtubeApi.js` executes direct browser fetches using `VITE_YOUTUBE_API_KEY`, exposing a hardcoded Google API key in production bundle assets (`dist/assets/Dashboard-DMU5UL-V.js`).
- **Root Cause:** [`api/youtube.js`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/api/youtube.js#L1-L50) rejects non-allowlisted playlist IDs, while [`src/services/youtubeApi.js`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/src/services/youtubeApi.js#L51-L141) relies on client environment variables.
- **Exact File:** [`api/youtube.js`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/api/youtube.js) & [`src/services/youtubeApi.js`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/src/services/youtubeApi.js)
- **Relevant Component/Function:** `handler` in `api/youtube.js` / `fetchYouTubePlaylistData` in `youtubeApi.js`
- **User Impact:** Custom user playlist import is rejected by server allowlist, and public frontend JavaScript bundles contain exposed API keys.
- **Severity:** **P0 (Critical — Security Vulnerability & Broken Import)**

---

## 2. Files Requiring Modification

| File | Reason | Planned Change |
|---|---|---|
| [`src/pages/Dashboard.jsx`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/src/pages/Dashboard.jsx) | Fix stats property mismatch | Update line 346 from `stats.notesCount || 0` to `stats.totalNotes || 0`. |
| [`src/types/schemas.js`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/src/types/schemas.js) | Normalize practice URLs cleanly | Update `PracticeProgressSchema` so `practiceUrl` accepts valid URLs, empty strings `""`, or `null`/`undefined`, and transforms empty strings `""` to `null`. |
| [`src/pages/Settings.jsx`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/src/pages/Settings.jsx) | Repair backup import flow using promise API | Refactor `handleImport` to use `await file.text()`, add `isImporting` loading state, distinguish `SyntaxError`, `ZodError`, and database errors, and reset file input in `finally`. |
| [`src/utils/streakUtils.js`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/src/utils/streakUtils.js) | Provide canonical local-date and activity normalization | Export `toLocalDateString(date)` and `getActiveDateSet(progressList, practiceProgressList)` using `const watchedSeconds = p.watchTime ?? p.currentTime ?? 0; const isActive = watchedSeconds >= 600 || p.completed === true;`. |
| [`src/components/StreakModal.jsx`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/src/components/StreakModal.jsx) | Unify streak calendar calculation | Remove duplicate inline active date logic and consume shared `getActiveDateSet` and `calculateStreak` from `streakUtils.js`. |
| [`api/youtube.js`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/api/youtube.js) | Consolidate canonical serverless API proxy | Remove `ALLOWLIST`, restrict HTTP method to GET/OPTIONS, validate `playlistId` via regex `/^[a-zA-Z0-9_-]+$/`, read `process.env.YOUTUBE_API_KEY`, apply 10s upstream timeout, and normalize status codes (400, 404, 405, 429, 502, 503, 504). |
| [`src/services/youtubeApi.js`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/src/services/youtubeApi.js) | Eliminate client API key exposure | Remove `VITE_YOUTUBE_API_KEY` import, remove direct `googleapis.com` fetches, and refactor `fetchYouTubePlaylistData` to query canonical `/api/youtube?playlistId=...`. |

---

## 3. Proposed Implementation Sequence

1. **Step 1: Dashboard Statistics Contract Alignment (`src/pages/Dashboard.jsx`)**
   - Update `Dashboard.jsx` to consume canonical `stats.totalNotes`.
   - Verify `useFocusFlow.js` is unchanged and no `notesCount` alias is added.

2. **Step 2: Practice URL Schema Normalization (`src/types/schemas.js`)**
   - Update `PracticeProgressSchema` in `schemas.js` to normalize empty strings `""` to `null`.
   - Verify Zod schema validation passes cleanly for valid URLs, `null`, missing properties, and legacy `""`.

3. **Step 3: Promise-Based Backup Import Repair (`src/pages/Settings.jsx`)**
   - Refactor `handleImport` to use `await file.text()`.
   - Implement `isImporting` UI lock, error category differentiation (`SyntaxError`, `ZodError`, DB Error), and reset input in `finally`.

4. **Step 4: Unified Streak Logic & Local Date Normalization (`src/utils/streakUtils.js` & `src/components/StreakModal.jsx`)**
   - Implement `toLocalDateString` and `getActiveDateSet` in `streakUtils.js` using explicit `watchedSeconds` and `isActive` rules.
   - Refactor `StreakModal.jsx` to consume shared `getActiveDateSet` and `calculateStreak`.

5. **Step 5: Canonical Server YouTube API Proxy & Key Revocation (`api/youtube.js` & `src/services/youtubeApi.js`)**
   - Consolidate `api/youtube.js`: remove `ALLOWLIST`, enforce GET method, add regex validation, 10s timeout, and status normalization (400, 404, 405, 429, 502, 503, 504).
   - Update `src/services/youtubeApi.js` to fetch `/api/youtube?playlistId=...` and remove all `VITE_YOUTUBE_API_KEY` references.

6. **Step 6: Production Build & Bundle API Key Audit**
   - Execute `npm run build` and run a regex scanner over `dist/assets/*.js` searching for Google API key patterns (`AIza[0-9A-Za-z-_]{35}`).

---

## 4. Data and Backward-Compatibility Risks

### 4.1 Backup Implementation Verification (`FocusFlowDB.js`)
Inspection of existing `FocusFlowDB.importBackup` in [`src/db/FocusFlowDB.js`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/src/db/FocusFlowDB.js#L129-L150):
- **Zod Validation Timing:** `BackupSchema.parse(rawBackup)` executes at line 131 **before** the transaction opens at line 133.
- **Transaction Scope:** All table clears (`clear()`) and bulk put operations (`bulkPut()`) execute inside a single Dexie transaction (`this.transaction('rw', [this.courses, this.lessons, this.progress, this.notes, this.practiceProgress], async () => { ... })`).
- **Participating Tables:** `courses`, `lessons`, `progress`, `notes`, `practiceProgress`.
- **Asynchronous Escapes:** **None.** All operations inside the transaction callback are direct Dexie table promises.
- **Decision:** **Do NOT rewrite `FocusFlowDB.importBackup`.** It is already fully atomic.

### 4.2 Practice URL Normalization Rules
- Valid URL -> Preserved (e.g. `"https://leetcode.com/problems/two-sum"`).
- Empty string `""` -> Normalized to `null`.
- `null` -> Allowed as `null`.
- Missing property -> Allowed as `null`.

### 4.3 Existing User Data Safety
- All existing IndexedDB tables (`courses`, `lessons`, `progress`, `notes`, `practiceProgress`) remain 100% intact.
- Pre-validation in `importBackup` guarantees that invalid JSON or malformed schema payloads fail *before* database tables are cleared, preserving existing user data on every validation failure.

---

## 5. YouTube API Security Plan & Endpoint Decision

### Canonical Server Endpoint Decision
- **Endpoint Path:** `/api/youtube` (Existing serverless function file: [`api/youtube.js`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/api/youtube.js)).
- **Do NOT create `/api/youtube-playlist`.** Consolidate existing `api/youtube.js`.

### Endpoint Security & Behavior:
1. **Allowed HTTP Method:** Reject non-GET requests with `405 Method Not Allowed`. Allow OPTIONS for CORS preflight.
2. **Input Validation:** Validate `playlistId` parameter against regex `/^[a-zA-Z0-9_-]+$/`. Return `400 Bad Request` if invalid or missing. Remove `ALLOWLIST` check to support all public YouTube playlists.
3. **Environment Key Reading:** Read strictly `process.env.YOUTUBE_API_KEY`. If undefined or empty, return `503 Service Unavailable` (`{ error: "YouTube API service unconfigured" }`).
4. **Upstream Timeout:** Attach `AbortSignal.timeout(10000)` (10 seconds) to Google API `fetch` requests. Return `504 Gateway Timeout` on timeout.
5. **Status Normalization:**
   - `400`: Invalid request parameters or malformed playlist ID.
   - `404`: Playlist not found or private.
   - `405`: HTTP method not allowed.
   - `429`: Upstream YouTube API quota exceeded (mapped from Google 403 quota errors or 429).
   - `502`: Upstream Google API network failure or bad gateway.
   - `503`: Server configuration error (missing `YOUTUBE_API_KEY`).
   - `504`: Upstream fetch timeout (> 10s).
6. **Payload Contract:** Returns `{ course, lessons }` matching the current payload structure expected by `ImportPlaylistModal.jsx` and `youtubeApi.js` with zero breaking adapter changes.
7. **Client Key Removal & Bundle Verification:** Delete all `VITE_YOUTUBE_API_KEY` imports. Run production build `npm run build` and scan `dist/assets/*.js` to verify zero hardcoded `AIza...` key patterns exist.

---

## 6. Testing Strategy

Since the repository currently has no formal automated test runner configured in `package.json`, all Phase 1 tests will be executed via standalone verification scripts and build commands without adding external dependencies:

### Test 1: Backup Export/Import Round-Trip & Malformed JSON Safety
- **Script:** `node scratch/verify_backup_flow.js`
- **Procedure:** 
  1. Validates `BackupSchema.parse()` against full sample payloads.
  2. Tests invalid JSON syntax error rejection.
  3. Tests schema validation error rejection (`ZodError`).
  4. Verifies data restoration integrity across all 5 tables (`courses`, `lessons`, `progress`, `notes`, `practiceProgress`).

### Test 2: Practice URL Schema Normalization Unit Tests
- **Script:** `node scratch/verify_practice_schema.js`
- **Assertions:**
  - Valid URL `"https://leetcode.com/1"` -> preserved as `"https://leetcode.com/1"`.
  - Legacy empty string `""` -> normalized to `null`.
  - Explicit `null` -> allowed as `null`.
  - Missing `practiceUrl` property -> defaulted to `null`.

### Test 3: Streak & Local Date Normalization Unit Tests
- **Script:** `node scratch/verify_streak_logic.js`
- **Assertions:**
  - `watchTime = 5` seconds -> `isActive = false` (must not count).
  - `watchTime = 600` seconds -> `isActive = true` (must count).
  - `currentTime` legacy fallback = `600` seconds -> `isActive = true` (must count).
  - `completed = true` (with 0 watchTime) -> `isActive = true` (must count).
  - Activity timestamps close to local midnight (23:59:59 vs 00:00:01) produce distinct local date strings via `toLocalDateString`.

### Test 4: Dashboard Note Count & UI Integration Check
- **Procedure:** Run Playwright headless verification script `node scratch/verify_dashboard_notes.js` to confirm Dashboard top banner displays accurate `stats.totalNotes` from IndexedDB.

### Test 5: YouTube API Endpoint Status & Proxy Verification
- **Procedure:** Run standalone script `node scratch/verify_youtube_api.js` testing HTTP status normalization (400 for bad ID, 405 for POST, 503 for missing key, 200 for valid playlist).

### Test 6: Production Bundle API-Key Exposure Scan
- **Command:** `npm run build`
- **Verification Command:** `powershell -Command "Select-String -Path 'dist/assets/*.js' -Pattern 'AIza[0-9A-Za-z-_]{35}'"`
- **Required Result:** 0 matching lines found across all production bundle assets.

---

## 7. Environment Configuration

- **Developer Action Required (Sameed):**
  Must configure `YOUTUBE_API_KEY` as:
  - a local server environment variable in `.env.local`
  - a Vercel project environment variable in Vercel Dashboard Settings
- **Client Constraint:** The client source code must NEVER reference `VITE_YOUTUBE_API_KEY`.
- **Key Privacy Guarantee:** Antigravity will NOT request, print, or store the API key in any source file or log.

---

## 8. Files That Will Remain Untouched

- [`src/pages/Watch.jsx`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/src/pages/Watch.jsx)
- [`src/pages/CourseDetail.jsx`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/src/pages/CourseDetail.jsx)
- [`src/components/PracticeTab.jsx`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/src/components/PracticeTab.jsx)
- [`src/components/PomodoroTimer.jsx`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/src/components/PomodoroTimer.jsx)
- [`src/components/QuoteSandbox.jsx`](file:///c:/Users/samee/OneDrive/Desktop/focus-flow/src/components/QuoteSandbox.jsx)
- All other UI components, page layouts, and CSS files outside Phase 1 scope.

---

## 9. Migration Decision

**Dexie migration required:** **No**

**Technical Reason:**
The application Dexie schema version remains **`3`** (`this.version(3)` in `FocusFlowDB.js`) and the browser native IndexedDB version remains **`30`**. No table definitions, primary key paths, or index schemas are modified. Legacy empty-string practice URLs are normalized to `null` via Zod schema transforms at runtime without altering Dexie table indices or requiring an IndexedDB version bump.
