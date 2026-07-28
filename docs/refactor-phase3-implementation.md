# Phase 3 — Reproducible Test Foundation

Date: 2026-07-29  
Branch: `refactor/focusflow-production-hardening`  
Starting commit: `7573654` (`refactor: scope reactive data reads`)  
Status: Implemented and verified; awaiting user review and commit approval

## Scope

This phase implements only Phase 3 from `docs/CODEX_FINAL_IMPLEMENTATION_PLAN.md`. It makes the existing verification coverage reproducible from package scripts and a clean dependency install. It does not change application source, API behavior, IndexedDB, backups, public assets, or deployment configuration.

## Files Changed

- `package.json`
  - Added explicit unit, browser, security, failure-runner, and aggregate test commands.
  - Added Playwright as a development dependency.
- `package-lock.json`
  - Locked Playwright 1.62.0 and Playwright Core 1.62.0.
- `playwright.config.js`
  - Added deterministic single-worker defaults, strict port ownership, a fixed loopback base URL, CI retry/`forbidOnly` behavior, and retained failure traces.
- `scripts/verification/run-suite.js`
  - Added the maintained unit/browser suite manifest.
  - Starts and closes its own Vite server for browser verification.
  - Runs scripts sequentially and propagates non-zero child exits.
- `scripts/verification/phase3/intentional_failure_fixture.js`
  - Added a controlled exit-code-7 fixture.
- `scripts/verification/phase3/verify_runner_failure.js`
  - Verifies that the suite runner reports the fixture failure as non-zero.
- Existing browser verification scripts under `scripts/verification/phase1`, `phase2a`, `phase2b`, and `phase2c`
  - Replaced the personal-server assumption at `localhost:5173` with `FOCUSFLOW_TEST_BASE_URL`, defaulting to the deterministic loopback test port.
- `docs/refactor-state.md`
  - Recorded the authoritative Phase 3 state.

## Intended and Verified Behavior

- `npm run test:unit` runs all five non-browser verification scripts.
- `npm run test:browser` owns a Vite server at `127.0.0.1:4173`, runs all seven browser scripts, and closes the server in a `finally` path.
- `npm test` runs both groups.
- `npm run test:security` scans the generated frontend bundle for exposed API-key patterns.
- `npm run test:runner` proves child failure propagation.
- `npm run test:all` builds first, runs all 130 assertions, scans the bundle, and verifies the failure path.
- Each browser script launches a fresh non-persistent Chromium context. No test reuses a personal browser profile or persistent IndexedDB.

## Data and Compatibility Impact

- Dexie schema version remains 3.
- No database schema, seed, read, write, import, export, reset, ID, progress, note, or practice-history code changed.
- Backup versions 1 and 2 remain unchanged and covered by the browser suite.
- Legacy `currentTime` preservation remains covered by Phase 2A verification.
- Production dependencies are unchanged. Playwright is development-only.
- No frontend secret or external-service behavior changed.

## Quality-Gate Evidence

| Command | Result |
| --- | --- |
| `npm ci` | Passed after an already-running FocusFlow Vite process was stopped because it held a native dependency file open; 616 packages installed and 617 audited |
| `npm run test:unit` | Passed, 39/39 assertions |
| `npm run test:browser` | Passed, 91/91 assertions; runner-owned Vite server started and stopped |
| `npm run test:all` | Passed: build, 130/130 assertions, secret scan, and failure propagation |
| `npm run build` (through `test:all`) | Passed; 2,305 modules transformed; PWA generated 28 precache entries |
| `npm run test:security` (through `test:all`) | Passed; 17 generated assets scanned, 0 exposed key patterns |
| `npm run test:runner` (through `test:all`) | Passed; intentional child exit 7 remained non-zero |
| `npm run lint` | Passed; 0 errors, 46 warnings, equal to the Phase 2C baseline |

The clean install reports 12 npm audit advisories (2 moderate and 10 high). They are deferred to the dependency-security roadmap because Phase 3 did not authorize production dependency upgrades or an unsafe automatic audit fix.

On this Windows/npm installation, `npm ls --depth=0` also labels five platform-support WASM packages as extraneous immediately after `npm ci`. Playwright and Playwright Core themselves are correctly locked and resolved through the declared development dependency; the verification suite does not depend on those unrelated top-level artifacts.

## Acceptance Criteria

- Clean lockfile installation: met.
- Explicit maintained test commands: met.
- Deterministic self-managed browser server: met.
- Browser/IndexedDB isolation: met.
- Existing automated coverage included: met.
- Non-zero test failure produces non-zero runner exit: met.
- No personal server, browser profile, frontend secret, or extraneous Playwright installation required: met.
- Build and tests produce CI-usable exit codes: met.

## Unresolved Blockers

None.

## Deferred Non-Blocking Issues

- The existing 46 lint warnings remain unchanged and belong to later roadmap phases.
- Vite continues to report the existing large-main-chunk warning.
- npm audit reports 12 dependency advisories; dependency upgrades require a separately approved phase.
- The npm-generated optional WASM artifacts described above remain a local installation-tree hygiene issue, not a Playwright or runtime dependency.

## Phase Boundary

Phase 4 — Responsive Application Shell has not started. No Phase 4 source or style changes are included in this worktree.
