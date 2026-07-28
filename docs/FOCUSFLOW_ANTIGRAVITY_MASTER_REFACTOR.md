# FocusFlow — Complete Antigravity Production Refactor Specification

**Repository:** `ssiddiquiii/FocusFlow`  
**Audit basis:** Current `main` branch and live application, reviewed July 2026  
**Primary purpose:** Give a coding agent one authoritative, self-contained document for improving the entire application safely and incrementally.

---

# 0. How Sameed Must Use This File

This document is a **reference specification**, not a request to execute the entire refactor at once.

Place it in the repository:

```text
FocusFlow/
└── docs/
    └── FOCUSFLOW_ANTIGRAVITY_MASTER_REFACTOR.md
```

Then give Antigravity only this first instruction:

```text
Read docs/FOCUSFLOW_ANTIGRAVITY_MASTER_REFACTOR.md completely.

Acknowledge the Master Contract.
Create the requested safety branch and stable tag.
Then execute Phase 0 only.

Phase 0 is inspection and documentation only.
Do not modify application source code.
Do not start Phase 1.
```

After Phase 0, execute **one phase or one subphase per session**.

```text
One phase
   ↓
Inspection plan
   ↓
Implementation approval
   ↓
Small controlled change
   ↓
Build + lint + tests
   ↓
Diff review
   ↓
Commit
   ↓
Update refactor state
   ↓
Fresh session
```

Do not ask the agent to “make the whole app production grade” in one execution.

---

# 1. Master Contract

## 1.1 Mission

Improve FocusFlow as a production-grade, local-first learning application.

This is not a visual redesign exercise. Preserve:

- The current FocusFlow identity
- Existing course and lesson IDs
- Existing local IndexedDB data
- Notes and timestamp navigation
- Watch progress and resume behavior
- Practice completion history
- Imported playlists
- Backup compatibility
- Keyboard-oriented learning workflow
- Distraction-free positioning

The product should feel:

- Immediate
- Stable
- Smooth
- Predictable
- Responsive
- Accessible
- Maintainable
- Safe on lower-end Android devices

## 1.2 Product principle

```text
Course content
      ↓
Correct next lesson or activity
      ↓
Watch / read / practice / notes
      ↓
Reliable persistence
      ↓
Clear learning evidence
      ↓
Next executable action
```

FocusFlow must not become merely another playlist viewer or generic checklist.

Its differentiation is:

> FocusFlow helps the learner resume the correct next action and preserves evidence that learning happened.

## 1.3 Execution rules

1. Work on one phase or approved subphase at a time.
2. Inspect before changing code.
3. State verified problems before proposing a patch.
4. List every file expected to change.
5. State regression and data-loss risks.
6. Do not start another phase automatically.
7. Do not perform unrelated cleanup.
8. Do not add features outside the current phase.
9. Do not rewrite the application from scratch.
10. Do not introduce a dependency without technical justification.
11. Do not change the IndexedDB schema without a versioned migration.
12. Do not conceal responsive bugs using global `overflow-x-hidden`.
13. Do not claim performance gains without measurements.
14. Do not change question content correctness without explicit review.
15. Preserve existing behavior unless the phase explicitly corrects it.

## 1.4 Data safety rules

The agent must preserve:

- Courses
- Lessons
- Video progress
- Notes
- Practice progress
- Imported playlists
- Backup files from previous versions

Any database change requires:

```text
New schema version
      +
Upgrade migration
      +
Legacy record mapping
      +
Backup backward compatibility
      +
Upgrade test
      +
Rollback consideration
```

A malformed backup must never erase valid current data.

## 1.5 Dependency policy

A dependency may only be added when:

- The existing stack cannot reasonably solve the problem.
- The dependency has a clear production purpose.
- Bundle impact is documented.
- Maintenance impact is documented.
- Alternatives were considered.
- The dependency is introduced in a dedicated commit.

Do not add a library merely to reduce a few lines of code.

## 1.6 Component-size policy

Component size is a diagnostic, not an absolute law.

Recommended target:

- Most UI components: below approximately 250 lines
- Complex orchestration components: below approximately 350 lines
- Files above 350 lines require explicit justification or decomposition

Do not split cohesive code into artificial micro-components merely to satisfy a number.

A component should be extracted when it has one or more of these signals:

- Independent state lifecycle
- Independent rendering frequency
- Independent responsive behavior
- Reusable domain logic
- Separate accessibility responsibilities
- Separate testing boundary
- More than one major reason to change

## 1.7 Required response before implementation

Before modifying files, the agent must return:

1. Current implementation summary
2. Verified defects
3. Files involved
4. Proposed steps
5. Data and regression risks
6. Required tests
7. Explicit out-of-scope items

The agent must then stop for approval.

## 1.8 Required response after implementation

After implementation, return:

1. Problems fixed
2. Files changed
3. Files created or deleted
4. Important design decisions
5. Commands executed
6. Build result
7. Lint result
8. Test result
9. Viewports checked
10. Performance evidence where relevant
11. Remaining known issues
12. Exact next approved phase

---

# 2. Safety Branch, Tags and Commit Discipline

Before changing application code:

```bash
git status
git checkout -b refactor/focusflow-production-hardening
git tag pre-refactor-stable
```

If either command would overwrite existing work, stop and report.

Use one commit per approved phase or subphase.

Suggested commit sequence:

```text
docs: establish FocusFlow refactor baseline
fix: repair backup and data contract defects
refactor: establish domain data access boundaries
refactor: establish responsive application shell
refactor: improve dashboard and course catalog
refactor: decompose watch workspace
fix: improve responsive player controls
perf: isolate player timing and persistence
refactor: redesign practice domain architecture
fix: improve responsive practice experience
refactor: improve dialogs settings and utilities
perf: reduce rendering storage and compositing cost
feat: improve accessibility and PWA reliability
test: add regression and release validation
```

Never combine unrelated work in one commit.

---

# 3. Current Repository Audit Snapshot

This section records known findings from the current repository. The agent must verify each finding against the branch before changing it.

## 3.1 Current stack

- React 19
- React Router 7
- Vite
- Tailwind CSS 4
- Dexie and IndexedDB
- `dexie-react-hooks`
- Zustand
- Zod
- Framer Motion
- `vite-plugin-pwa`
- Vercel serverless API
- Local-first data storage

## 3.2 Current component hotspots

Known large files include approximately:

