# FocusFlow — Future Feature Recommendations & Architecture Roadmap

This document outlines key technical and feature recommendations to elevate **FocusFlow** into a 10x distraction-free personal learning workspace.

---

## 🎯 Core Product Vision

FocusFlow is designed for high-velocity learning without the algorithmic distractions, ad interruptions, and recommendation rabbit holes of public platforms. Every recommendation below serves to increase retention, decrease friction, and keep the learner in a continuous flow state.

---

## 🚀 Recommended Features

### 1. Global Command Palette & Search (`Ctrl + K` / `Cmd + K`)
- **Overview:** A keyboard-driven command palette for instant global search across the entire IndexedDB store.
- **Capabilities:**
  - Search course titles, lecture names, and instructor names.
  - Search inside timestamped user notes by keyword.
  - Instant navigation (`Jump to Lecture`, `Toggle Sidebar`, `Export Backup`).
- **Impact:** Eliminates friction when reviewing past notes or jumping between different courses.

---

### 2. Note Export & Obsidian / Notion Markdown Sync
- **Overview:** One-click export for timestamped notes into structured `.md` files or direct clipboard copies.
- **Capabilities:**
  - Export notes for a specific lecture or entire course.
  - Formatted timestamp links (e.g. `[04:15] - Key concept explanation`).
  - Native compatibility with note-taking tools like Obsidian, Notion, and Logseq.
- **Impact:** Seamlessly bridges FocusFlow with the user's secondary note-taking system.

---

### 3. Global Playback Speed Preference & Persistence
- **Overview:** Remembers the user's preferred playback speed across sessions and courses.
- **Capabilities:**
  - Persist default speed preference (e.g., `1.5x`, `1.75x`, `2.0x`) in Zustand / LocalStorage.
  - Automatically apply saved speed when a new video starts loading.
  - Hotkey support (`Shift + >` to increase, `Shift + <` to decrease).
- **Impact:** Saves repetitive manual adjustments for power learners.

---

### 4. Embedded Code Scratchpad & Playground
- **Overview:** A collapsible side-by-side code editor for developer-focused courses.
- **Capabilities:**
  - JavaScript / HTML / CSS live sandbox right next to the video player.
  - Allows quick experimentation without leaving the app or switching windows.
  - Code state persisted locally per lesson.
- **Impact:** Prevents context-switching and keeps developers in the flow state while watching technical lectures.

---

## 🛠️ Infrastructure & Stability Guidelines

1. **IndexedDB Version Migration Safety:** When adding new tables or schema changes, increment Dexie version numbers explicitly (`this.version(2).stores(...)`) with migration handlers.
2. **PWA Offline Asset Caching:** Keep precache manifest minimal to prevent storage bloat, utilizing dynamic runtime caching for thumbnails.
3. **Service Worker Auto-Updates:** Retain `registerType: 'autoUpdate'` to ensure users automatically receive app shell updates upon reload.
