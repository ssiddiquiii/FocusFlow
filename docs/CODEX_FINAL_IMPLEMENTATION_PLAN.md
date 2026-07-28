# FocusFlow Final Implementation Plan

**Status:** Single final source of truth for future implementation
**Based on:** Complete tracked repository audit at commit `c3253cb`
**Execution trigger:** No implementation begins until the user writes `PROCEED NEXT PHASE`.

## Governing rules

1. `AGENTS.md` and its permanent guarantees remain controlling.
2. Phase 0 evidence and the verified portions of Phase 1 are preserved.
3. Implement exactly one phase or explicitly named slice per run.
4. Do not change Dexie schema version without explicit user approval.
5. Preserve course IDs, lesson IDs, progress, notes, practice history, backup compatibility, and legacy `currentTime`.
6. Inspect affected files, add tests, run all applicable gates, review the complete diff, update `docs/refactor-state.md` plus the phase report, and stop.
7. Do not deploy, change external services, install production dependencies, or commit without the exact approvals required by `AGENTS.md`.

## Completed baseline retained

### Phase 0 — Baseline and evidence

Retain the existing screenshot, overflow, performance, profiler, and PWA evidence. It is historical baseline evidence, not proof that current critical overlays are responsive.

### Phase 1 — Retained verified improvements

Retain:

- Dashboard `stats.totalNotes` consumer correction.
- Practice URL `""` to `null` normalization.
- Promise-based backup file reading, duplicate-submit lock, error categorization, and input reset.
- Shared streak activity calculation with `watchTime ?? currentTime`.
- Server-side YouTube key boundary and client proxy call.
- Existing Phase 1 verification scripts.

Phase 1 is reclassified as “implemented with correctness closure required”; it is not rolled back or repeated.

## Standard quality gate for every phase

- `git diff --check`
- `npm run lint` — 0 errors; warnings must not exceed the audited 58 without explanation
- `npm run build`
- all tracked unit/integration/browser tests
- phase-specific tests listed below
- frontend secret scan
- full `git diff` review
- `git status --short`
- `git diff --stat`

Data phases additionally require backup round-trip and IndexedDB preservation tests. UI phases additionally require the nine-viewport matrix, overflow measurements, keyboard checks, reduced motion, and 200% zoom where applicable.

## Remaining implementation phases

## Phase 2A — Data-safety and correctness closure

This is the exact next phase. It must not include broad hook extraction or UI redesign.

**Affected files**

- `src/types/schemas.js`
- `src/db/FocusFlowDB.js`
- `src/hooks/useFocusFlow.js`
- `src/pages/Watch.jsx` only where required to call explicit persistence/completion commands
- `scripts/verification/phase2a/*` (new)
- `docs/refactor-state.md`
- `docs/refactor-phase2a-implementation.md` (new)

**Intended behavior**

- Preserve legacy `currentTime` through export/import/export; derive `watchTime` without deleting the legacy field.
- Make normal progress persistence preserve existing record fields and sticky completion.
- Provide a separate explicit manual completion/uncompletion command if current UI requires uncompletion.
- Reject unsupported backup versions and relationally invalid backups before any mutation.
- Stop startup from deleting legacy IDs or overwriting user-edited seed records.
- Seed only a genuinely new, completely empty database; do not silently repair or reseed partial/existing databases.
- Detect lesson-ID ownership collisions before import and abort the entire import without mutation. Keep existing IDs and Dexie version 3.

**Required tests**

- Legacy `currentTime` backup import/export round-trip.
- Existing record with unknown legacy fields survives progress save.
- Completed lesson remains completed after interval, pause, reopen, and route change.
- Explicit manual uncomplete changes only the intended record.
- Seed matrix: fresh empty, populated, partial, local marker loss if a marker is used, reset, and StrictMode/concurrent bootstrap.
- Legacy hard-coded course IDs are not deleted during normal startup.
- Duplicate video in two courses fails atomically and preserves both pre-existing course states.
- Unsupported backup version and every referential-integrity failure preserve sentinel data.
- Existing Phase 1 backup tests remain green.

**Acceptance criteria**

- B-01 through B-04 and H-01 from the audit are closed.
- Dexie schema remains version 3.
- No course, lesson, progress, note, practice, or legacy field is silently lost.
- Build/tests pass and lint remains at or below baseline.

