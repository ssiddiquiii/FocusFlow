import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { BookOpen, Settings as SettingsIcon, WifiOff, Menu } from 'lucide-react';
import { useUIStore } from './hooks/useUIStore';

// Lazy-loaded page components for optimal bundle splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const Watch = lazy(() => import('./pages/Watch'));
const Settings = lazy(() => import('./pages/Settings'));
const Offline = lazy(() => import('./pages/Offline'));

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
        className={`border-r border-border bg-zinc-950 flex flex-col transition-all duration-300 relative ${
          sidebarCollapsed ? 'w-[72px]' : 'w-60'
        }`}
      >
        {/* Sidebar Header with Hamburger & Logo */}
        <div className="flex items-center h-16 mb-2">
          <div className="w-[72px] flex items-center justify-center flex-shrink-0">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-full hover:bg-zinc-800 text-white transition flex-shrink-0 cursor-pointer"
              title="Toggle Sidebar"
            >
              <Menu size={22} />
            </button>
          </div>
          
          <div className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <img
              src="/logo.svg"
              alt="FocusFlow"
              className="w-8 h-8 flex-shrink-0 select-none"
            />
            <div className="flex flex-col min-w-0">
              <h2 className="font-bold tracking-tight text-sm text-white leading-none whitespace-nowrap">FocusFlow</h2>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className={`flex-1 space-y-1 overflow-y-auto ${sidebarCollapsed ? 'px-1.5' : 'px-3'}`}>
          <Link 
            to="/" 
            className={`flex items-center w-full rounded-xl transition ${
              sidebarCollapsed 
                ? 'flex-col justify-center py-4 gap-1' 
                : 'flex-row px-3 py-2.5 gap-4'
            } ${
              isActive('/') 
                ? 'bg-zinc-800 font-medium text-white' 
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
            }`}
          >
            <BookOpen size={sidebarCollapsed ? 22 : 20} className={isActive('/') ? 'text-primary' : ''} />
            <span className={sidebarCollapsed ? 'text-[9px] text-center w-full truncate px-1' : 'text-sm'}>Dashboard</span>
          </Link>
          
          <Link 
            to="/settings" 
            className={`flex items-center w-full rounded-xl transition ${
              sidebarCollapsed 
                ? 'flex-col justify-center py-4 gap-1' 
                : 'flex-row px-3 py-2.5 gap-4'
            } ${
              isActive('/settings') 
                ? 'bg-zinc-800 font-medium text-white' 
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
            }`}
          >
            <SettingsIcon size={sidebarCollapsed ? 22 : 20} className={isActive('/settings') ? 'text-primary' : ''} />
            <span className={sidebarCollapsed ? 'text-[9px] text-center w-full truncate px-1' : 'text-sm'}>Settings</span>
          </Link>

          <Link 
            to="/offline" 
            className={`flex items-center w-full rounded-xl transition ${
              sidebarCollapsed 
                ? 'flex-col justify-center py-4 gap-1' 
                : 'flex-row px-3 py-2.5 gap-4'
            } ${
              isActive('/offline') 
                ? 'bg-zinc-800 font-medium text-white' 
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
            }`}
          >
            <WifiOff size={sidebarCollapsed ? 22 : 20} className={isActive('/offline') ? 'text-primary' : ''} />
            <span className={sidebarCollapsed ? 'text-[9px] text-center w-full truncate px-1' : 'text-sm'}>Offline</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-w-0">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        }>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/courses/:courseId" element={<CourseDetail />} />
            <Route path="/courses/:courseId/lessons/:lessonId" element={<Watch />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/offline" element={<Offline />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </Suspense>
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