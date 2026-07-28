import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Settings as SettingsIcon, WifiOff, Menu, Target, Zap, Search, X } from 'lucide-react';
import PomodoroTimer from './components/PomodoroTimer';
import ErrorBoundary from './components/ErrorBoundary';
import CommandPalette from './components/CommandPalette';
import { useUIStore } from './hooks/useUIStore';

// Lazy-loaded page components with instant hover preloading
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const Watch = lazy(() => import('./pages/Watch'));
const Settings = lazy(() => import('./pages/Settings'));
const Offline = lazy(() => import('./pages/Offline'));
const PracticeHub = lazy(() => import('./pages/PracticeHub'));

// Preload functions for 0ms route switching
const preloadDashboard = () => import('./pages/Dashboard');
const preloadCourseDetail = () => import('./pages/CourseDetail');
const preloadWatch = () => import('./pages/Watch');
const preloadPractice = () => import('./pages/PracticeHub');

/**
 * Inner shell wrapper to access React Router location hooks.
 */
function AppContent() {
  const { 
    sidebarCollapsed, 
    toggleSidebar, 
    commandPaletteOpen, 
    openCommandPalette, 
    closeCommandPalette 
  } = useUIStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    function handleGlobalKeyDown(e) {
      const targetTag = e.target?.tagName?.toUpperCase();
      const isTyping = targetTag === 'INPUT' || targetTag === 'TEXTAREA' || e.target?.isContentEditable;

      // Ctrl+K / Cmd+K Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (commandPaletteOpen) closeCommandPalette();
        else openCommandPalette();
        return;
      }

      // Alt key shortcuts (only when not typing in an input element)
      if (e.altKey && !isTyping) {
        const key = e.key.toLowerCase();
        if (key === 'd') {
          e.preventDefault();
          navigate('/');
        } else if (key === 'p') {
          e.preventDefault();
          navigate('/practice');
        } else if (key === 's') {
          e.preventDefault();
          navigate('/settings');
        } else if (key === 'o') {
          e.preventDefault();
          navigate('/offline');
        }
      }

      // Escape key to close open overlays
      if (e.key === 'Escape') {
        if (commandPaletteOpen) closeCommandPalette();
        if (mobileSidebarOpen) setMobileSidebarOpen(false);
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [commandPaletteOpen, mobileSidebarOpen, openCommandPalette, closeCommandPalette, navigate]);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: BookOpen },
    { name: 'Practice', path: '/practice', icon: Target },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
    { name: 'Offline', path: '/offline', icon: WifiOff }
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground relative overflow-x-hidden">
      {/* Mobile Backdrop Overlay when Drawer is Open */}
      {mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)} 
          className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300" 
        />
      )}

      {/* Mobile Glass Header Bar (Fixed Top Bar for Mobile Screens) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-zinc-950/95 border-b border-border backdrop-blur-xl z-40 flex items-center justify-between px-3.5 shadow-md">
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-xl bg-zinc-900 border border-border text-white hover:bg-zinc-800 transition cursor-pointer flex items-center justify-center"
          title="Open Navigation"
        >
          {mobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <Link to="/" onMouseEnter={preloadDashboard} className="flex items-center gap-2">
          <img src="/logo.svg" alt="FocusFlow" className="w-6 h-6 flex-shrink-0" />
          <span className="font-extrabold text-white text-xs tracking-tight">FocusFlow OS</span>
        </Link>

        <button
          onClick={openCommandPalette}
          className="p-2 rounded-xl bg-zinc-900 border border-border text-zinc-400 hover:text-white transition cursor-pointer"
          title="Search / Command Palette (Ctrl+K)"
        >
          <Search size={16} />
        </button>
      </div>

      {/* Desktop Floating Vertical Glass Navigation Dock (With Brand Logo Integrated at Top) */}
      <aside className="hidden md:flex fixed left-3.5 top-1/2 -translate-y-1/2 z-50 flex-col items-center p-2.5 rounded-2xl bg-zinc-950/90 border border-white/10 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] space-y-3.5">
        {/* Integrated Brand Logo Icon at Top of Dock */}
        <Link 
          to="/" 
          onMouseEnter={preloadDashboard}
          className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 via-zinc-900 to-accent/20 border border-primary/40 flex items-center justify-center shadow-lg hover:scale-105 transition cursor-pointer group relative"
          title="FocusFlow Home Dashboard"
        >
          <img src="/logo.svg" alt="FocusFlow" className="w-6 h-6 flex-shrink-0 group-hover:scale-110 transition" />
          <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-xl z-50">
            FocusFlow Home
          </span>
        </Link>

        {/* Subtle Divider */}
        <div className="w-6 h-[1px] bg-zinc-800/80 my-0.5" />

        {/* Navigation Dock Items */}
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          let handleHover;
          if (item.path === '/') handleHover = preloadDashboard;
          if (item.path === '/practice') handleHover = preloadPractice;

          return (
            <Link
              key={item.path}
              to={item.path}
              onMouseEnter={handleHover}
              className={`relative w-11 h-11 rounded-xl transition duration-200 flex items-center justify-center cursor-pointer group ${
                isActive 
                  ? 'bg-primary/20 text-primary border border-primary/40 shadow-md' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/90'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-primary' : 'text-zinc-400 group-hover:text-white'} />
              {/* Floating Tooltip Label */}
              <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-xl z-50">
                {item.name}
              </span>
            </Link>
          );
        })}
      </aside>

      {/* Mobile Drawer Navigation (Slide-out) */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-zinc-950/98 border-r border-border backdrop-blur-2xl p-4 flex flex-col justify-between transition-transform duration-300 md:hidden ${
          mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6 pt-12">
          <div className="flex items-center gap-3 px-2">
            <img src="/logo.svg" alt="FocusFlow" className="w-8 h-8" />
            <span className="font-extrabold text-white text-base">FocusFlow</span>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-xs transition ${
                    isActive 
                      ? 'bg-primary/20 text-primary border border-primary/30' 
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content View Container (Spacious left offset to guarantee dock clearance) */}
      <main className={`flex-1 overflow-y-auto min-w-0 ${
        location.pathname.includes('/lessons/') 
          ? 'pt-14 md:pt-0 md:pl-22 lg:pl-24 pr-2 sm:pr-4' 
          : 'pt-16 md:pt-4 md:pl-22 lg:pl-24 pr-3 sm:pr-6'
      }`}>
        <ErrorBoundary>
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          }>
            <AnimatePresence mode="wait">
              <motion.div 
                key={location.pathname} 
                initial={{ opacity: 0, y: 8, scale: 0.995 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.995 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="h-full min-w-0"
              >
                <Routes location={location}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/courses/:courseId" element={<CourseDetail />} />
                  <Route path="/courses/:courseId/lessons/:lessonId" element={<Watch />} />
                  <Route path="/practice" element={<PracticeHub />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/offline" element={<Offline />} />
                  <Route path="*" element={<Dashboard />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </ErrorBoundary>

        {/* One-Line Minimal Global Footer */}
        <footer className="mt-12 py-4 border-t border-border/40 text-center text-[11px] text-zinc-500 font-medium">
          FocusFlow OS • Built by <span className="text-zinc-300 font-bold">Sameed Siddiqui</span> • Local-First Developer Workspace
        </footer>
      </main>

      {/* Global Command Palette (Ctrl + K / Search) */}
      <CommandPalette 
        isOpen={commandPaletteOpen} 
        onClose={closeCommandPalette} 
      />

      <PomodoroTimer />
    </div>
  );
}

/**
 * Main Application Layout Router.
 */
export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppContent />
      </Router>
    </ErrorBoundary>
  );
}