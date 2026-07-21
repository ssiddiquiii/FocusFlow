# FocusFlow

FocusFlow is a local-first, distraction-free learning dashboard built for watching video courses without YouTube recommendations, ads, or algorithmic clutter. It gives you full control over your learning progress, timestamped note-taking, and course management.

---

## ⚡ Key Features

- **Distraction-Free YouTube Player**: Embedded custom controls with zero recommendations, ad overlays, or related video popups.
- **Timestamped Note Taking**: Write notes while watching videos with one-click timestamp seeking (`[MM:SS]`).
- **YouTube & Udemy Course Support**: Track structured YouTube playlists via API and manually log progress for Udemy/external courses.
- **Per-Catalog Resume Tracking**: Automatically remembers the exact video and timestamp where you left off for each course.
- **Local-First & Offline Ready**: Powered by IndexedDB (Dexie.js). Your notes, progress, and course data stay 100% private in your browser.
- **Installable PWA**: Installable as a standalone desktop or mobile application via Chrome / Web App Install.
- **Keyboard Controls**: Complete media navigation shortcuts (`Space`/`K` for play-pause, `J`/`L` for 5s seek, `M` for mute, `F` for fullscreen, `C` for captions).
- **Auto-Hiding Controls**: Player controls and mouse cursor automatically fade out when idle during video playback.
- **Backup Export & Import**: JSON schema-validated backup system to back up and restore your database across devices.

---

## 🛠️ Tech Stack

- **Frontend Core**: React 19, React Router v7
- **Build Tool**: Vite 8
- **Database**: Dexie.js (IndexedDB wrapper) with `dexie-react-hooks`
- **Validation**: Zod (schema enforcement for courses, lessons, progress, and backups)
- **State Management**: Zustand
- **Styling**: Tailwind CSS v4, Lucide Icons
- **PWA**: `vite-plugin-pwa` (Workbox service worker)

---

## 📁 Project Structure

```text
focus-flow/
├── public/                  # Static assets, PWA icons, favicon, logo
├── scripts/                 # Utility scripts (YouTube playlist fetcher)
│   └── fetchRealPlaylists.js
├── src/
│   ├── assets/              # Web fonts & styles
│   ├── components/          # Reusable UI components
│   ├── db/                  # Dexie.js IndexedDB instance & seed data
│   │   ├── FocusFlowDB.js
│   │   └── seedData.json
│   ├── hooks/               # Custom hooks (useFocusFlow, useUIStore)
│   ├── pages/               # Page routes (Dashboard, CourseDetail, Watch, Settings, Offline)
│   ├── types/               # Zod validation schemas
│   ├── App.jsx              # Main App layout & route configuration
│   ├── index.css            # Tailwind CSS v4 & theme variables
│   └── main.jsx             # React DOM entrypoint
├── docs/                    # Architecture & feature roadmap documentation
├── package.json
└── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ssiddiquiii/FocusFlow.git
   cd focus-flow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root:
   ```env
   YOUTUBE_API_KEY=your_youtube_data_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### 🔑 Obtaining & Configuring a YouTube Data API v3 Key

FocusFlow uses local IndexedDB caching, meaning **daily video watching, note-taking, and app navigation consume 0 API quota units**. 

An API Key is only required if you want to run the playlist fetch script (`scripts/fetchRealPlaylists.js`) or import new YouTube playlists:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., `FocusFlow-Local`).
3. Navigate to **APIs & Services** > **Library**, search for **YouTube Data API v3**, and click **Enable**.
4. Navigate to **APIs & Services** > **Credentials**, click **Create Credentials** > **API Key**.
5. Copy your API Key and paste it into your `.env` file (`YOUTUBE_API_KEY=your_key_here`) or Vercel Environment Variables.

*For detailed API quota mechanics and 0-unit vs active API scenarios, see [docs/YOUTUBE_API_QUOTA_ANALYSIS.md](docs/YOUTUBE_API_QUOTA_ANALYSIS.md).*

---

## 📦 Building for Production

To create an optimized production build:

```bash
npm run build
```

The compiled assets will be generated in the `dist/` directory, ready to deploy to Vercel, Netlify, or any static host.

---

## ⌨️ Keyboard Shortcuts (Watch View)

| Key | Action |
| --- | --- |
| `Space` / `K` | Toggle Play / Pause |
| `←` / `J` | Seek backward 5 seconds |
| `→` / `L` | Seek forward 5 seconds |
| `M` | Toggle Mute / Unmute |
| `F` | Toggle Fullscreen |
| `C` | Toggle Captions (CC) |

*Shortcuts are automatically disabled when typing inside note inputs or textareas.*

---

## 📚 Deep Dive Documentation

For in-depth architecture reports, technical feasibility evaluations, and product roadmaps, refer to the documents in the [`docs/`](docs/) directory:

- [**`docs/CRITICAL_EVALUATION.md`**](docs/CRITICAL_EVALUATION.md): Critical analysis of system dependencies, YouTube ToS & ad behavior, market viability, and SaaS feasibility.
- [**`docs/YOUTUBE_API_QUOTA_ANALYSIS.md`**](docs/YOUTUBE_API_QUOTA_ANALYSIS.md): Technical breakdown of 5 zero-unit local scenarios vs 5 active YouTube Data API quota scenarios.
- [**`docs/ROADMAP_RECOMMENDATIONS.md`**](docs/ROADMAP_RECOMMENDATIONS.md): Future technical roadmap covering Command Palette (`Ctrl+K`), Markdown sync, speed memory, and code scratchpad.

---

## 🔒 Data & Privacy

FocusFlow operates entirely on a **local-first** architecture. None of your notes, progress statistics, or personal learning data are sent to external servers. Data is stored locally using IndexedDB in your browser. You can export a JSON backup at any time from the **Settings** page.

---

## 📄 License

This project is licensed under the MIT License.
