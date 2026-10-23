# FocusFlow OS 🎯

> **A distraction-free, local-first learning workspace for YouTube developer courses, playlists, and tutorials.**

FocusFlow transforms noisy YouTube tutorials into a structured, distraction-free study environment. No algorithmic recommendations, no clickbait thumbnails, no comment distractions, and zero tracking.

---

## 🚀 What Makes FocusFlow Special?

- ⚡ **Direct 1-Click Course Importer**: Paste any public YouTube playlist URL or single-video crash course directly on the Dashboard. It instantly fetches video metadata and builds your interactive course catalog.
- 🎯 **Distraction-Free Video Workspace**: Embedded theater player with auto-fading controls, playback memory, and zero YouTube homepage feeds or recommended sidebars.
- 📝 **Timestamped Note-Taking**: Capture study notes while watching videos. Click any `[MM:SS]` timestamp to seek instantly to that exact moment.
- ⏱️ **Smooth Pomodoro Focus & Recovery**: Integrated focus timer with automatic rest break countdowns, eye-strain relief tips, browser tab title countdown sync (`(24:45) 🎯 Focus`), and Web Audio chimes.
- 🔥 **Streak & Activity Calendar**: Real-time 30-day activity heatmap tracking daily learning sessions and milestones.
- ⌘ **Command Palette (`Ctrl + K`)**: Quick keyboard navigation between masterclasses, dashboard, and settings with power learner shortcuts.
- 💾 **100% Local-First & Private**: Powered by IndexedDB (`Dexie.js`). All progress, watch timestamps, and notes stay entirely inside your browser. No account or remote tracking required.
- 📦 **JSON Backup & Migration**: Effortlessly export and import your entire learning workspace as a validated JSON file to sync across devices.
- 📱 **Fully Responsive PWA**: Optimized for mobile, tablet, and ultra-wide displays with installable offline PWA capabilities.

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Frontend Framework** | React 19, React Router v7 |
| **Build Tool** | Vite 8 (with `@vitejs/plugin-react`) |
| **Local Database** | Dexie.js (IndexedDB wrapper) & `dexie-react-hooks` |
| **Validation** | Zod (strict schema enforcement for courses, lessons, and backups) |
| **State Management** | Zustand |
| **Styling** | Tailwind CSS v4, Lucide Icons, tw-animate-css |
| **Animations** | Framer Motion (with `prefers-reduced-motion` compliance) |
| **PWA** | `vite-plugin-pwa` (Workbox service worker) |

---

## 📁 Clean Architecture

```text
focus-flow/
├── public/                 # Static assets, PWA icons, favicon, logo
├── src/
│   ├── components/         # Reusable UI widgets (Pomodoro, CommandPalette, StreakModal, Dialog)
│   ├── db/                 # Dexie.js database instance & seed data
│   │   ├── FocusFlowDB.js
│   │   └── seedData.json
│   ├── features/
│   │   ├── dashboard/      # Dashboard catalog sections & dialogs
│   │   └── watch/          # Video player workspace, syllabus, notes & chapters
│   ├── hooks/              # Custom hooks (useDashboardData, useWatchData, useUIStore)
│   ├── pages/              # Clean page routes (Dashboard, CourseDetail, Watch, Settings)
│   ├── services/           # Data commands (Dexie transactions) & YouTube API service
│   ├── types/              # Zod validation schemas
│   ├── utils/              # Export markdown, streak calculations, selectors
│   ├── App.jsx             # Shell layout, vertical navigation dock & router
│   ├── index.css           # Modern design system & Tailwind tokens
│   └── main.jsx            # Application entrypoint
├── api/                    # Vercel serverless proxy (api/youtube.js)
├── package.json
└── vite.config.js
```

---

## ⚡ Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `pnpm`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ssiddiquiii/FocusFlow.git
   cd focus-flow
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   A built-in fallback key is pre-configured for local testing. If you want to use your own personal YouTube Data API v3 key:
   - Copy `.env.example` to `.env`:
     ```env
     VITE_YOUTUBE_API_KEY=your_google_cloud_api_key_here
     ```
   - *Alternatively*, you can paste your API key directly in the **Settings** page within the app without touching code.

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ⌨️ Power Learner Shortcuts

| Shortcut | Scope | Action |
|---|---|---|
| `Ctrl + K` / `⌘K` | Global | Open Command Palette & Quick Navigation |
| `Alt + D` | Global | Jump to Dashboard |
| `Alt + S` | Global | Jump to Settings & Backup |
| `Space` / `K` | Watch View | Play / Pause Video |
| `←` / `J` | Watch View | Seek backward 5 seconds |
| `→` / `L` | Watch View | Seek forward 5 seconds |
| `M` | Watch View | Toggle Mute / Unmute |
| `F` | Watch View | Toggle Theater / Fullscreen |
| `C` | Watch View | Toggle Captions (CC) |
| `Esc` | Modals | Close modal dialogs / Command Palette |

---

## 🔒 Privacy & Local-First Philosophy

FocusFlow follows a strict **privacy-first** approach:
- 🛡️ **Zero Tracking**: No Google Analytics, telemetry, or user behavior tracking.
- 💾 **Local Storage**: All notes, watch progress, bookmarks, and streaks stay inside your browser's IndexedDB.
- 📤 **Data Portability**: You own your data. Export your entire workspace into a clean Markdown bundle or a single JSON backup file anytime from Settings.

---