| File | Current concern |
|---|---|
| `src/pages/Watch.jsx` | Very large page with player, controls, notes, tabs, syllabus and timers |
| `src/components/PracticeTab.jsx` | Roughly 488 lines; UI, filtering, catalog logic, data identity and flashcards combined |
| `src/pages/Dashboard.jsx` | Roughly 433 lines; data aggregation, syncing, cards, hero, streak and actions combined |
| `src/components/PomodoroTimer.jsx` | Roughly 382 lines; timer engine, persistence, sound, panel and full-screen lock combined |
| `src/App.jsx` | Shell, shortcuts, desktop navigation, mobile navigation and routing combined |

Large files are not automatically wrong, but these files contain multiple state and rendering responsibilities and should be decomposed based on behavior.

## 3.3 Confirmed correctness risks

### Backup import

`Settings.jsx` uses `reader.onerror` and `reader.readAsText(file)` without creating and configuring a `FileReader` instance and `onload` handler.

Expected outcome: current backup import can fail at runtime.

### Practice backup schema

Practice completion passes `q.link || ''`, while `PracticeProgressSchema` requires a valid URL.

Expected outcome: a solved question without a valid link may make backup validation or export fail.

### Dashboard notes statistic

The current stats contract returns `totalNotes`; any consumer reading another property such as `notesCount` will show an incorrect value.

Verify and fix all consumers rather than changing the contract inconsistently.

### Client-side YouTube API boundary

The browser and server-side API behavior must be audited together.

Requirements:

- Secret API keys must stay server-side.
- Product copy must not promise “any public playlist” if the server only allows a restricted list.
- Client and API error contracts must match.

### Watch render frequency

Player timing is currently coupled to a large Watch render tree. Frequent time updates can rerender notes, syllabus and unrelated UI.

### Pomodoro writes

The timer currently checks twice per second and writes remaining time to synchronous `localStorage` on recurring ticks.

### Streak field inconsistency

The reusable streak utility reads `watchTime || currentTime`, while `StreakModal` separately checks `currentTime` before completion.

Progress records are written using `watchTime`.

Expected outcome: the modal and dashboard can calculate activity differently.

There must be one shared streak domain function and one field contract.

### Page transition configuration

Audit Framer Motion `AnimatePresence` mode and exit behavior. Remove invalid configuration or simplify transitions.

## 3.4 Confirmed responsive risks

### Application shell

- Desktop dock activates at the `md` breakpoint.
- Tablets around 768px can receive a desktop-oriented floating dock before sufficient content width exists.
- Mobile and desktop navigation logic is duplicated.
- Fixed header and drawer require stronger focus, scroll-lock and safe-area behavior.

### Watch screen

- Video geometry combines aspect ratio with forced minimum heights.
- Small screens can receive a distorted or oversized player.
- Too many player controls compete in one row.
- Notes/sidebar activates too early on compact desktops.
- Nested scrolling may occur.
- Mobile and desktop note experiences duplicate logic.

### Practice screen

- Topic selector, difficulty filter and view mode compete for width.
- The difficulty control uses a fixed width inside a horizontal row.
- Flashcard footer places “Mark solved”, Previous and Next in one row.
- A clickable `div` is used for the flashcard, while interactive controls are nested inside it.
- Code and solution content can be long.
- Question actions use small targets.
- Search does not deep-link to the selected question.
- The main page uses `overflow-hidden`, which can conceal rather than correct overflow.

### Pomodoro

- Expanded panel uses fixed `w-80`.
- The right offset can overflow a 320px viewport.
- Full-screen rest overlay needs dynamic-height and landscape testing.
- Floating widget can cover page actions.
- Permanent `will-change` is used.

### Settings and dialogs

- Settings uses fixed desktop-like padding.
- Confirmation actions can become cramped.
- Import modal and command palette need dynamic viewport height, keyboard-safe scrolling and reusable dialog behavior.

---

# 4. Production Architecture Target

## 4.1 High-level structure

```text
┌────────────────────────────────────────────┐
│ AppShell                                   │
│ Navigation · Commands · Global Utilities  │
└──────────────────┬─────────────────────────┘
                   │
        ┌──────────▼───────────┐
        │ Application Bootstrap│
        │ DB init + migrations │
        └──────────┬───────────┘
                   │
┌──────────────────▼─────────────────────────┐
│ Domain services / repositories            │
│ Courses · Lessons · Video Progress · Notes │
│ Practice · Streak · Backup · Playlists     │
└───────┬────────────┬─────────────┬─────────┘
        │            │             │
  Narrow live   Mutation      Pure domain
  queries       commands      calculations
        │            │             │
┌───────▼────┐ ┌─────▼──────┐ ┌───▼─────────┐
│Dashboard   │ │Watch       │ │Practice      │
│aggregates  │ │workspace   │ │workspace     │
└────────────┘ └────────────┘ └──────────────┘
```

## 4.2 Recommended source organization

Do not move everything at once. Move files only when their phase is executed.

Target direction:

```text
src/
├── app/
│   ├── AppShell.jsx
│   ├── routes.jsx
│   ├── bootstrap.js
│   └── navigation.js
├── components/
│   ├── dialog/
│   ├── feedback/
│   ├── layout/
│   └── controls/
├── features/
│   ├── catalog/
│   ├── courses/
│   ├── watch/
│   ├── practice/
│   ├── notes/
│   ├── streak/
│   ├── pomodoro/
│   ├── backup/
│   └── playlist-import/
├── db/
│   ├── FocusFlowDB.js
│   ├── migrations/
│   └── repositories/
├── hooks/
├── pages/
├── services/
├── types/
└── utils/
```

Do not perform this folder reorganization as a single “cleanup” commit.

---

# 5. Global Quality Standards

## 5.1 Responsive viewport matrix

Test all affected experiences at:

| Device class | Viewport |
|---|---:|
| Small phone | 320 × 568 |
| Common phone | 360 × 800 |
| Modern phone | 390 × 844 |
| Large phone | 412 × 915 |
| Tablet portrait | 768 × 1024 |
| Tablet landscape | 1024 × 768 |
| Compact laptop | 1280 × 800 |
| Desktop | 1440 × 900 |
| Phone landscape | 844 × 390 |

## 5.2 Required routes and overlays

Test:

- Dashboard
- Course catalog/cards
- Course detail
- Watch
- Notes
- Reading
- Practice list
- Practice flashcards
- Streak calendar
- Pomodoro collapsed
- Pomodoro expanded
- Pomodoro rest lock
- Settings
- Backup import
- Playlist import
- Command palette
- Offline page
- Error boundary

## 5.3 Responsive rules

