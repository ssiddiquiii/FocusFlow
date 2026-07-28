# Phase 2C Implementation Report

## Scope

Phase 2C — Scoped Reactive Queries and Pure Selectors was implemented as the only roadmap phase in this pass. The complete Phase 2C scope was small enough to complete safely without splitting 2C-1 and 2C-2. Phase 3 was not started.

## Files Changed

Application:

- `src/utils/selectors.js` — added pure watched-time, progress, ordering, Continue Learning, Dashboard stats, and Course Detail selectors.
- `src/hooks/useDashboardData.js` — added Dashboard-domain reactive reads and memoized derived models.
- `src/hooks/useCourseDetail.js` — added guarded course-scoped reads and loading/not-found state.
- `src/hooks/useWatchData.js` — added guarded course, lesson, progress, and compound-index note reads.
- `src/hooks/usePracticeProgress.js` — added the Practice-domain progress subscription.
- `src/hooks/useFocusFlow.js` — removed after its consumer count reached zero.
- `src/pages/Dashboard.jsx` — migrated to `useDashboardData`, removed query effects/fan-out, and changed note export to a one-time read.
- `src/pages/CourseDetail.jsx` — migrated to `useCourseDetail` and added distinct loading/not-found rendering.
- `src/pages/Watch.jsx` — migrated to `useWatchData`, added distinct loading/not-found rendering, and preserved legacy-time resume.
- `src/pages/PracticeHub.jsx` — migrated to `usePracticeProgress`.
- `src/services/dataCommands.js` — added the one-time `exportNotes()` read command.

Verification and documentation:

- `scripts/verification/phase2c/verify_scoped_reads.js` — added 20 selector, scoping, reactive-isolation, route-state, and viewport assertions.
- `docs/refactor-state.md` — recorded the authoritative Phase 2C state.
- `docs/refactor-phase2c-implementation.md` — this report.

No database schema, API, public/PWA, package, lockfile, Vite, ESLint, Vercel, or Playwright configuration files were changed.

## Behavior Changed

- Dashboard derives every course percentage in memory from one lessons/progress snapshot instead of issuing one IndexedDB query per course.
- Continue Learning is a deterministic pure selector rather than an effect that performs repeated IndexedDB reads.
- Dashboard keeps only the note count reactive. The raw note collection is read only when Export Notes is clicked.
- Course Detail subscribes only to its course, its lessons, and its progress.
- Watch subscribes only to its course, lesson, course lessons/progress, and current lesson notes.
- Practice Hub subscribes only to practice progress.
- Invalid route IDs are rejected before a keyed IndexedDB query is issued.
- Course Detail and Watch show an initializing state while their route records resolve, then show not-found only after resolution.
- All playback-second derivations use `watchTime ?? currentTime ?? 0`; an explicit `watchTime: 0` remains authoritative.

## Data Compatibility Impact

- Dexie application schema remains version 3; no migration was added.
- No command or transaction semantics changed.
- Existing course IDs, lesson IDs, progress, notes, practice history, and imported courses remain unchanged.
- Legacy `currentTime` remains stored and is now honored by Dashboard totals, Course Detail resume, and Watch resume.
- Backup export remains version 2 and supported version 1/2 imports are unchanged.
- Phase 2A atomic import/reset, sticky completion, unknown-field preservation, seeding policy, and collision rejection remain verified.

## Verification Results

All final commands completed with exit code 0.

- `npm run lint`: passed, 0 errors and 46 warnings. This is seven fewer warnings than the Phase 2B baseline of 53.
- `npm run build`: passed; 2,305 modules transformed in 926 ms.
- Production output: main JavaScript chunk 612.70 kB minified / 191.53 kB gzip.
- PWA generation: passed; 28 entries and 918.99 KiB precached.
- Phase 1 practice schema: 4/4 passed.
- Phase 1 streak logic: 8/8 passed.
- Phase 1 YouTube endpoint unit verification: 5/5 passed.
- Phase 1 serverless API verification: 14/14 passed.
- Phase 1 production bundle secret scan: passed across 18 JavaScript assets with 0 Google API key patterns.
- Phase 1 browser and IndexedDB integration: 9/9 passed.
- Phase 1 Dashboard non-zero notes: 4/4 passed.
- Phase 1 invalid-backup preservation: 17/17 passed.
- Phase 1 backup practice URL roundtrip: 6/6 passed.
- Phase 1 live serverless smoke test: 8/8 passed.
- Phase 2A data-safety verification: 20/20 passed.
- Phase 2B bootstrap and command boundary verification: 15/15 passed.
- Phase 2C scoped read model verification: 20/20 passed.
- Combined retained automated assertions: 130/130 passed.
- Phase 2C responsive check: Dashboard, Course Detail, and Watch passed at 320×568, 360×800, 390×844, 412×915, 768×1024, 1024×768, 1280×800, 1440×900, and 844×390 with no root horizontal overflow or false not-found final state.
- `git diff --check`: passed before documentation finalization and must be repeated in the final handoff checks.

The first Phase 2C verification run found one test failure: the pure Course Detail selector assumed pre-sorted lesson input for the completed-course fallback. The selector was corrected to define its own `index`, then ID, ordering. The final Phase 2C result is 20/20.

## Phase 2C Acceptance Criteria

- Zero `useFocusFlow()` consumers: met; the unused hook was removed.
- No unrelated full-table subscriptions: met for route/domain consumers. Dashboard intentionally subscribes once to its complete catalog/activity domains because it renders global aggregates.
- No N-per-course query fan-out: met; course progress is derived in one pure pass.
- Pure selectors cover zero time, legacy time, empty catalog, completion, and tie behavior: met.
- Course Detail distinguishes loading from not-found: met.
- Invalid route IDs do not reach keyed Dexie queries: met by guarded hooks.
- Unrelated course writes do not emit a scoped Course Detail-style progress query: met with browser `liveQuery` evidence.
- Phase 2A data and backup contracts remain intact: met.
- Database schema remains version 3: met.
- Build, lint, tests, secret scan, and affected viewport checks have no failures: met.

## Unresolved Blockers

None.

## Deferred Non-Blocking Work

- Vite continues to report that the 612.70 kB main chunk exceeds its 500 kB warning threshold. Broader vendor/bootstrap chunking remains future performance work.
- The 46 existing lint warnings remain roadmap cleanup; the count decreased during this phase.
- Dashboard remains intentionally reactive to global courses, lessons, progress, practice progress, and note count because those datasets drive global catalog aggregates.
- Watch player-tick render isolation is not part of read-model scoping and remains Phase 6C.

## Stop Boundary

Phase 2C is complete and uncommitted. Do not begin Phase 3 until the user approves the Phase 2C commit and then issues a new `PROCEED NEXT PHASE`.