## Phase 2B — Single bootstrap and command boundary

**Affected files**

- `src/main.jsx`
- `src/db/bootstrap.js` (new)
- `src/db/FocusFlowDB.js`
- `src/services/dataCommands.js` (new)
- `src/components/ErrorBoundary.jsx` or a new bootstrap state component
- `src/hooks/useFocusFlow.js`
- Phase 2B tests/report/state

**Intended behavior**

- Open/initialize the database once with a retryable single-flight bootstrap.
- Render explicit initializing, fatal-error/retry, and ready states.
- Move mutations and one-shot reads to named commands.
- Keep the Phase 2A seed/import/progress semantics unchanged.

**Required tests**

- Concurrent bootstrap single-flight.
- StrictMode does not duplicate initialization.
- Failed open/seed can retry.
- All command return/error contracts.
- Factory reset atomicity.

**Acceptance criteria**

- No consumer initializes/seeds the DB.
- Initialization failure is visible and recoverable.
- No data behavior differs from Phase 2A.

## Phase 2C — Scoped reactive queries and pure selectors

Split only if needed into 2C-1 (Dashboard/Course Detail) and 2C-2 (Watch/Practice/Settings/import modal).

**Affected files**

- `src/hooks/useDashboardData.js` (new)
- `src/hooks/useCourseDetail.js` (new)
- scoped Watch/Practice hooks (new)
- `src/utils/selectors.js` (new)
- `src/pages/Dashboard.jsx`
- `src/pages/CourseDetail.jsx`
- `src/pages/Watch.jsx`
- `src/pages/PracticeHub.jsx`
- `src/pages/Settings.jsx`
- `src/components/ImportPlaylistModal.jsx`
- remove/deprecate `src/hooks/useFocusFlow.js` only after zero consumers
- Phase 2C tests/report/state

**Intended behavior**

- Replace full-table subscriptions with route/domain-scoped live queries.
- Compute Dashboard progress and Continue Learning from already subscribed data.
- Keep raw notes out of Dashboard reactive state; read once for export.
- Guard invalid route IDs.
- Distinguish loading from not-found.
- Preserve `watchTime ?? currentTime ?? 0` everywhere.

**Required tests**

- Selector equivalence including zero-time, completed, legacy-time, empty catalog, and tie cases.
- Scoped query isolation across courses.
- Course Detail loading/not-found state.
- Render-counter evidence for unrelated writes.
- Full data/backup regression suite.

**Acceptance criteria**

- Zero `useFocusFlow()` consumers.
- No unrelated full-table subscriptions.
- No N-per-course query fan-out.
- Behavior and data contracts from Phase 2A remain intact.

## Phase 3 — Reproducible test foundation

This precedes further UI work because the current browser suite relies on extraneous local packages.

**Affected files**

- `package.json`
- `package-lock.json`
- `playwright.config.js` (new)
- test setup/config files
- migrate `scripts/verification/phase1/*` into a maintained test layout where practical
- Phase 3 report/state

**Intended behavior**

- Add explicit package scripts for unit/integration/E2E tests.
- Track Playwright as a development dependency only, subject to approval if installation is required.
- Provide isolated test databases, deterministic server lifecycle, and CI-friendly exit codes.
- Preserve standalone security scanning.

**Required tests**

- Clean-lockfile install followed by all test scripts.
- Phase 1 and Phase 2 regression tests.
- Failure-path test proving non-zero exit status.

**Acceptance criteria**

- A clean checkout can run the documented suite without extraneous packages.
- No test depends on personal browser state or external secrets.

## Phase 4 — Responsive app shell and shared interaction primitives

**Affected files**

- `src/App.jsx`
- `src/index.css`
- `src/hooks/useUIStore.js`
- new shell/navigation/dialog primitive files
- existing dialog consumers only as needed
- Phase 4 tests/report/state

**Intended behavior**

- Mobile/tablet navigation below 1024 px; desktop dock at 1024 px and above.
- Single navigation source and active-route helper.
- Accessible drawer with focus trap, Escape/backdrop/route close, scroll lock, focus restoration, safe areas, and `aria-current`.
- Valid/remove route transition abstraction and honor reduced motion.
- Shared dialog primitive introduced only for existing repeated needs.
- Remove root overflow clipping as a substitute for layout correction.