- Mobile-first CSS
- No accidental page-level horizontal scrolling
- No clipped content
- No hidden controls
- No fixed-width control that exceeds the viewport
- No content under fixed navigation
- Use `min-width: 0` in flex/grid children with long content
- Long titles must wrap, clamp or truncate deliberately
- Use `100dvh` where mobile browser chrome matters
- Account for safe-area insets
- Important actions must not be hover-only
- Touch targets should be approximately 44 × 44 CSS pixels
- Modals must remain usable with the mobile keyboard open
- Code blocks may scroll horizontally inside themselves
- The complete page must not scroll horizontally
- Do not use global overflow clipping as the primary solution

## 5.4 Breakpoint policy

Starting policy:

```text
< 640px       compact phone
640–767px     large phone
768–1023px    tablet
1024–1279px   compact desktop
>= 1280px     full desktop workspace
```

Navigation:

```text
< 1024px      mobile/tablet header and drawer
>= 1024px     desktop navigation dock
```

Watch side panel:

```text
Prefer >= 1280px or a content/container-based condition.
Do not activate merely because Tailwind lg is reached.
```

## 5.5 Performance standards

- LCP target: 2.5 seconds or better
- INP target: 200 milliseconds or better
- CLS target: 0.1 or better
- Measure mobile and desktop separately
- No full-page rerender for video time updates
- No full-app rerender for timer updates
- No recurring sub-second storage writes
- No permanent global `will-change`
- No large scrolling blur surfaces without evidence
- Use memoization only after profiler evidence
- Preserve route-level lazy loading
- Reserve media dimensions to avoid layout shift

## 5.6 Motion standards

Recommended durations:

- Micro-interaction: 120–180ms
- Panel/dialog: 180–240ms
- Route transition: minimal and non-blocking

Prefer:

- `transform`
- `opacity`

Avoid unnecessary animation of:

- `height`
- `width`
- `top`
- `left`

Support `prefers-reduced-motion`.

## 5.7 Accessibility standards

- Semantic buttons and links
- Accessible names for icon-only controls
- Visible focus states
- Logical tab order
- Dialog focus trap
- Escape handling
- Focus restoration
- No state communicated by color alone
- `aria-live` for asynchronous status/error feedback
- Keyboard-accessible select/listbox behavior
- Persistent captions preference
- Reduced-motion support
- Touch discoverability for destructive actions

---

# 6. Phase 0 — Baseline and Evidence

## Objective

Create a baseline before modifying source code.

## Agent execution prompt

```text
Execute Phase 0 only.

Do not modify application source files.
Documentation and measurement artifacts are allowed.
Do not start Phase 1.
```

## Tasks

1. Confirm branch, status, Node version and package manager.
2. Install with the repository lockfile.
3. Run:
   - Build
   - Lint
   - Existing unit tests
   - Existing E2E tests
4. Record pre-existing failures.
5. Capture screenshots for the full viewport matrix.
6. Check page overflow:
   - `document.documentElement.scrollWidth`
   - `document.documentElement.clientWidth`
7. Record mobile and desktop Lighthouse results for:
   - Dashboard
   - Watch
   - Practice
8. Record React Profiler traces:
   - Open dashboard
   - Open a course
   - Start video playback
   - Run playback for ten seconds
   - Add a note
   - Open Practice
   - Change a Practice filter
   - Start Pomodoro
9. Record which components rerender during:
   - Player timing
   - Pomodoro ticks
   - Practice completion
   - Database writes
10. Audit current file lengths and responsibility boundaries.
11. Audit current API key exposure.
12. Audit current PWA navigation fallback.
13. Audit all current loading, empty and error states.

## Required deliverable

Create:

```text
docs/refactor-baseline.md
```

Include:

- Build/lint/test status
- Responsive screenshot matrix
- Overflow defects
- Performance measurements
- Render hotspots
- Current source hotspots
- Current functional bugs
- Security risks
- Data migration risks
- Recommended confirmed phase order

## Acceptance gate

- No application source file changed
- Baseline evidence exists
- Existing failures are separated from new failures
- Agent stops after the report

## Commit

```text
docs: establish FocusFlow refactor baseline
```

---

# 7. Phase 1 — Correctness, Backup and API Security

Execute this phase before visual refactoring.

## 7.1 Repair backup import

In `Settings.jsx` or extracted backup feature:

- Create `FileReader`
- Implement `onload`
- Implement `onerror`
- Parse JSON safely
- Validate with Zod before database mutation
- Distinguish:
  - Invalid JSON
  - Invalid schema
  - Unsupported backup version
  - File read failure
  - Database transaction failure
- Disable duplicate import while running
- Reset file input afterward
- Preserve current data when validation fails

## 7.2 Make backup restoration atomic

Current data must not be cleared until validation succeeds.

Use a transaction and ensure the entire import either succeeds or rolls back.

Consider validating referential integrity:

- Every lesson references an existing course
- Every progress record references a valid lesson/course
- Every note references a valid lesson/course
- Every practice record references a valid practice identity

## 7.3 Practice URL schema

Do not require a URL for every practice question.

Preferred representation:

```js
practiceUrl: z.string().url().nullable().optional()
```

Legacy empty strings must be accepted during migration or normalized to `null`.

## 7.4 Dashboard stat contract

Create one stable stats shape:

```js
{
  totalHours,
  completedLessons,
  totalNotes,
  solvedPracticeQuestions,
  currentStreak
}
```

Only add fields already derivable from current data. Do not invent analytics.

Verify all consumers use the same property names.

## 7.5 Streak correctness

Remove duplicated streak calculation from `StreakModal`.

Create one pure domain function:

```text
deriveStudyActivityDates(progress, practiceProgress)
calculateCurrentStreak(activityDates, now)
buildMonthlyActivityCalendar(activityDates, month)
```

Rules must use the actual persisted field:

```text
watchTime >= 600 seconds
OR lesson completed
OR at least one practice question completed
```

Use local calendar dates consistently. Add timezone boundary tests around midnight.

## 7.6 YouTube API boundary

- Remove any secret API key from the client bundle
- Browser calls a server-side endpoint
- Server validates playlist IDs
- Define allowlist policy explicitly
- Product copy matches behavior
- Normalize errors:
  - Invalid ID
  - Playlist not found/private
  - Quota exceeded
  - Upstream timeout
  - Unsupported playlist
  - Internal failure
- Add timeout and abort handling
- Verify no secret appears in built assets

## Tests

- Backup export/import round-trip
- Invalid JSON leaves current data unchanged
- Invalid practice URL legacy record normalizes safely
- Dashboard note count is correct
- Streak from 10+ minutes watch time is counted
- Practice completion contributes to streak
- API key absent from client bundle

## Acceptance gate

- Build passes
- Lint passes
- Backup tests pass
- Current IndexedDB data remains safe
- API secret remains server-side
- Agent stops

