# FocusFlow Engineering Contract

## Objective

Evaluate and refactor the complete FocusFlow repository according to the
existing Phase 0–10 roadmap.

The actual source code is the source of truth. Documentation claims must
be verified against the repository before implementation.

## Mandatory Documents

Before any work, read:

- docs/FOCUSFLOW_ANTIGRAVITY_MASTER_REFACTOR.md
- docs/refactor-state.md
- docs/refactor-baseline.md
- docs/refactor-phase1-implementation.md
- docs/refactor-phase1-verification.md
- docs/refactor-phase2-inspection.md

## Permanent Guarantees

- Preserve all IndexedDB user data.
- Preserve backup import/export compatibility.
- Preserve existing course IDs and lesson IDs.
- Preserve progress, notes and practice history.
- Preserve legacy progress fields such as currentTime.
- Do not change the Dexie schema version unless explicitly approved.
- Do not expose secrets in frontend bundles.
- Do not change external services or deploy.
- Do not use destructive Git commands.
- Do not install production dependencies without approval.
- Do not implement multiple roadmap phases in one pass.
- Do not commit unless explicitly approved.

## Stage 1 — Complete Repository Evaluation

Before modifying application source code:

1. Inspect the complete tracked repository.
2. Verify documentation against actual source code.
3. Run existing build, lint and test commands.
4. Identify correctness, data-loss, architecture, responsive,
   performance, accessibility, security and testing risks.
5. Create:
   - docs/CODEX_FULL_REPOSITORY_AUDIT.md
   - docs/CODEX_FINAL_IMPLEMENTATION_PLAN.md
6. Do not modify application source code during this stage.
7. Stop after completing the two evaluation documents.

## Stage 2 — Implementation

Implementation starts only after the user writes:

PROCEED NEXT PHASE

For each implementation run:

1. Implement exactly one approved phase or implementation slice.
2. Inspect affected files before editing.
3. Preserve all permanent guarantees.
4. Add or update relevant tests.
5. Run quality gates.
6. Review the complete Git diff.
7. Update docs/refactor-state.md and the phase report.
8. Stop before starting another phase.
9. Do not commit until the user writes:

COMMIT APPROVED PHASE

## Required Quality Gates

- git diff --check
- npm run lint
- npm run build
- existing unit tests
- existing Playwright tests
- phase-specific browser tests
- backup roundtrip tests when data logic changes
- IndexedDB preservation tests when database logic changes
- frontend secret scan
- responsive viewport checks during UI phases

Requirements:

- 0 lint errors
- warning count must not exceed the recorded baseline without explanation
- no failing build or tests

## Blocking Issues

Only block completion for:

- user-data loss or overwrite risk
- backup compatibility regression
- invalid IndexedDB behavior
- runtime crash
- build or test failure
- incorrect progress, notes or practice behavior
- security regression
- phase scope leakage
- broken critical responsive behavior

Record minor naming and future optimization issues as non-blocking.

## Required Final Report

After every evaluation or implementation task, report:

- files changed
- behavior changed
- data compatibility impact
- tests executed
- exact test results
- unresolved blockers
- deferred non-blocking issues
- git status
- git diff --stat

Never claim success without repository or command evidence.