**Required tests**

- Drawer keyboard/focus lifecycle.
- Route active semantics.
- Nine viewport screenshots and root overflow measurements.
- Reduced motion and 200% zoom.

**Acceptance criteria**

- No cramped desktop dock at 768 px.
- No page-level horizontal overflow or hidden critical content.
- Shell controls meet accessible-name and touch-target requirements.

## Phase 5A — Dashboard and catalog

**Affected files**

- `src/pages/Dashboard.jsx`
- extracted Dashboard/catalog components
- `src/components/ImportPlaylistModal.jsx`
- Dashboard selectors/hooks from Phase 2
- tests/report/state

**Intended behavior**

- Decompose presentation without changing data identity.
- Explicit loading, empty, syncing, import error, and delete confirmation states.
- Stable course ordering and precomputed progress map.
- Course delete copy exactly describes affected local records.
- Responsive cards/actions and semantic search trigger.

**Required tests**

- Course order/progress/Continue Learning.
- Import/sync/delete success and failure.
- Long titles and empty/error/loading states at nine viewports.
- Keyboard and screen-reader action names.

**Acceptance criteria**

- No N+1 query behavior.
- Critical actions remain visible and usable at 320 px.

## Phase 5B — Course Detail and streak

**Affected files**

- `src/pages/CourseDetail.jsx`
- extracted course-detail components
- `src/components/StreakModal.jsx`
- shared dialog/calendar domain modules
- tests/report/state

**Intended behavior**

- Correct loading/not-found/empty/error states.
- Resume logic uses preserved legacy time and sticky completion.
- Modal consumes a derived calendar model and provides accessible navigation.
- Fix recorded landscape clipping.

**Required tests**

- No false not-found flash.
- Resume and course percentage correctness.
- Streak parity, midnight/timezone cases.
- Dialog focus/Escape/restoration and viewport matrix.

**Acceptance criteria**

- Dashboard and modal streak values always agree.
- Course Detail is touch-safe and unclipped.

## Phase 6A — Watch decomposition

**Affected files**

- `src/pages/Watch.jsx`
- new `features/watch/*` components/controller
- related tests/report/state

**Intended behavior**

- Extract player controller, controls, header, workspace, notes, syllabus, and chapters without changing persistence semantics.
- Keep exactly one player instance.
- Remove unused/dead Practice integration imports only after verification.

**Required tests**

- Behavioral characterization before/after for player initialization, controls, resume, completion, notes, and navigation.
- One-player-instance assertion.

**Acceptance criteria**

- Existing Phase 2A persistence behavior is identical.
- Components have isolated responsibilities and test boundaries.

## Phase 6B — Watch responsive workspace

**Affected files**

- Watch feature components and relevant CSS
- tests/report/state

**Intended behavior**

- True 16:9 media geometry without conflicting minimum height.
- Primary compact controls on phones; secondary controls in settings.
- One document scroll on mobile/tablet; side workspace only with sufficient width (normally ≥1280 px).
- Landscape and safe-area support.

**Required tests**

- Player/control interactions at all nine viewports.
- No overlap, clipping, nested page scroll, or layout shift.
- Touch and keyboard controls.

**Acceptance criteria**

- Watch critical behavior is usable at 320×568 and 844×390.

## Phase 6C — Player timing, lifecycle persistence, and captions

**Affected files**

- player controller/store
- Watch controls
- progress commands
- tests/report/state

**Intended behavior**

- Time ticks rerender only controls.
- Persist every 10–15 seconds and on pause, lesson change, visibility change, route exit/unmount, and completion.
- Keep completion sticky and resume bounded.
- Persist caption preference; never force captions off on play.

**Required tests**

- Lifecycle persistence with mocked player.
- Completion threshold/manual/reopen/end behavior.
- Caption preference/state synchronization.
- Profiler/render-counter evidence.

**Acceptance criteria**

- Notes/syllabus do not rerender on ticks.
- No recent progress loss across supported lifecycle exits.

## Phase 6D — Notes, reading, chapters, and Pomodoro player command

**Affected files**

- Watch workspace feature files
- `src/components/ReadingTab.jsx`
- player command interface
- note commands/hooks
- tests/report/state