## Commit

```text
fix: repair backup data contracts and API security
```

---

# 8. Phase 2 — Application Bootstrap and Data Access Architecture

## Objective

Remove the broad “God Hook” pattern before deeper UI work.

## 8.1 Initialize database once

Current `useFocusFlow()` can initialize and seed the database for every consumer.

Create one application bootstrap boundary.

```text
main.jsx
   ↓
FocusFlowProvider or bootstrap function
   ↓
Open database
   ↓
Run version migrations
   ↓
Seed defaults once
   ↓
Render routes
```

Seed behavior must not repeatedly overwrite user-modified course records.

Clarify default catalog update policy:

- Insert missing seed courses/lessons
- Do not overwrite imported courses
- Do not overwrite user progress
- Do not silently delete user data
- Legacy cleanup must be versioned and documented

## 8.2 Replace broad subscriptions

Current broad hook subscribes consumers to full arrays of:

- Courses
- Lessons
- Progress
- Notes
- Practice progress

Create narrow hooks or repositories:

```text
useCourses()
useCourse(courseId)
useCourseLessons(courseId)
useCourseProgress(courseId)
useContinueLearning()
useLessonProgress(courseId, lessonId)
useLessonNotes(courseId, lessonId)
useDashboardStats()
usePracticeProgress(practiceIds)
```

Separate commands:

```text
courseRepository.importCourse()
courseRepository.deleteCourse()
progressRepository.saveVideoProgress()
notesRepository.createNote()
practiceRepository.setSolved()
backupService.export()
backupService.import()
```

## 8.3 Query correctness

- Use indexed queries
- Avoid loading all tables when a scoped query works
- Avoid async functions in dependency arrays that are recreated every render
- Avoid N+1 progress queries on Dashboard
- Compute course progress using one query or indexed aggregate approach
- Keep pure calculations outside components

## 8.4 Error model

Create typed/structured domain errors where useful:

```text
DatabaseInitializationError
BackupValidationError
BackupImportError
PlaylistImportError
MigrationError
```

Do not expose raw internal error messages directly to users.

## Acceptance gate

- DB initialization runs once
- No consumer subscribes to unrelated tables
- Existing data survives upgrade
- Dashboard, Watch and Practice still function
- Backup compatibility remains intact
- Profiler shows reduced unrelated rerenders
- Agent stops

## Commit

```text
refactor: establish FocusFlow domain data boundaries
```

---

# 9. Phase 3 — Responsive App Shell and Shared Primitives

## 9.1 Shell components

Extract:

```text
AppShell
MobileHeader
NavigationDock
MobileNavigationDrawer
PageContainer
RouteLoadingFallback
```

Use one navigation item source and one active-route function.

## 9.2 Navigation behavior

- `< 1024px`: compact header and drawer
- `>= 1024px`: desktop dock
- Drawer closes on:
  - Escape
  - Backdrop click
  - Route change
  - Navigation selection
- Lock body scroll while open
- Trap focus inside drawer
- Restore focus to trigger
- Add accessible names
- Add active route semantics
- Do not rely on hover tooltips for understanding icons

## 9.3 Shared primitives

Create reusable primitives only where repetition exists:

- `PageContainer`
- `SectionHeader`
- `IconButton`
- `DialogShell`
- `LoadingState`
- `EmptyState`
- `ErrorState`
- `ResponsiveActionGroup`
- `SegmentedControl`

## 9.4 Route transitions

- Fix unsupported `AnimatePresence` configuration
- Add a meaningful exit transition or remove the abstraction
- Keep transitions non-blocking
- Respect reduced motion

## 9.5 Overflow repair

Find the real component causing overflow.

Do not use:

```css
html,
body {
  overflow-x: hidden;
}
```

as the primary fix.

## Acceptance gate

- Tablet no longer receives cramped desktop navigation
- Drawer is accessible
- All routes have consistent gutters
- Fixed UI respects safe areas
- No page-level horizontal overflow
- Agent stops

## Commit

```text
refactor: establish responsive application shell
```

---

# 10. Phase 4 — Dashboard, Catalog, Course Detail and Streak

Split into 4A and 4B if needed.

## Phase 4A — Dashboard and catalog

### Responsibilities to separate

Suggested structure:

```text
DashboardPage
├── DashboardHeader
├── DashboardActions
├── ContinueLearningCard
├── LearningStats
├── CourseCatalog
│   └── CourseCard
├── QuoteCard
└── DashboardFeedback
```

### Data improvements

- Avoid one query per course for progress
- Precompute progress map from relevant records
- Sort courses with a stable selector
- Keep server/API syncing outside card UI
- Avoid function dependencies that trigger effects every render
- Add explicit:
  - Loading state
  - Empty catalog state
  - Import error state
  - Sync state
  - Delete confirmation

### Responsive behavior

At 320–412px:

- Header and actions stack
- Primary action can become full width
- Export label may shorten if necessary
- Course cards fit without hidden actions
- Long channel/course names wrap safely
- Cards use consistent thumbnail geometry
- Skeleton geometry matches loaded cards

At tablet:

- Do not force a crowded desktop two-column hero
- Use content-driven grid breakpoints

At desktop:

- Avoid excessive empty space
- Keep primary “resume” action visually dominant

### Course deletion

- Confirm before delete
- Explain exactly which local records will be removed
- Do not delete globally shared practice progress incorrectly
- Provide undo only if transaction design supports it reliably

## Phase 4B — Course detail and streak

### Course detail

Fix:

- Initial loading state
- False “Course Not Found” before DB initialization
- Error state
- Empty course/lesson state
- Long titles
- Thumbnail layout
- Resume target correctness
- Lesson metadata on narrow screens
- Touch-safe completion/action controls

Recommended structure:

```text
CourseDetailPage
├── CourseHero
├── CourseProgressSummary
├── ResumeCourseAction
└── LessonList
    └── LessonRow
```

### Streak modal

Do not calculate streak inside the modal.

The modal should receive a derived model:

```js
{
  currentStreak,
  activeDates,
  selectedMonth,
  calendarDays
}
```

Responsive and accessibility requirements:

- Shared `DialogShell`
- Escape and backdrop close
- Focus trap
- Close button accessible label
- Month navigation 44px targets
- Calendar grid readable at 320px
- Correct local date handling
- Current day and active day not distinguished by color alone
- No continuous pulse animation under reduced motion
- Do not allow navigation to impossible or unbounded dates without a reason

## Tests

- Dashboard loads after DB initialization
- Course progress is correct
- Course detail does not flash not-found
- Continue learning targets correct lesson
- Streak agrees between dashboard badge and modal
- Midnight/timezone cases
- Responsive screenshots

