import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Menu, Search, X } from 'lucide-react';
import PomodoroTimer from './components/PomodoroTimer';
import ErrorBoundary from './components/ErrorBoundary';
import CommandPalette from './components/CommandPalette';
import { useUIStore } from './hooks/useUIStore';
import { isNavigationActive, navigationItems } from './components/shell/navigation';

// Lazy-loaded page components with instant hover preloading
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const Watch = lazy(() => import('./pages/Watch'));
const Settings = lazy(() => import('./pages/Settings'));
const Offline = lazy(() => import('./pages/Offline'));
const PracticeHub = lazy(() => import('./pages/PracticeHub'));

// Preload functions for 0ms route switching
const preloadDashboard = () => import('./pages/Dashboard');
const preloadPractice = () => import('./pages/PracticeHub');

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Inner shell wrapper to access React Router location hooks.
 */
function AppContent() {
  const { commandPaletteOpen, openCommandPalette, closeCommandPalette } = useUIStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const commandPaletteReturnFocusRef = useRef(null);
  const drawerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);

  useEffect(() => {
    closeMobileSidebar();
  }, [location.pathname, closeMobileSidebar]);

  useEffect(() => {
    if (!mobileSidebarOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const menuButton = menuButtonRef.current;
    document.body.style.overflow = 'hidden';
    drawerRef.current?.querySelector(FOCUSABLE_SELECTOR)?.focus();

    function trapDrawerFocus(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMobileSidebar();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = [...(drawerRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) ?? [])];
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first) {
        event.preventDefault();
        drawerRef.current?.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', trapDrawerFocus);
    return () => {
      document.removeEventListener('keydown', trapDrawerFocus);
      document.body.style.overflow = previousOverflow;
      menuButton?.focus();
    };
  }, [mobileSidebarOpen, closeMobileSidebar]);

  useEffect(() => {
    function handleGlobalKeyDown(e) {
      const targetTag = e.target?.tagName?.toUpperCase();
      const isTyping = targetTag === 'INPUT' || targetTag === 'TEXTAREA' || e.target?.isContentEditable;

      // Ctrl+K / Cmd+K Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (commandPaletteOpen) closeCommandPalette();
        else {
          commandPaletteReturnFocusRef.current = document.activeElement;
          openCommandPalette();
        }
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
    }

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [commandPaletteOpen, openCommandPalette, closeCommandPalette, navigate]);

  return (
    <div className="relative flex min-h-screen bg-background text-foreground">
      {/* Mobile Backdrop Overlay when Drawer is Open */}
      {mobileSidebarOpen && (
        <div
          data-testid="navigation-backdrop"
          aria-hidden="true"
          onClick={closeMobileSidebar}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Mobile Glass Header Bar (Fixed Top Bar for Mobile Screens) */}
      <header className="safe-area-header fixed inset-x-0 top-0 z-40 flex min-h-14 items-center justify-between border-b border-border bg-zinc-950/95 px-3.5 shadow-md backdrop-blur-xl lg:hidden">
        <button
          ref={menuButtonRef}
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border bg-zinc-900 text-white transition hover:bg-zinc-800 cursor-pointer"
          aria-label={mobileSidebarOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={mobileSidebarOpen}
          aria-controls="mobile-navigation"
        >
          {mobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <Link to="/" onMouseEnter={preloadDashboard} className="flex items-center gap-2">
          <img src="/logo.svg" alt="FocusFlow" className="w-6 h-6 flex-shrink-0" />
          <span className="font-extrabold text-white text-xs tracking-tight">FocusFlow OS</span>
        </Link>

        <button
          onClick={(event) => {
            event.currentTarget.focus();
            commandPaletteReturnFocusRef.current = event.currentTarget;
            openCommandPalette();
          }}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border bg-zinc-900 text-zinc-400 transition hover:text-white cursor-pointer"
          aria-label="Open command palette"
        >
          <Search size={16} />
        </button>
      </header>

      {/* Desktop Floating Vertical Glass Navigation Dock (Performance Optimized) */}
      <aside data-testid="desktop-navigation" aria-label="Primary navigation" className="fixed left-3.5 top-1/2 z-50 hidden -translate-y-1/2 flex-col items-center space-y-3.5 rounded-2xl border border-white/10 bg-zinc-950/95 p-2.5 shadow-[0_15px_35px_rgba(0,0,0,0.6)] backdrop-blur-md lg:flex">
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
        {navigationItems.map((item) => {
          const isActive = isNavigationActive(location.pathname, item.path);
          const Icon = item.icon;

          let handleHover;
          if (item.path === '/') handleHover = preloadDashboard;
          if (item.path === '/practice') handleHover = preloadPractice;

          return (
            <Link
              key={item.path}
              to={item.path}
              onMouseEnter={handleHover}
              aria-label={item.name}
              aria-current={isActive ? 'page' : undefined}
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
        id="mobile-navigation"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Primary navigation"
        aria-hidden={!mobileSidebarOpen}
        inert={!mobileSidebarOpen}
        tabIndex={-1}
        className={`safe-area-drawer fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col justify-between border-r border-border bg-zinc-950/98 p-4 backdrop-blur-2xl transition-transform duration-300 lg:hidden ${
          mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6 pt-12">
          <div className="flex items-center gap-3 px-2">
            <img src="/logo.svg" alt="FocusFlow" className="w-8 h-8" />
            <span className="font-extrabold text-white text-base">FocusFlow</span>
          </div>

          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = isNavigationActive(location.pathname, item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileSidebar}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex min-h-11 items-center gap-3.5 rounded-xl px-4 py-3 text-xs font-bold transition ${
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

      {/* Main Content View Container */}
      <main className={`safe-area-main min-w-0 flex-1 pb-4 ${
        location.pathname.includes('/lessons/') 
          ? 'safe-area-main-watch lg:pt-0 lg:pl-22 xl:pl-24 px-2 sm:px-4'
          : 'pt-16 lg:pt-4 lg:pl-22 xl:pl-24 px-3.5 sm:px-6'
      }`}>
        <ErrorBoundary>
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          }>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div 
                key={location.pathname} 
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.1, ease: 'easeOut' }}
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

        {/* One-Line Minimal Global Footer (Tightened top spacing) */}
        <footer className="mt-6 mb-2 py-3 border-t border-border/30 text-center text-[11px] text-zinc-500 font-medium">
          FocusFlow OS • Built by <span className="text-zinc-300 font-bold">Sameed Siddiqui</span> • Local-First Developer Workspace
        </footer>
      </main>

      {/* Global Command Palette (Ctrl + K / Search) */}
      <CommandPalette 
        isOpen={commandPaletteOpen} 
        onClose={closeCommandPalette} 
        returnFocusRef={commandPaletteReturnFocusRef}
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