**Intended behavior**

- One Notes implementation with create/edit/delete confirmation/timestamp seek.
- Preserve note IDs/timestamps.
- Reading accurately states its non-persistent behavior unless persistence is deliberately added.
- Efficient accessible chapter navigation.
- Pomodoro pauses the actual active player.

**Required tests**

- Note CRUD and timestamp seek.
- Long article/code responsiveness and safe external links.
- Chapter selection.
- Actual player pause on focus/rest transitions.

**Acceptance criteria**

- No duplicate mobile/desktop note logic.
- No uncontrolled database writes while typing.

## Phase 7A — Practice identity decision and safe migration

This phase requires explicit approval for a Dexie version change if migration is selected.

**Affected files**

- `src/db/FocusFlowDB.js`
- `src/types/schemas.js`
- practice data adapter/domain files
- `src/data/jsTopicPractice.json`
- `src/data/jsPracticeMap.json` only after a content/import comparison
- backup service/schema
- migration tests/report/state

**Intended behavior**

- Stable question mastery independent of route context.
- Preserve every legacy solved record; ambiguous records remain recoverable and documented.
- Normalize nullable references.
- Validate static catalogs.
- Do not rewrite educational answers.

**Required tests**

- Upgrade from Dexie versions 1, 2, and 3.
- Ambiguous/unambiguous/deduplicated practice records.
- Global/lesson solved-state parity.
- Old/new backup round-trip and rollback.

**Acceptance criteria**

- No solved record is silently lost.
- Existing course and lesson IDs remain unchanged.
- Schema version changes only with prior explicit approval.

## Phase 7B — Practice architecture

**Affected files**

- `src/components/PracticeTab.jsx` replaced/decomposed into `features/practice/*`
- `src/pages/PracticeHub.jsx`
- Watch practice entry
- tests/report/state

**Intended behavior**

- Separate catalogs, toolbar, filtering, summary, list, flashcard, and empty state.
- Precompute solved set.
- Synchronize/clamp state after catalog/topic/filter/lesson changes.

**Required tests**

- Catalog/topic/filter combinations.
- Prop changes without remount.
- Flashcard index clamping and empty state.
- Render isolation.

**Acceptance criteria**

- Same question state everywhere.
- No out-of-range flashcard state.

## Phase 7C — Practice responsive accessibility

**Affected files**

- Practice feature UI/CSS
- shared controls if already justified
- tests/report/state

**Intended behavior**

- Stacked phone toolbar.
- Standards-compliant select/listbox keyboard behavior.
- Semantic flashcard flip control without nested interactive parent.
- Touch-safe completion/actions, long-code containment, reduced motion.
- Fix documented phone and landscape clipping.

**Required tests**

- Keyboard selector and flashcard.
- 320 px, landscape, 200% zoom, reduced motion, long code.
- Screen-reader state announcements.

**Acceptance criteria**

- No clipped card/control and no page-level horizontal overflow.

## Phase 7D — Practice rendering and deep links

**Affected files**

- practice adapters/renderers
- `src/components/CommandPalette.jsx`
- route parsing/state
- content review report
- tests/report/state

**Intended behavior**

- Safely normalize existing string solutions into prose/code sections.
- Copy-code feedback without unsafe HTML.
- Command Palette routes to exact catalog/topic/question.
- Back navigation restores state.
- Material educational content edits remain separately approved.

**Required tests**

- Deep link, focus/highlight, Back behavior.
- Code rendering/copy/live feedback.
- Unsafe-content rejection.

**Acceptance criteria**

- Exact question navigation works and old catalog data remains renderable.

## Phase 8A — Pomodoro engine and responsive UI

**Affected files**

- `src/components/PomodoroTimer.jsx` replaced/decomposed
- timer hook/domain module
- player command integration
- tests/report/state

**Intended behavior**

- End-time-based engine with one-second display ticks.
- Persist only meaningful transitions/lifecycle events, not every 500 ms.
- Responsive panel and landscape-safe escapable rest overlay.
- Safe audio lifecycle and reduced motion.

**Required tests**

- Start/pause/reset/restore/mode transitions.
- Hidden-tab time correction.
- Player pause command.
- 320 px/landscape overlay and keyboard escape.

**Acceptance criteria**