## Commits

```text
refactor: improve dashboard and course catalog
refactor: improve course detail and streak calendar
```

---

# 11. Phase 5 — Watch Workspace

This is the highest-risk phase. Execute as four independent subphases.

---

## Phase 5A — Component decomposition only

Do not change player behavior or database semantics in this subphase.

Target:

```text
WatchPage
├── LessonHeader
├── VideoPlayer
├── VideoControls
├── PlayerSettingsMenu
├── LessonWorkspace
│   ├── NotesPanel
│   ├── ReadingPanel
│   └── PracticePanel
├── CourseSyllabus
└── ChapterNavigator
```

Player integration should be behind a controller:

```text
useYouTubePlayerController
or
playerAdapter
```

Responsibilities:

- Initialize player
- Play/pause
- Seek
- Volume
- Captions
- Quality
- Fullscreen
- Current time subscription
- Player-ready state
- Error state

Do not allow Notes/Syllabus to directly depend on raw player internals.

### Acceptance

- Existing behavior preserved
- No data contract change
- Components have clear responsibilities
- Build/lint pass

### Commit

```text
refactor: decompose watch workspace
```

---

## Phase 5B — Responsive player and workspace

### Video geometry

- True 16:9 ratio
- Remove conflicting forced minimum heights
- Same geometry for thumbnail, loading state and iframe
- No layout shift
- Width never exceeds container
- Desktop maximum height may account for `100dvh`

### Controls under 640px

Show primary controls:

- Play/pause
- Seek
- Compact time
- Fullscreen
- Settings

Move secondary options into Settings:

- Playback speed
- Quality
- Captions, where appropriate

Volume may be a mute button rather than a wide slider.

### Controls above 640px

Progressively expose controls based on available width.

Requirements:

- No overlap
- No unpredictable wrapping
- Touch-safe targets
- Landscape support
- No hover-only control access
- Keyboard support

### Workspace layout

```text
Phone:
Video
Tabs
Selected workspace content
Syllabus below or in accessible drawer

Tablet:
Video
Workspace below
No crushed side panel

1024–1279px:
Controlled wide single-column or two-row layout

>= 1280px:
Player plus notes/syllabus side panel where sufficient
```

### Scrolling

- Mobile/tablet: one document scroll
- Desktop workspace: deliberate pane scrolling only
- Avoid nested full-page scroll containers
- Sticky elements must not trap focus/content

### Commit

```text
fix: improve responsive watch workspace
```

---

## Phase 5C — Player timing and persistence

### Render isolation

Current-time updates must only rerender player controls.

Notes, reading, practice and syllabus must not rerender during normal playback.

Options:

- Isolated local state
- `useSyncExternalStore`
- Dedicated small Zustand slice with selectors
- Ref-driven visual progress where appropriate

Do not introduce complexity without profiler evidence.

### Timing rules

- Duration read when player is ready/media changes
- Current time update approximately every 250ms only where UI requires it
- Pause updates while player is paused and controls do not need animation
- Persist progress every 10–15 seconds
- Persist on:
  - Pause
  - Lesson change
  - `visibilitychange`
  - Route exit/unmount
  - Completion
- Do not write IndexedDB on every display tick

### Completion semantics

Define and test:

- Manual completion
- Automatic completion threshold, if any
- Resume timestamp
- Completed lesson reopened
- End-of-video behavior

### Captions

- Persist user preference
- Do not force captions off on every play event
- Keep controls aligned with actual player state

### Profiler gate

Provide evidence that:

- Notes do not rerender on time ticks
- Syllabus does not rerender on time ticks
- Watch page commit duration improves
- Persistence calls are controlled

### Commit

```text
perf: isolate player state and progress persistence
```

---

## Phase 5D — Notes, reading, chapters and Pomodoro integration

### Notes

One shared NotesPanel with responsive containers.

Requirements:

- Create
- Edit
- Delete with confirmation
- Timestamp seeking
- Empty/loading/error state
- Touch discoverability
- Keyboard access
- Stable sort order
- Debounced or explicit save, not uncontrolled DB writes
- Preserve note IDs and timestamps

### Reading

Audit `ReadingTab` for:

- Content identity
- Progress persistence
- Long text/code responsiveness
- Heading hierarchy
- External links
- Loading and empty states
- Whether reading progress belongs to current backup schema

Do not claim reading progress is persistent unless it actually is.

### Chapters

- Stable chapter list
- Active chapter highlight
- Timestamp seeking
- Long chapter titles
- Accessible button semantics
- Efficient current-chapter calculation

### Pomodoro integration

Pomodoro must call the actual player controller to pause.

Changing a generic `isPlaying` UI boolean is not sufficient.

Use a deliberate command interface:

```text
playerCommandBus.pause()
or
activePlayerController.pause()
```

### Commit

```text
refactor: unify watch notes reading and player integrations
```

---

# 12. Phase 6 — Deep Practice System Refactor

Practice is a core learning domain, not merely a UI tab.

Execute as four subphases.

---

## 12.1 Current Practice architecture findings

Current flow:

```text
jsTopicPractice.json
      ↓
PracticeTab
      ↓
LESSON_TOPIC_MAP
      ↓
togglePractice(courseId, lessonId, questionId, link, completed)
      ↓
practiceProgress id = lessonId_questionId
```

Known structural issue:

The global Practice Hub currently supplies a hard-coded global course context and a specific JavaScript lesson ID while allowing the user to switch among all JavaScript and Git modules.

Course-level Practice can supply the real lesson ID.

Result:

```text
Same logical question
      ↓
Different lesson context
      ↓
Different progress ID
      ↓
Solved status may not synchronize
between global Practice Hub and lesson Practice
```

This is a data identity problem.

Practice question identity must be independent from the page where the question was opened.

---

## Phase 6A — Practice domain and data migration

### Stable identity model

Define stable IDs:

```text
catalogId
topicId
questionId
practiceId = catalogId:topicId:questionId
```

Recommended progress record:

```js
{
  id: practiceId,
  catalogId: 'javascript' | 'git',
  topicId: 'cat-...',
  questionId: 'q...',
  completed: true,
  completedAt: timestamp,
  updatedAt: timestamp,
  sourceCourseId: optional,
  sourceLessonId: optional,
  referenceUrl: nullable
}
```

The stable `id` represents mastery of the question.

`sourceCourseId` and `sourceLessonId` are optional context, not identity.

### Migration

Add a new Dexie version.

Migration must:

