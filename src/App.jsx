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