- No recurring sub-second storage writes.
- No clipping or hostile lock state.

## Phase 8B — Settings, dialogs, import, and command palette

**Affected files**

- `src/pages/Settings.jsx`
- `src/components/ImportPlaylistModal.jsx`
- `src/components/CommandPalette.jsx`
- shared dialog primitives
- API client where abort support is added
- tests/report/state

**Intended behavior**

- Complete dialog semantics/focus lifecycle/mobile keyboard support.
- Accurate reset/clear labels and backup version/preview.
- Abort import request on close where safe; no arbitrary success auto-close.
- One global command handler and efficient search index.

**Required tests**

- Dialog focus trap/Escape/backdrop/restoration.
- Import abort/duplicate/error/success.
- Settings destructive-action descriptions.
- Command keyboard navigation at narrow/landscape viewports.

**Acceptance criteria**

- No recorded modal clipping.
- Async status uses accessible live regions.

## Phase 9 — Rendering, CSS, bundle, and dependency audit

**Affected files**

- `src/index.css`
- measured component hotspots
- `package.json`/lockfile only for approved dependency removal
- dataset/asset imports only after proof of non-use
- performance evidence/report/state

**Intended behavior**

- Remove permanent `will-change`, expensive recurring effects, unused imports, and unjustified glass/blur work.
- Profile before adding memoization.
- Audit unused packages, duplicate datasets, chunks, and images.
- Preserve route lazy loading and player click-to-load.

**Required tests/evidence**

- Before/after React Profiler for listed interactions.
- Bundle/chunk comparison.
- Lighthouse/Web Vitals mobile and desktop.
- Full functional regression suite.

**Acceptance criteria**

- Evidence-backed improvement; no unsupported performance claim.
- No functionality/data/content removed without proof and approval.

## Phase 10A — Accessibility and PWA reliability

**Affected files**

- all interaction primitives and remaining route components
- `vite.config.js`
- service-worker registration/update UI
- offline route
- tests/report/state

**Intended behavior**

- Complete keyboard, names, focus, contrast, selected-state, live-region, zoom, and reduced-motion coverage.
- Explicit navigation/runtime caching and update prompt.
- Preserve IndexedDB across updates; never silently replace an active session.

**Required tests**

- Keyboard-only critical flows and automated accessibility checks.
- Offline app shell/data, failed API, stale cache recovery, update available/apply later.
- Active Watch session during update.

**Acceptance criteria**

- Offline route is genuinely reachable and recovery is predictable.
- No critical accessibility failure.

## Phase 10B — Final regression and release gate

**Affected files**

- test/evidence files
- `docs/refactor-final-report.md`
- `docs/refactor-state.md`
- fixes only for failures introduced or exposed by this gate

**Intended behavior**

- Run complete functional, data-upgrade, backup, responsive, accessibility, security, PWA, and performance suites.
- Produce final before/after evidence and remaining-debt report.

**Required acceptance**

- Build and all tests pass.
- Lint has zero errors and no unexplained warning regression.
- No blocker/high-priority data, progress, security, runtime, or critical responsive defect remains.
- No API secret in frontend bundles.
- Backup and every supported database upgrade preserve records.
- No critical route/overlay overflow at the nine required viewports.
- Report measured LCP/INP/CLS; explain misses rather than hiding them.

## Removed or reconciled roadmap contradictions

- The old roadmap’s Phase 2 is split into data-safety closure, bootstrap/commands, and scoped subscriptions so unsafe seed/progress behavior is fixed before architecture movement.
- Test infrastructure moves before broad UI refactoring because existing Playwright checks are not lockfile-reproducible.
- Dashboard/course numbering shifts but their intended scope is preserved.
- Watch and Practice remain deliberately sliced due to data and interaction risk.
- Practice schema migration is not pre-approved; it has an explicit approval gate.
- Phase 8 performance work no longer duplicates player/Pomodoro tick corrections; it handles only remaining measured hotspots.
- Accessibility requirements are implemented with each interaction phase and receive a final cross-app gate, avoiding duplicate “inspect now, inspect again later” work.
- Phase 10 is split into reliability remediation and final validation so the release gate does not conceal feature implementation.
- Prior documentation remains historical evidence. This file supersedes its phase ordering, completion claims, affected-file lists, tests, and acceptance criteria.