1. Read all legacy `practiceProgress` records.
2. Determine question identity using:
   - Existing question ID
   - Legacy lesson-to-topic mapping
   - Catalog data
3. Convert unambiguous records.
4. Preserve ambiguous records in a documented fallback form.
5. Deduplicate multiple records for the same logical question.
6. Keep the most reliable completion timestamp.
7. Normalize empty URL to `null`.
8. Preserve backup compatibility.

Never discard a solved record silently.

### Practice schema

Create a Zod schema for:

- Practice catalog
- Topic
- Question
- Solution structure
- Progress

Validate static JSON during build/test.

### Dataset duplication

Audit both:

- `jsTopicPractice.json`
- `jsPracticeMap.json`

Determine:

- Which file is used
- Whether both contain overlapping content
- Whether one is legacy
- Whether lesson mapping belongs in data rather than JSX

Do not delete either until imports and content differences are verified.

### Acceptance

- Global and lesson Practice show the same solved status
- Legacy completion records survive
- Backup round-trip preserves migrated records
- Question IDs are globally stable
- Agent stops

### Commit

```text
refactor: establish stable practice domain identity
```

---

## Phase 6B — Practice component architecture

Current `PracticeTab.jsx` mixes:

- Lesson mapping
- Catalog partitioning
- Select implementation
- Filtering
- View switching
- Completion calculation
- List cards
- Flashcards
- Solution rendering
- Navigation

Target:

```text
PracticeWorkspace
├── PracticeCatalogTabs
├── PracticeToolbar
│   ├── TopicSelect
│   ├── DifficultyFilter
│   ├── SearchInput
│   └── ViewModeControl
├── PracticeSummary
├── PracticeQuestionList
│   └── PracticeQuestionCard
├── PracticeFlashcardDeck
│   └── PracticeFlashcard
└── PracticeEmptyState
```

Domain hooks:

```text
usePracticeCatalogs()
usePracticeFilters()
usePracticeProgress(practiceIds)
usePracticeDeepLink()
```

Derived completion map:

```js
const solvedSet = new Set(progress.map(record => record.id))
```

Avoid running `.some()` repeatedly for every question and every render.

### State synchronization

Reset or clamp flashcard state when:

- Catalog changes
- Topic changes
- Difficulty changes
- Search changes
- Filtered question count changes
- Deep-linked question changes

Do not leave `flashcardIndex` outside the current array.

When props change because the user changes lesson without a full unmount, synchronize selected topic correctly.

### Commit

```text
refactor: modularize practice workspace
```

---

## Phase 6C — Practice UX and responsiveness

### Toolbar behavior

Under 640px:

```text
Catalog tabs
Topic selector
Search
Difficulty filter + view toggle
```

Use stacked rows.

Do not place a fixed-width difficulty select beside a wide segmented control at 320px.

At larger widths, progressively combine controls.

### Catalog tabs

- Clear selected state
- Keyboard navigation
- Do not truncate critical labels beyond understanding
- Question count should derive from data rather than hard-coded copy

### Select/listbox

Current custom select must support:

- `aria-expanded`
- `aria-controls`
- `aria-activedescendant` or proper listbox pattern
- Arrow Up/Down
- Home/End
- Enter/Space
- Escape
- Focus return
- Outside click
- Mobile touch
- Visible focus

Using Base UI or existing accessible primitives is allowed if already installed and justified.

### Question cards

- Completion control: minimum 44px hit area
- Accessible label
- Title and badge wrap safely
- Actions can stack
- No important hover-only behavior
- Solution expansion preserves focus
- External links clearly identified
- Long code scrolls inside code area
- No full-page horizontal scrolling
- `overflow-hidden` must not conceal content

### Flashcards

Do not use a clickable `div` as the entire card.

Use:

- A semantic button for flip action, or
- A structured card with a dedicated flip button

Avoid nested interactive controls inside a clickable parent.

Requirements:

- Keyboard flip
- Screen-reader state: front/back
- Reduced-motion fallback
- No required 3D transform
- Mark solved, Previous and Next stack on narrow phones
- Progress indicator remains correct
- Swipe gestures are optional, not required
- A user must not accidentally flip while selecting/copying code

### Empty/filter state

Show:

- No questions for filter
- Clear filter action
- Search result count
- Current topic context

### Landscape

At `844 × 390`:

- Header compact
- Filters remain usable
- Flashcard content scrolls internally if necessary
- Navigation remains visible
- No fixed minimum height that exceeds viewport

### Commit

```text
fix: improve responsive and accessible practice experience
```

---

## Phase 6D — Practice content, solutions and deep linking

### Question content model

Current solution strings contain prose, inline code and fenced code in one string.

Preferred structured model:

```js
{
  id,
  title,
  difficulty,
  prompt,
  answer: {
    explanation,
    code,
    language,
    keyPoints
  },
  references: [
    { label, url, sourceType }
  ],
  tags
}
```

Do not rewrite all content automatically in one pass.

Create migration/normalization adapters so old data remains usable.

### Rendering

- Render prose as prose
- Render code as code
- Preserve whitespace
- Add copy-code action
- Announce copy success
- Avoid unsafe raw HTML
- Do not add a full Markdown renderer unless justified
- If a renderer is used, sanitize output

### Content quality audit

Audit question content separately from UI code.

Check:

- Technical correctness
- Ambiguous wording
- Duplicate questions
- Incorrect difficulty
- Broken links
- Low-authority references
- Missing expected outputs
- Code language labels
- JavaScript runtime/version assumptions
- Git command safety

Do not silently change educational answers. Produce a review report and request approval for material content changes.

### Search and deep linking

Command Palette result must navigate to the exact question:

```text
/practice?catalog=javascript&topic=cat-...&question=q...
```

Practice route must:

1. Parse query
2. Select catalog
3. Select topic
4. Apply compatible filters
5. Render target question
6. Scroll into view
7. Focus or highlight it
8. Preserve browser Back behavior

Also support shareable deep links within the local application.

### Practice analytics

Allowed derived indicators:

- Solved count
- Topic completion
- Difficulty completion
- Current streak contribution

Do not introduce gamification noise or misleading mastery scores.

### Tests

- Same question syncs globally and in lesson
- Legacy migration
- Topic/catalog/filter state
- Flashcard index clamping
- Keyboard select
- Keyboard flashcard
- Code overflow
- Deep link
- Back navigation
- Backup round-trip
- 320px and landscape screenshots

### Commit

```text
feat: add reliable practice deep linking and solution rendering
```

---

# 13. Phase 7 — Pomodoro, Settings, Dialogs and Commands

Split into 7A and 7B.

---

## Phase 7A — Pomodoro engine and responsive panel

