import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CourseDetail from './pages/CourseDetail';
import Watch from './pages/Watch';
import Settings from './pages/Settings';
import Offline from './pages/Offline';
import { BookOpen, Settings as SettingsIcon, WifiOff, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUIStore } from './hooks/useUIStore';

/**
 * Inner shell wrapper to access React Router location hooks.
 */
function AppContent() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const location = useLocation();

  // Helper to check if a link is currently active
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Collapsible Sidebar Navigation */}
      <aside 
        className={`border-r border-border bg-zinc-950 flex flex-col p-4 transition-all duration-300 relative ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Toggle Collapse Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3.5 top-6 w-7 h-7 rounded-full bg-zinc-900 border border-border flex items-center justify-center text-zinc-400 hover:text-white hover:border-primary/50 transition z-20 cursor-pointer"
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Sidebar Header */}
        <div className={`mb-8 px-2 flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : 'justify-start'}`}>
          <img 
            src="/logo.svg" 
            alt="FocusFlow Logo" 
            className="w-8 h-8 rounded-lg shadow-md shadow-primary/20 flex-shrink-0 select-none"
          />
          {!sidebarCollapsed && (
            <div className="flex flex-col min-w-0">
              <h2 className="font-bold tracking-wider text-sm text-white leading-none">FocusFlow</h2>
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold mt-1">
                Local Learning
              </span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-2">
          <Link 
            to="/" 
            title={sidebarCollapsed ? "Dashboard" : ""}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
              isActive('/') 
                ? 'bg-primary/10 text-primary border border-primary/20' 
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-white border border-transparent'
            } ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <BookOpen size={18} />
            {!sidebarCollapsed && <span className="text-sm font-medium">Dashboard</span>}
          </Link>
          
          <Link 
            to="/settings" 
            title={sidebarCollapsed ? "Settings" : ""}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
              isActive('/settings') 
                ? 'bg-primary/10 text-primary border border-primary/20' 
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-white border border-transparent'
            } ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <SettingsIcon size={18} />
            {!sidebarCollapsed && <span className="text-sm font-medium">Settings</span>}
          </Link>

          <Link 
            to="/offline" 
            title={sidebarCollapsed ? "Offline Info" : ""}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
              isActive('/offline') 
                ? 'bg-primary/10 text-primary border border-primary/20' 
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-white border border-transparent'
            } ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <WifiOff size={18} />
            {!sidebarCollapsed && <span className="text-sm font-medium">Offline Info</span>}
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-w-0">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />
          <Route path="/courses/:courseId/lessons/:lessonId" element={<Watch />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/offline" element={<Offline />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
}

/**
 * Main Application Layout Router.
 */
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}