# FocusFlow — YouTube Data API v3 Quota & Usage Analysis

This document provides a comprehensive technical breakdown of how **FocusFlow** utilizes the YouTube Data API v3, explaining the exact scenarios where API calls occur versus where the application operates on 0-unit local/CDN bandwidth.

---

## 📊 Daily Quota Baseline

- **Daily Free Quota Allowance:** `10,000 units / day` (Resets daily at 12:00 AM PST).
- **FocusFlow Consumption Model:** Local-first IndexedDB caching. Once data is seeded or imported, daily user interactions consume **0 API Quota Units**.

---

## 🚫 5 Scenarios Where YouTube API is NEVER Used (0 Quota Units)

The following common user actions operate completely offline or via direct CDN media streaming, consuming **zero (0)** YouTube Data API quota units:

1. **Daily Application Launches & Navigation**
   - Opening FocusFlow, switching routes (`Dashboard` → `Course Detail` → `Settings`), or closing/reopening the app reads 100% from local IndexedDB (`FocusFlowDB`).
2. **Browser History / Cache Clearance**
   - Wiping browser cache, site data, or IndexedDB triggers `db.seedIfEmpty()`, which re-populates data locally from the bundled `src/db/seedData.json` without any network API calls.
3. **Active Video Playback & Timestamp Seeking**
   - Watching lectures, pausing, seeking timestamps (`[MM:SS]`), or changing video speeds uses the **YouTube Iframe Player API** (`youtube.com/iframe_api`). Media streaming bytes travel directly from YouTube's video CDN (`googlevideo.com`) — this is standard web video streaming and consumes 0 Data API units.
4. **Writing, Editing, or Deleting Timestamped Notes**
   - Creating or managing notes occurs entirely within the local Dexie.js database (`db.notes`).
5. **Marking Lectures Complete & Calculating Progress Metrics**
   - Progress checkmarks, percentage meters, and course stats are updated and calculated locally in IndexedDB (`db.progress`).

---

## ⚡ 5 Scenarios Where YouTube API IS Used / Required

The following explicit administration, synchronization, or dynamic import actions require YouTube Data API v3 calls:

1. **Initial Playlist Metadata Ingestion (Build/Admin Script)**
   - Running `node scripts/fetchRealPlaylists.js` calls `playlists.list` to retrieve playlist title, channel name, and high-res thumbnail metadata (**Cost: 1 unit per playlist**).
2. **Batch Fetching Playlist Items (Lecture Lists)**
   - The fetch script calls `playlistItems.list` to retrieve up to 50 video IDs and titles per page (**Cost: 1 unit per 50 lectures**).
3. **Batch Fetching Video Durations (ISO 8601 Parsing)**
   - The fetch script calls `videos.list` with up to 50 comma-separated video IDs to retrieve exact durations (e.g. `PT12M45S` → `12:45`) (**Cost: 1 unit per 50 lectures**).
4. **Dynamic User Import of New YouTube Playlists (UI Feature)**
   - Pasting a new YouTube playlist URL (`https://youtube.com/playlist?list=PL...`) into the UI triggers client-side API requests to ingest metadata for the new course (**Cost: ~3 units per 50-video playlist**).
5. **Syncing Playlists for Newly Uploaded Lectures (Course Refresh)**
   - Invoking a "Check for New Lectures" action queries `playlistItems.list` with a `pageToken` or `publishedAfter` filter to detect newly published videos by the instructor (**Cost: 1-2 units per check**).

---

## 🧮 Quota Cost Summary Table

| Action | API Endpoint | Quota Cost | Storage Location |
| :--- | :--- | :--- | :--- |
| **App Navigation & Resume** | None (IndexedDB) | **0 units** | Browser IndexedDB |
| **Video Playback Stream** | YouTube IFrame Player | **0 units** | YouTube Media CDN |
| **Fetch Playlist Metadata** | `playlists.list` | **1 unit** | `seedData.json` / DB |
| **Fetch 50 Video Items** | `playlistItems.list` | **1 unit** | `seedData.json` / DB |
| **Fetch 50 Video Durations** | `videos.list` | **1 unit** | `seedData.json` / DB |
| **Dynamic Playlist Import** | Multi-endpoint batch | **~3 units** | Browser IndexedDB |

---

## 🎯 Architecture Conclusion

For a single user or student using FocusFlow daily:
- **Daily API Units Consumed:** `0 / 10,000`
- **Headroom:** `100%`

Even under extreme usage (watching 50+ lectures daily or opening the app 100 times), FocusFlow's local-first architecture ensures that your API quota remains completely untouched.