### Architecture

Target:

```text
PomodoroWidget
├── usePomodoroEngine
├── PomodoroCollapsedButton
├── PomodoroPanel
├── PomodoroSettings
└── RestOverlay
```

Timer engine responsibilities:

- End timestamp
- Current mode
- Remaining time
- Start/pause/reset
- Session transition
- Persistence
- Player pause command
- Sound notification

UI must not own timer domain logic.

### Timing

- UI tick once per second
- Derive remaining time from end timestamp
- Persist on:
  - Start
  - Pause
  - Reset
  - Mode change
  - Custom duration save
  - Visibility change
  - Page exit
- Do not persist every 500ms

### Sound

- Reuse or close AudioContext safely
- Do not swallow errors silently
- Respect sound preference
- Consider browser autoplay restrictions

### Responsive panel

Replace fixed `w-80` with:

```text
width: min(calc(100vw - 1rem), reasonable max width)
```

- Safe-area offsets
- Does not cover primary bottom actions
- Compact landscape behavior
- Internal scrolling if needed
- Touch-safe controls
- No continuous pulse/scale animation under reduced motion
- Remove permanent `will-change`

### Rest overlay

- Use `100dvh`
- Landscape-safe
- Keyboard and screen-reader accessible
- Emergency skip clearly available
- Do not create a hostile unescapable lock
- Actual video player pauses

### Commit

```text
refactor: improve Pomodoro engine and responsive controls
```

---

## Phase 7B — Settings, dialogs and command palette

### Shared DialogShell

Use for:

- Import playlist
- Command palette
- Streak
- Confirmations
- Future dialogs

Requirements:

- Portal
- Accessible title
- Optional description
- Focus trap
- Initial focus
- Escape
- Backdrop close where safe
- Focus restoration
- Body scroll lock
- `max-height: calc(100dvh - 2rem)`
- Internal scroll
- Mobile keyboard support
- Safe-area spacing

### Settings

- Responsive padding:
  - Phone `p-4`
  - Tablet `p-6`
  - Desktop `p-8`
- Status messages use live regions
- Backup actions expose running state
- Reset confirmation actions stack on narrow phones
- Distinguish clear progress from full factory reset
- Ensure labels match actual data removed
- Add backup version information
- Consider pre-import preview:
  - Courses
  - Lessons
  - Notes
  - Progress records
  - Practice records

### Import playlist

- Accessible input label
- Clear API error state
- Dynamic viewport modal
- Prevent duplicate submission
- Abort request on close where safe
- Do not use an arbitrary timeout to close before user can read success
- Allow explicit close after success
- Product copy matches API policy

### Command palette

- Use one global Ctrl/Cmd+K handler; avoid duplicate competing handlers
- Focus trap
- Active descendant or roving focus
- Arrow key navigation
- Enter selection
- Search exact practice questions
- Deep-link selected question
- One-column shortcut grid on narrow phones
- Results loading/empty state
- Do not rebuild the flattened search index on every render unnecessarily

### Commit

```text
refactor: unify settings dialogs and command experience
```

---

# 14. Phase 8 — CSS, Rendering and Perceived Smoothness

## 14.1 CSS audit

Audit `index.css` and component classes.

Remove or reduce:

- Permanent `will-change`
- Large scrolling `backdrop-filter`
- Excessive heavy shadows
- Repeated glass surfaces
- Multiple competing animation utilities

Use opaque or nearly opaque surfaces for high-frequency scrolling regions.

Keep blur for small deliberate surfaces where it provides value.

## 14.2 Render profiling

Profile:

- Dashboard initial load
- Course progress update
- Watch playback
- Notes typing
- Practice filtering
- Practice completion
- Pomodoro ticking
- Command palette search

For every repeated render, document:

- Trigger
- Component
- Cost
- Whether it is necessary
- Fix, if needed

Do not add `React.memo` everywhere.

## 14.3 Bundle

- Inspect route chunks
- Inspect duplicate packages
- Remove unused imports
- Verify old practice datasets/components before deleting
- Lazy-load heavy secondary dialogs where beneficial
- Preserve click-to-load YouTube player
- Verify thumbnail sizes and dimensions

## 14.4 Loading behavior

Every asynchronous experience needs:

```text
idle
loading
success
empty
error
recovery/retry
```

Avoid spinner-only pages when skeleton geometry is known.

## Acceptance

- Before/after Lighthouse
- Before/after React Profiler evidence
- No recurring sub-second storage writes
- No full-tree player rerenders
- No layout shifts from media loading
- Reduced motion works
- Agent stops

## Commit

```text
perf: improve rendering storage and visual compositing
```

---

# 15. Phase 9 — Accessibility and PWA Reliability

## 15.1 Accessibility audit

Test keyboard-only:

- Navigation
- Drawer
- Dashboard actions
- Course cards
- Player controls
- Notes
- Practice list
- Practice flashcards
- Custom selectors
- Pomodoro
- Settings
- All dialogs

Check:

- Accessible names
- Focus visibility
- Focus order
- Dialog containment
- Escape behavior
- Focus restoration
- Color contrast
- Disabled states
- Selected states
- Live feedback
- 200% zoom
- Reduced motion

## 15.2 PWA

Define explicit behavior for:

- App shell
- Navigation fallback
- Offline page
- Static assets
- Thumbnails
- API responses
- Failed responses
- Cache expiration
- Cache version updates
- New deployment notification

Requirements:

- Offline page actually reachable offline
- Existing IndexedDB data remains intact across PWA update
- Do not silently replace active session
- Show update available action
- Verify stale cache recovery
- Do not cache sensitive or failed API responses indefinitely

## Commit

```text
feat: improve accessibility and offline reliability
```

---

# 16. Phase 10 — Testing and Release Gate

## 16.1 Automated functional tests

At minimum:

1. Application bootstraps and seeds once
2. Dashboard loads courses
3. Course opens
4. Lesson opens
5. Video progress persists
6. Continue learning target is correct
7. Note create/edit/delete/timestamp
8. Practice solved state persists
9. Practice state syncs between global and lesson context
10. Practice deep link opens exact question
11. Backup round-trip
12. Invalid backup preserves current data
13. Playlist import success/error
14. Drawer focus behavior
15. Command palette keyboard navigation
16. Pomodoro start/pause/restore
17. Streak consistency
18. Offline shell

## 16.2 Responsive visual regression

Capture key routes at every required viewport.

Test:

- Portrait
- Landscape
- Touch emulation
- Keyboard
- 200% zoom
- Slow network
- Offline
- Long imported titles
- Very long practice code
- Empty state
- Error state
- Loading state
- Reduced motion
- Mobile keyboard

