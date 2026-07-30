# FocusFlow Phase 6C — Player Timing, Lifecycle Persistence and Captions

## Status

Implemented and verified on `refactor/focusflow-production-hardening`. Phase 6D and later phases were not started.

## Behavior changed

- Player time and duration snapshots now live in a small external store subscribed to by `PlayerControls`. The Watch page, Notes, Syllabus, Chapters, Reading workspace, and unrelated components no longer receive 200ms timing state.
- Progress writes are serialized per active lesson and identical overlapping lifecycle events are deduplicated.
- Playback progress persists every 10 seconds and on pause, document visibility hidden, `pagehide`, lesson change, route exit/component unmount, and video end.
- Resume positions retain `watchTime ?? currentTime ?? 0` and the existing two-second rewind, then clamp to the actual playable duration.
- The 90% automatic completion threshold remains unchanged. Normal saves continue through the sticky `saveProgress` command.
- Caption preference is stored under `focusflow:watch:captions-enabled`, applied to the active player, and retained across lesson changes and reopen. Player ready/play events no longer force captions off.
- YouTube API initialization reuses one script element and retains exactly one constructed player for an active lesson.

## Render-isolation evidence

The focused browser test records component renders immediately before and after player timing ticks:

| Component | Before | After | Delta |
|---|---:|---:|---:|
| `PlayerControls` | 6 | 8 | +2 |
| `NotesPanel` | 16 | 16 | 0 |
| `CourseSyllabus` | 8 | 8 | 0 |
| `ChaptersPanel` | 8 | 8 | 0 |

The machine-readable evidence is stored in `docs/evidence/phase6c/render-isolation.json`.

## Lifecycle persistence results

- Periodic interval: 10,000ms, within the required 10–15 second window.
- Pause at 31 seconds persisted 31.
- Visibility hidden at 38 seconds persisted 38.
- Lesson change at 44 seconds persisted the previous lesson before cleanup.
- Route exit/unmount at 53 seconds persisted 53.
- A 95% pause marked completion; a later overlapping 60-second lifecycle save preserved completion.
- End event persisted the full 100-second duration and completion.
- Identical overlapping events produced one write; distinct writes remained ordered and lesson-scoped.
- Existing explicit manual completion/uncompletion and completed-reopen behavior remained covered by Phase 2A and Phase 6C regressions.

## Caption results

- Default playback did not call a caption unload command during ready or play.
- Enabling captions updated local preference and loaded the captions module on the active player.
- The next lesson and a reopened Watch route loaded the saved preference.
- Playback never silently disabled the enabled preference.

## Preserved contracts

- One live YouTube player instance per lesson and one construction site.
- Sticky completion and 90% threshold.
- Existing progress ID `${courseId}_${lessonId}`, `watchTime`, legacy `currentTime`, unknown legacy fields, and command transaction behavior.
- Note IDs, content, timestamps, CRUD, and timestamp seeks.
- Chapters, syllabus, Reading, Practice, Pomodoro, routes, and Phase 6B responsive layout/breakpoints.
- Dexie schema version 3 and backup version/format.

No schema, migration, backup, Notes, Reading, Chapters, Practice, Pomodoro, responsive, external service, deployment, or production dependency change was made.

## Files changed

- `src/features/watch/useWatchPlayerController.js`
- `src/features/watch/playerTimeStore.js`
- `src/features/watch/playbackPersistence.js`
- `src/features/watch/PlayerControls.jsx`
- `src/features/watch/NotesPanel.jsx`
- `src/features/watch/CourseSyllabus.jsx`
- `src/features/watch/ChaptersPanel.jsx`
- `scripts/verification/phase6a/verify_watch_decomposition.js`
- `scripts/verification/phase6c/verify_watch_persistence_captions.js`
- `scripts/verification/run-suite.js`
- `package.json`
- `docs/evidence/phase6c/render-isolation.json`
- `docs/refactor-state.md`
- `docs/refactor-phase6c-implementation.md`

## Commands and exact results

- `npm run test:phase6c`: Phase 6A 19/19, Phase 6B 50/50, Phase 6C 30/30.
- `npm run test:all`: passed.
  - Vite 8.1.5 build: 2,321 modules transformed, built in 1.40s.
  - Maintained unit/browser assertions: 280 passed, 0 failed.
  - Verification-runner failure propagation passed with expected child exit 7.
- Frontend secret scan: 18 generated JavaScript assets, 0 Google API key patterns.
- `npm run lint`: 28 warnings, 0 errors; three inherited Watch hook dependency warnings were eliminated.
- `git diff --check`: passed with no whitespace errors.

The existing non-blocking Vite chunk-size warning remains. Expected console output from malformed-backup rejection fixtures and synthetic empty image sources remained non-failing.

## Data compatibility impact

None. Dexie remains version 3. The full suite passed backup roundtrip, invalid-backup preservation, IndexedDB preservation, legacy `currentTime`, unknown progress-field, sticky completion, manual completion/uncompletion, seeding, collision, and atomic reset regressions.

## Blockers

None.

## Deferred non-blocking issues

- Existing Vite chunk-size warning remains for the measured performance phase.
- Existing lint warnings remain at 28 with no Phase 6C regression.
- Phase 6D Notes, Reading, Chapters, and Pomodoro integration remains explicitly deferred.
