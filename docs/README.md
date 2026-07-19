# FocusFlow Developer Guides

Welcome to the **FocusFlow** developer workspace. This directory contains detailed step-by-step implementation guides for building your distraction-free, local-first learning Progressive Web App. 

As requested, this project is built using a **coaching model**. You are the primary developer, and these guides will show you exactly what to run, what files to create, and the logic behind every line of code.

## Phased Development Roadmap

Follow these guides in order:

*   [Phase 1: Foundation, Styling & Routing](file:///c:/Users/samee/OneDrive/Desktop/New%20folder/docs/phase1_foundation.md) — Initialize the Vite + React + TS project, configure Tailwind CSS, set up Shadcn UI component hooks, configure React Router, and set up the Progressive Web App (PWA) baseline.
*   [Phase 2: Dexie.js Database & Validation](file:///c:/Users/samee/OneDrive/Desktop/New%20folder/docs/phase2_database.md) — Establish the browser-based IndexedDB database using Dexie, define data schemas with Zod validation, and write backup/restore scripts.
*   [Phase 3: Serverless API Proxy & UI Layout](file:///c:/Users/samee/OneDrive/Desktop/New%20folder/docs/phase3_api_dashboard.md) — Set up the Vercel serverless functions to fetch YouTube metadata securely and build the core catalog dashboard.
*   [Phase 4: YouTube Custom Player & Progress](file:///c:/Users/samee/OneDrive/Desktop/New%20folder/docs/phase4_player_progress.md) — Wrap the official YouTube IFrame Player API, write the watch history saving engine, and enable auto-resume.
*   [Phase 5: Synced Notes & Settings](file:///c:/Users/samee/OneDrive/Desktop/New%20folder/docs/phase5_notes_settings.md) — Build the note-taking panel with synced timestamps, integrate manual tracking checks, set up offline caching rules, and run validation.

---

## Technical Stack Cheat Sheet

1.  **Vite + React + TS:** Bundling engine. Runs as a Single Page App (SPA).
2.  **Dexie + IndexedDB:** Client-side database. No background server engine required.
3.  **Zustand:** Very lightweight state library used strictly for UI states.
4.  **Tailwind CSS + Shadcn UI:** Style configuration. Copy-paste components directly into your project.
