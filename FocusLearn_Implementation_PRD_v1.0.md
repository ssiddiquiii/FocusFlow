# FocusLearn Workspace — Implementation PRD v1.0

**Status:** Implementation-ready baseline  
**Date:** 19 July 2026  
**Owner:** Sameed Siddiqui  
**Audience:** Google Antigravity coding agents and human reviewer  
**Mode:** Single-user personal PWA for the first six months  

> The complete authoritative specification is the accompanying DOCX. This Markdown copy is optimized for repository ingestion by coding agents and preserves the core contract, scope, requirements and guardrails.

## Primary implementation contract

Build a distraction-free, progress-aware personal learning PWA containing exactly three configured YouTube playlists and one manually tracked Udemy course. Do not add discovery feeds, full-channel import, recommendations, search, Shorts, comments, OAuth, multi-user backend, AI features, video downloads, media proxying, rehosting, Udemy scraping, native wrappers or browser extensions.

## Selected stack

- React + Vite + TypeScript (strict)
- React Router
- Tailwind CSS
- Dexie + IndexedDB for persistent domain data
- Zustand for ephemeral UI state only
- TanStack Query for YouTube metadata endpoint state
- Zod for external, seed and backup validation
- vite-plugin-pwa / Workbox for app-shell caching only
- Direct YouTube IFrame Player API wrapper
- Minimal Vercel serverless YouTube metadata adapter
- Vitest, React Testing Library, Playwright and axe

## Course inventory

1. YT-JS — Chai aur JavaScript — configured YouTube playlist
2. YT-BE — Chai aur Backend — exact playlist ID required
3. YT-RE — Chai aur React — configured YouTube playlist
4. UD-AI — Hitesh Choudhary Agentic AI — manual curriculum + external Udemy links

## Product principles

1. Intent over discovery.
2. One click to continue.
3. Only one mounted YouTube iframe.
4. Local-first and exportable data.
5. Official playback only.
6. No AI before the workflow is proven.
7. Graceful cached fallback.
8. Public-ready seams without public infrastructure.

## Core routes

```text
/dashboard
/courses/:courseId
/courses/:courseId/lessons/:lessonId
/notes
/settings
/offline
```

## Core business rules

- Continue Learning: latest in-progress lesson → first not-started lesson in most recently opened incomplete course → first course in catalog order.
- Lesson completion: player ended, at least 90% during active playback, or manual completion.
- Resume incomplete YouTube lessons at saved seconds minus two seconds, bounded to valid duration.
- Course progress: completed available lessons divided by total available lessons.
- Unavailable lessons are retained, excluded from denominator and skipped by navigation.
- Metadata refresh must preserve progress and notes.
- Udemy progress is always manual and explicitly labelled.
- Playback position saves every ~10 seconds while playing and immediately on key lifecycle events.

## Architecture invariants

- No media file or stream crosses the serverless function.
- YouTube API key is server-side and playlist IDs are allowlisted.
- All remote data is validated before persistence.
- All multi-record domain writes use Dexie transactions.
- Progress and notes survive sync, reorder, removal and app updates.
- Service worker never caches YouTube media or iframe content.
- Only the player route loads the IFrame API.

## Work packages

- WP-0: repository, PRD, AGENTS.md, ADRs and implementation plan
- WP-1: Vite/React/TypeScript foundation, routes, design tokens and PWA
- WP-2: Dexie schema, repositories, migrations, backup/restore core
- WP-3: serverless YouTube adapter, allowlist, pagination, enrichment and validation
- WP-4: dashboard, course catalog and ordered lesson UI
- WP-5: IFrame adapter, resume, progress state machine and navigation
- WP-6: notes and Udemy manual shell
- WP-7: settings, persistence status, sync, offline and resilience
- WP-8: tests, accessibility, performance, security, deployment and release report

## Release blockers

- Installed PWA works on Windows Chrome/Edge.
- Exactly four approved course cards.
- Playlist pagination and metadata cache work.
- Only one official player instance.
- Resume accuracy within ±3 seconds.
- Progress and notes survive restart/update.
- Backup/restore round-trip succeeds.
- Offline shell works while media correctly requires network.
- No secret appears client-side.
- No downloading, proxying, rehosting, background playback or ad blocking.
- Test, accessibility, performance and dependency gates pass.

## Agent guardrails

1. Read the full DOCX and this file before coding.
2. Map tasks and tests to PRD requirement IDs.
3. Do not expand scope without an approved change request.
4. Keep persistent data in Dexie; Zustand is UI state only.
5. Preserve user data during every sync and migration.
6. Use official YouTube playback and keep player UI intact.
7. Never scrape Udemy or automate credentials.
8. If uncertain, reduce scope and record an ADR.

## Required owner inputs

- Exact official Chai aur Backend playlist ID.
- Verification of JavaScript and React playlist IDs.
- Exact purchased Udemy course URL.
- Udemy curriculum JSON/CSV using the template in the DOCX.
- Google Cloud YouTube Data API key stored in deployment environment.
- Final product name/icon direction, or approval to keep the working title.