## 16.3 Data upgrade testing

Test browser database states from:

- Version 1
- Version 2
- Version 3/current legacy
- New practice schema version
- Existing backup version
- New backup version

Verify no record is silently lost.

## 16.4 Security gate

- No API secret in browser bundle
- External links use safe `rel`
- No unsafe HTML rendering
- Backup payload validation
- Playlist input validation
- No sensitive logging

## 16.5 Final performance gate

Record mobile and desktop separately.

Targets:

- LCP ≤ 2.5s
- INP ≤ 200ms
- CLS ≤ 0.1

Where a target is missed, report evidence and root cause. Do not fake or hide measurements.

## 16.6 Final report

Create:

```text
docs/refactor-final-report.md
```

Include:

- Architecture changes
- Data migrations
- Responsive improvements
- Practice system changes
- Watch changes
- Accessibility changes
- PWA changes
- Performance before/after
- Tests
- Remaining technical debt
- Future recommendations

## Final release gate

Release only when:

- Build passes
- Lint passes
- Tests pass
- No P0/P1 defect remains
- No accidental horizontal overflow
- Existing data survives migration
- Backup works
- No secret in client bundle
- Mobile and desktop evidence recorded
- Remaining lower-priority issues documented

## Commit

```text
test: complete FocusFlow production release validation
```

---

# 17. Agent Session and Context-Window Management

Use a fresh Antigravity session for each phase or complex subphase.

Provide only:

1. This master document
2. `docs/refactor-state.md`
3. Current phase instruction
4. Relevant baseline evidence

Do not paste the entire previous conversation.

## 17.1 Required state file

The agent must create and update:

```text
docs/refactor-state.md
```

Template:

```md
# FocusFlow Refactor State

## Current branch
refactor/focusflow-production-hardening

## Last completed phase
Phase X

## Completed work
- ...

## Files changed
- ...

## Architecture decisions
- ...

## Data migration status
- ...

## Tests passed
- ...

## Viewports verified
- ...

## Known remaining issues
- ...

## Exact next approved phase
Phase Y

## Do not change
- Existing course IDs
- Existing lesson IDs
- Backup compatibility
- User progress without migration
- Product branding without approval
```

## 17.2 Inspection prompt used before every phase

```text
Read:
- docs/FOCUSFLOW_ANTIGRAVITY_MASTER_REFACTOR.md
- docs/refactor-state.md
- docs/refactor-baseline.md

Inspect only the currently requested phase.

Do not modify files yet.

Return:
1. Verified problems
2. Relevant files
3. Proposed implementation steps
4. Database/data compatibility risks
5. Responsive risks
6. Accessibility risks
7. Required tests
8. Explicit out-of-scope work

Stop and wait for implementation approval.
```

## 17.3 Implementation prompt

```text
Implement only the approved plan for the current phase or subphase.

Do not modify unrelated files.
Do not begin the next phase.
Do not add dependencies without justification.
Preserve existing IndexedDB data and backup compatibility.
Run build, lint and relevant tests.
Report every changed file and stop.
```

## 17.4 Senior self-review prompt

```text
Review the current phase changes as a senior frontend, local-first data and performance engineer.

Check:
- Functional regression
- Data loss or migration failure
- Backup compatibility
- Responsive regression at all required viewports
- Accessibility regression
- Unnecessary rerenders
- Unrelated file changes
- API secret exposure
- Build, lint and test output

Fix only issues introduced by this phase.
Do not start another phase.
Update docs/refactor-state.md and stop.
```

---

# 18. Stop and Revert Conditions

Immediately stop the agent if it:

- Modifies many unrelated files
- Starts a full rewrite
- Changes the database without migration
- Deletes practice records it cannot map
- Changes question answers without review
- Adds a large dependency without justification
- Uses global overflow clipping to hide layout defects
- Removes functionality to make mobile UI fit
- Duplicates mobile and desktop business logic
- Claims tests passed without output
- Claims performance improved without evidence
- Moves API secrets to client variables
- Starts the next phase without permission
- Replaces existing branding without approval

Use:

```bash
git diff --stat
git diff
git status
```

before every commit.

---

# 19. Exact Recommended Execution Sequence

```text
Phase 0
Baseline only
      ↓
Phase 1
Correctness + backup + API + streak contract
      ↓
Phase 2
DB bootstrap + narrow domain hooks
      ↓
Phase 3
Responsive app shell
      ↓
Phase 4A
Dashboard + catalog
      ↓
Phase 4B
Course detail + streak
      ↓
Phase 5A
Watch decomposition
      ↓
Phase 5B
Watch responsiveness
      ↓
Phase 5C
Player timing/performance
      ↓
Phase 5D
Notes/reading/player integration
      ↓
Phase 6A
Practice identity + Dexie migration
      ↓
Phase 6B
Practice modular architecture
      ↓
Phase 6C
Practice responsiveness + accessibility
      ↓
Phase 6D
Practice content rendering + deep links
      ↓
Phase 7A
Pomodoro
      ↓
Phase 7B
Settings/dialogs/commands
      ↓
Phase 8
Rendering/CSS/performance
      ↓
Phase 9
Accessibility + PWA
      ↓
Phase 10
Regression + release
```

Deploy a preview after each major phase, not after every tiny code extraction.

Recommended preview checkpoints:

- After Phase 1
- After Phase 3
- After Phase 4
- After Phase 5
- After Phase 6
- After Phase 9
- Final release after Phase 10

---

# 20. First Prompt to Use Now

```text
Read docs/FOCUSFLOW_ANTIGRAVITY_MASTER_REFACTOR.md completely.

This document is the authoritative specification.

First:
1. Confirm repository status.
2. Create branch `refactor/focusflow-production-hardening`.
3. Create tag `pre-refactor-stable` if safe.
4. Execute Phase 0 only.
5. Create `docs/refactor-baseline.md`.
6. Create `docs/refactor-state.md`.

Do not modify application source code.
Do not implement any bug fix.
Do not start Phase 1.
Stop after presenting the Phase 0 evidence.
```

---

# 21. Final Engineering Principle

```text
Small verified scope
       +
Stable data identity
       +
Responsive content-driven layout
       +
Isolated reactive state
       +
Accessible interaction
       +
Measured performance
       +
Tests and commits
       =
Production-grade FocusFlow
```

The goal is not to make the repository appear more sophisticated.

The goal is to make FocusFlow:

- Easier to use daily
- Harder to break
- Easier to maintain
- Safer for user data
- Consistent across devices
- Fast on realistic hardware
- Reliable as a long-term personal learning operating system
