# FocusFlow Phase 7A — Practice Identity Decision and Safe Migration

## Status and scope

Phase 7A is implemented without a Dexie schema migration. Dexie remains version 3. No Phase 7B, 7C, 7D, later UI architecture, responsive, accessibility, rendering, deep-link, service, deployment, or dependency work was included.

## Current identity characterization

Before Phase 7A, `practiceProgress.id` was written as `${lessonId}_${question.id}`. Consequently the same educational question could have a different mastery identity when opened from a different lesson or from the global Practice route. Reads in `PracticeTab` reconstructed that route-dependent ID. The record also stored `courseId`, `lessonId`, nullable `practiceUrl`, `completed`, and optional `completedAt`.

Practice records are created and updated by `togglePractice`, deleted by the same command when unmarked and by course/activity reset commands, read reactively by `usePracticeProgress` and Dashboard/streak consumers, and exported/imported in `FocusFlowDB`. Backup parsing validates structural and course/lesson relational integrity before its atomic clear-and-restore transaction.

Legacy identity depends on lesson/route context plus a static question ID. It does not encode topic or catalog explicitly. Question array index is not persisted, but the IDs themselves reflect authored catalog numbering. `jsTopicPractice.json` is the 18-topic/140-question Practice catalog. `jsPracticeMap.json` is a separate 60-entry lesson-keyed Reading catalog; none of its keys collide with Practice question IDs.

## Final identity model

New records use this deterministic, route-independent primary-key value in the existing `id` field:

```text
practice-question:v1:<catalogId>:<topicId>:<questionId>
```

The record also exports `identityVersion: 1`, `catalogId`, `topicId`, and `questionId`, making backups understandable without parsing the key. Those fields are ordinary object properties, not Dexie indexes. `courseId` and `lessonId` remain as valid provenance/reference fields and retain the existing backup relational contract; they do not determine mastery.

The validated catalog adapter supplies the same descriptor in global and lesson contexts. A canonical record, when present, is authoritative over mapped legacy duplicates. This preserves solved-state parity and supports an intentional unmark without deleting historical legacy rows.

## Legacy, duplicate, ambiguous, and stale handling

- A legacy ID ending in exactly one longest known question ID is classified `legacy-unambiguous` and contributes to that question's solved state until a canonical record exists. Longest-suffix selection distinguishes IDs such as `git_q1_1` from `q1_1`.
- Multiple legacy rows mapping to one question are deduplicated in the read model; none is deleted.
- On intentional unmark, mapped legacy rows are retained and changed to `completed: false`; a canonical false record remains authoritative.
- If a legacy suffix matches multiple catalog questions, it is classified `legacy-ambiguous`, retains all candidate identities, does not silently contribute to either identity, and is never deleted or rewritten by the adapter.
- Records with no catalog match are classified `stale` and remain recoverable in IndexedDB and backups.
- The legacy command signature remains supported for compatibility. Current application UI writes use canonical descriptors.

The current static catalog has zero duplicate topic IDs, zero duplicate question IDs, zero ambiguous identities, and 140 unique stable identities. Synthetic duplicate/ambiguity fixtures prove detection and preservation behavior.

## Migration decision

No Dexie version change is required. Version 3 already stores `practiceProgress` objects under a string `id` primary key and does not restrict additional object fields. Stable identity can therefore be introduced for new writes through adapters and schema validation without adding an index, changing a primary-key declaration, scanning/rekeying existing records, or running upgrade logic.

An eager database rewrite was rejected because it would add data-loss risk without a query requirement. Lazy interpretation preserves every legacy record, including ambiguous and stale records. `FocusFlowDB.js` is intentionally unchanged.

Rollback is code-only: reverting the Phase 7A application changes leaves canonical records as ordinary valid version-3 rows that still export and import. Older UI code would not recognize those canonical IDs for solved display, but no IndexedDB record is destroyed. Backups remain version 1/2 compatible; new identity metadata is preserved by the passthrough Practice schema, and inconsistent partial/mismatched stable metadata is rejected before mutation.

## Catalog and educational-content evidence

- `jsTopicPractice.json`: 18 topics, 140 questions, 140 unique question IDs and identities; SHA-256 `d1a8cfd991866b119ec2ad5bfa2809af044094284f08061eadb5da8dfa3d69c5`.
- `jsPracticeMap.json`: 60 lesson-keyed Reading entries, zero keys matching Practice question IDs; SHA-256 `3a956f4d7a1908cd2f71695a2136c37c26f70e1e2a5665efee34e4cde33856f1`.
- Both files are byte-for-byte unchanged. No question, answer, solution, explanation, link, course ID, or lesson ID was edited.

## Files changed

- `src/features/practice/practiceIdentity.js` (new)
- `src/features/practice/practiceCatalog.js` (new)
- `src/components/PracticeTab.jsx`
- `src/services/dataCommands.js`
- `src/types/schemas.js`
- `scripts/verification/phase7a/verify_practice_identity.js` (new)
- `scripts/verification/phase7a/verify_practice_identity_browser.js` (new)
- `scripts/verification/run-suite.js`
- `package.json`
- `docs/refactor-state.md`
- `docs/refactor-phase7a-implementation.md` (new)

No files were deleted. `src/db/FocusFlowDB.js` and both educational JSON files were inspected but not modified.

## Verification

- `npm run test:phase7a`: 22 passed, 0 failed (14 pure identity/catalog assertions and 8 browser/IndexedDB/backup assertions).
- `npm run test:all`: passed; 323 maintained assertions, 0 failed (301 prior Phase 1–6 regressions plus 22 Phase 7A assertions).
- Production build: passed with Vite 8.1.5; 2,325 modules transformed in 1.10s in the final complete suite.
- Frontend secret scan: 18 generated JavaScript assets, 0 Google API key patterns.
- Verification runner failure propagation: passed with expected child exit 7.
- `npm run lint`: 0 errors and 28 warnings, unchanged from the Phase 6D baseline.
- `git diff --check`: required in final review.

The build retains the known non-blocking main-chunk warning. Browser fixtures emit expected malformed-backup errors and the existing synthetic empty-image-source warning; their assertions pass.

## Data compatibility impact

Dexie remains version 3 and backup export remains version 2 with import support for versions 1 and 2. Old backups normalize empty/missing Practice URLs to `null`, preserve legacy solved rows, and round-trip. New canonical records and unknown compatible fields round-trip. Invalid backups are rejected before mutation and sentinel data is preserved. Progress, notes, practice rows, record counts, course/lesson IDs, `watchTime`, and legacy `currentTime` regressions pass.

## Blockers and deferred items

Unresolved blockers: none.

Deferred non-blocking items: the existing Vite chunk-size warning and 28 existing lint warnings. Phase 7B owns Practice UI decomposition/state architecture; Phase 7C owns responsive accessibility; Phase 7D owns rendering and deep links. None was started.
