# Phase 1: Project Foundation, Styling & Routing (WP-1)
## Javascript (ESM) & Production-Grade Edition (Tailwind CSS v4)

This developer guide details the step-by-step setup of **FocusFlow**. Follow each step in sequence to configure Git/GitHub, initialize the workspace, delete boilerplate files, configure Tailwind v4, set up routing, and activate PWA settings.

---

## 1. Directory Layout & Architecture

A production-ready application requires a strict directory layout to separate data logic from UI rendering. 

Once initialized, your project directory structure will look like this:

```text
focus-flow/
├── docs/                      # Developer documentation and guides
├── public/                    # PWA static assets (icons, manifest)
├── src/
│   ├── components/            # Shared, reusable UI components (buttons, panels)
│   ├── db/                    # Dexie database instance and schema models
│   ├── hooks/                 # Custom React hooks (player state, note sync)
│   ├── pages/                 # Full routing page views (Dashboard, Watch, Settings)
│   ├── types/                 # Zod validation schemas
│   ├── App.jsx                # Main Router and Layout Shell
│   ├── index.css              # Global styles and Tailwind v4 theme variables
│   └── main.jsx               # React DOM rendering entrypoint
├── vite.config.js             # Vite bundler, PWA, and Tailwind plugin config
└── package.json               # Package dependencies and runner scripts
```

---

## 2. Step-by-Step Implementation Guide

### Step 2.1: Git & GitHub Repository Initialization

Before writing code, we initialize Git to version-control our work. We also create a `.gitignore` file to prevent heavy node modules, local logs, and build artifacts from leaking into public repositories.

#### Commands to Run:
Run these commands in the root of your project directory (`c:\Users\samee\OneDrive\Desktop\focus-flow`):

```bash
# 1. Initialize Git local repository
git init

# 2. Rename default branch to 'main'
git branch -M main
```

#### Files to Create:

Create a file named `.gitignore` in the root folder, and add the following lines:
```text
# Node dependencies
node_modules/
jspm_packages/

# Build outputs
dist/
tmp/
out/

# IDE files
.idea/
.vscode/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# OS files
.DS_Store
Thumbs.db

# Environmental Secrets
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Local DB logs
*.db
*.db-journal
```

#### Commit the baseline files:
```bash
git add .gitignore docs/ FocusLearn_Implementation_PRD_v1.0.*
git commit -m "chore: baseline documentation and gitignore setup"
```
*(Now, go to GitHub.com, create a private repository named `FocusFlow`, copy the remote link, and run these commands to sync it):*
```bash
# Replace <URL> with your actual GitHub repository URL
git remote add origin <URL>
git push -u origin main
```

---

### Step 2.2: Initializing the Vite App (Non-Overwriting Move)

We temporarily move the PRD files out, initialize the React template in our directory, and restore the documents.

#### Commands to Run:

1.  **Move the PRD and docs files out to the parent folder:**
    *   *If using PowerShell:*
        ```powershell
        Move-Item FocusLearn_Implementation_PRD_v1.0.*, docs ..\
        ```
    *   *If using Git Bash / CMD:*
        ```bash
        mv FocusLearn_Implementation_PRD_v1.0.* docs ../
        ```

2.  **Initialize the Vite React (JavaScript) App in the current folder:**
    ```bash
    npx create-vite@latest ./ --template react --no-interactive
    ```

3.  **Move the files back in:**
    *   *If using PowerShell:*
        ```powershell
        Move-Item ..\FocusLearn_Implementation_PRD_v1.0.*, ..\docs ./
        ```
    *   *If using Git Bash / CMD:*
        ```bash
        mv ../FocusLearn_Implementation_PRD_v1.0.* ../docs ./
        ```

---

### Step 2.3: Cleaning Up Boilerplate / Unused Files

Default templates come with sample logos and styles that conflict with our clean layout. We delete them to maintain an empty, production-grade canvas.

#### Commands to Run (Delete Unused Files):
*   *If using PowerShell:*
        ```powershell
        Remove-Item src/App.css, src/assets/react.svg, public/vite.svg -ErrorAction Ignore
        ```
*   *If using Git Bash / CMD / Linux:*
        ```bash
        rm src/App.css src/assets/react.svg public/vite.svg
        ```

---

### Step 2.4: Installing Core Dependencies

We install our database wrapper, routing engine, state libraries, and the brand-new Tailwind CSS v4 compiler.

#### Commands to Run:
```bash
# 1. Install production libraries
npm install react-router-dom zustand @tanstack/react-query dexie dexie-react-hooks zod lucide-react

# 2. Install dev dependencies (Tailwind CSS v4 & PWA builder)
npm install -D tailwindcss @tailwindcss/vite vite-plugin-pwa
```
*(PostCSS and Autoprefixer are omitted because Tailwind v4 compiles them natively inside the Vite compilation stream).*

---

### Step 2.5: Setting Up Tailwind CSS v4 CSS-First Styling

Tailwind CSS v4 replaces JavaScript configuration files (`tailwind.config.js`) with a **CSS-first approach** using the `@theme` directive directly in the stylesheet.

#### Files to Modify:

Open `src/index.css` and replace all its contents with this structure:
```css
@import "tailwindcss";

@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

@theme {
  /* Design Tokens mapped to custom properties */
  --color-background: #09090b; /* Zinc 950 */
  --color-foreground: #fafafa; /* Zinc 50 */
  --color-card: rgba(24, 24, 27, 0.65); /* Zinc 900 Glassmorphic layer */
  --color-border: rgba(255, 255, 255, 0.08);
  --color-primary: #6366f1; /* Indigo 500 */
  --color-primary-hover: #4f46e5; /* Indigo 600 */
  --color-accent: #06b6d4; /* Cyan 500 */
  --color-accent-hover: #0891b2; /* Cyan 600 */

  /* Global Typographic Font Definition */
  --font-sans: 'Outfit', sans-serif;
}

body {
  background-color: var(--color-background);
  color: var(--color-foreground);
  font-family: var(--font-sans);
  overflow-x: hidden;
}

/* Glassmorphism panel card utility class */
.glass-panel {
  background: var(--color-card);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--color-border);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
}

/* Custom Scrollbars */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #09090b;
}
::-webkit-scrollbar-thumb {
  background: #27272a;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #3f3f46;
}
```

---

### Step 2.6: Initializing Shadcn UI Baseline

Shadcn requires configuration metadata.

#### Command to Run:
```bash
npx shadcn@latest init
```
*Select default options (TypeScript: No, Style: Default, Base Color: Slate/Zinc, CSS variables: Yes).*

---

### Step 2.7: Creating Subdirectories

We create folders to separate the codebase domains.

#### Commands to Run:
*   *If using PowerShell:*
    ```powershell
    New-Item -ItemType Directory src/components, src/db, src/hooks, src/pages, src/types -Force
    ```
*   *If using Git Bash / CMD:*
    ```bash
    mkdir -p src/components src/db src/hooks src/pages src/types
    ```

---

### Step 2.8: Configuring App Routing & Sidebar Layout

We write the base navigation layouts and define the client routes.

#### Files to Create:

##### 1. Create `src/pages/Dashboard.jsx`
```jsx
import React from 'react';

/**
 * Dashboard View component.
 * Displays the list of imported courses.
 * @returns {React.JSX.Element} The rendered dashboard.
 */
export default function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold mb-6">My Courses</h1>
      <p className="text-zinc-400">Welcome to FocusFlow. Your playlists will appear here.</p>
    </div>
  );
}
```

##### 2. Create `src/pages/Settings.jsx`
```jsx
import React from 'react';

/**
 * Settings view component.
 * Controls backups, JSON imports, and configurations.
 * @returns {React.JSX.Element} The settings panel.
 */
export default function Settings() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold mb-6">Settings</h1>
      <p className="text-zinc-400">Export backups, restore data, or change your API key.</p>
    </div>
  );
}
```

##### 3. Create `src/pages/Offline.jsx`
```jsx
import React from 'react';

/**
 * Offline Fallback View.
 * Renders when network connection is missing.
 * @returns {React.JSX.Element}
 */
export default function Offline() {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[50vh]">
      <h1 className="text-3xl font-semibold mb-4 text-accent">You are Offline</h1>
      <p className="text-zinc-400 text-center max-w-md">
        FocusFlow can display cached course layouts, but playing YouTube videos requires an active network connection.
      </p>
    </div>
  );
}
```

#### Files to Modify:

##### 1. Modify `src/App.jsx`
Replace the content of `src/App.jsx` with the core routes and the navigation sidebar layout:
```jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Offline from './pages/Offline';
import { BookOpen, Settings as SettingsIcon, WifiOff } from 'lucide-react';

/**
 * Main Application Layout & Client Router Shell.
 * @returns {React.JSX.Element} Core Application shell.
 */
export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-background text-foreground">
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r border-border bg-zinc-950 flex flex-col p-4">
          <div className="mb-8 px-2">
            <h2 className="text-2xl font-bold tracking-wider text-primary">FocusFlow</h2>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Local Learning Shell</span>
          </div>

          <nav className="flex-1 space-y-1">
            <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-300 hover:bg-zinc-900 hover:text-white transition">
              <BookOpen size={18} />
              <span>Dashboard</span>
            </Link>
            <Link to="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-300 hover:bg-zinc-900 hover:text-white transition">
              <SettingsIcon size={18} />
              <span>Settings</span>
            </Link>
            <Link to="/offline" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-300 hover:bg-zinc-900 hover:text-white transition">
              <WifiOff size={18} />
              <span>Offline Info</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/offline" element={<Offline />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
```

##### 2. Modify `src/main.jsx`
Open `src/main.jsx` and ensure it imports `index.css` and mounts the router:
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

### Step 2.9: Configuring the Vite and PWA Plugins

We hook up the `@tailwindcss/vite` plugin and PWA compiler settings.

#### Files to Modify:

##### 1. Modify `vite.config.js`
Replace all contents of `vite.config.js` with the following configuration:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'FocusFlow Personal Learning',
        short_name: 'FocusFlow',
        description: 'Distraction-free, local-first learning PWA dashboard',
        theme_color: '#09090b',
        background_color: '#09090b',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})
```

---

## Step 2.10: Verification

Run the development compiler to verify the build runs smoothly:
```bash
npm run dev
```
Open `http://localhost:5173`. Toggle the routes in the sidebar. Verify that:
1.  No default logos (like the spinning React logo) remain.
2.  Navigation occurs instantly without page refreshes.
3.  Tailwind v4 styles apply without build warnings.
