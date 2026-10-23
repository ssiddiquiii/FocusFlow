import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Menu, Search, X, Sun, Moon } from 'lucide-react';
import PomodoroTimer from './components/PomodoroTimer';
import ErrorBoundary from './components/ErrorBoundary';
import CommandPalette from './components/CommandPalette';
import { useUIStore } from './hooks/useUIStore';
import { useTheme } from './hooks/useTheme';
import { isNavigationActive, navigationItems } from './components/shell/navigation';

// Lazy-loaded page components with instant hover preloading
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const Watch = lazy(() => import('./pages/Watch'));
const Settings = lazy(() => import('./pages/Settings'));
// Preload functions for 0ms route switching
const preloadDashboard = () => import('./pages/Dashboard');
const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Inner shell wrapper to access React Router location hooks.
 */
function AppContent() {
  const { commandPaletteOpen, openCommandPalette, closeCommandPalette } = useUIStore();
  const { isDark, toggleTheme } = useTheme();
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
        } else if (key === 's') {
          e.preventDefault();
          navigate('/settings');
        }
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [commandPaletteOpen, openCommandPalette, closeCommandPalette, navigate]);

  return (
    <div className="relative flex min-h-screen bg-background text-foreground transition-colors duration-150">
      {/* Mobile Backdrop Overlay when Drawer is Open */}
      {mobileSidebarOpen && (
        <div
          data-testid="navigation-backdrop"
          aria-hidden="true"
          onClick={closeMobileSidebar}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Mobile Glass Header Bar */}
      <header className="safe-area-header fixed inset-x-0 top-0 z-40 flex min-h-14 items-center justify-between border-b border-border bg-background/90 px-3.5 shadow-sm backdrop-blur-xl lg:hidden">
        <button
          ref={menuButtonRef}
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border bg-card text-foreground transition hover:bg-muted cursor-pointer"
          aria-label={mobileSidebarOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={mobileSidebarOpen}
          aria-controls="mobile-navigation"
        >
          {mobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <Link to="/" onMouseEnter={preloadDashboard} className="flex items-center gap-2">
          <img src="/logo.svg" alt="FocusFlow" className="w-6 h-6 flex-shrink-0" />
          <span className="font-bold text-foreground text-xs tracking-normal">FocusFlow OS</span>
        </Link>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:text-foreground hover:bg-muted cursor-pointer"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-zinc-700" />}
          </button>

          <button
            onClick={(event) => {
              event.currentTarget.focus();
              commandPaletteReturnFocusRef.current = event.currentTarget;
              openCommandPalette();
            }}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:text-foreground hover:bg-muted cursor-pointer"
            aria-label="Open command palette"
          >
            <Search size={16} />
          </button>
        </div>
      </header>

      {/* Desktop Floating Vertical Glass Navigation Dock */}
      <aside data-testid="desktop-navigation" aria-label="Primary navigation" className="fixed left-3.5 top-1/2 z-50 hidden -translate-y-1/2 flex-col items-center space-y-3 rounded-2xl border border-border bg-card/95 p-2 shadow-xl backdrop-blur-md lg:flex">
        {/* Brand Logo Icon */}
        <Link 
          to="/" 
          onMouseEnter={preloadDashboard}
          className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center shadow-sm hover:scale-105 transition cursor-pointer group relative"
          title="FocusFlow Home Dashboard"
        >
          <img src="/logo.svg" alt="FocusFlow" className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition" />
          <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-popover border border-border text-popover-foreground text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-lg z-50">
            FocusFlow Home
          </span>
        </Link>

        {/* Subtle Divider */}
        <div className="w-5 h-[1px] bg-border my-0.5" />

        {/* Navigation Dock Items */}
        {navigationItems.map((item) => {
          const isActive = isNavigationActive(location.pathname, item.path);
          const Icon = item.icon;

          let handleHover;
          if (item.path === '/') handleHover = preloadDashboard;
          return (
            <Link
              key={item.path}
              to={item.path}
              onMouseEnter={handleHover}
              aria-label={item.name}
              aria-current={isActive ? 'page' : undefined}
              className={`relative w-10 h-10 rounded-xl transition duration-200 flex items-center justify-center cursor-pointer group ${
                isActive 
                  ? 'bg-primary/15 text-primary border border-primary/30 shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon size={19} className={isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'} />
              <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-popover border border-border text-popover-foreground text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-lg z-50">
                {item.name}
              </span>
            </Link>
          );
        })}

        {/* Subtle Divider */}
        <div className="w-5 h-[1px] bg-border my-0.5" />

        {/* Desktop Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="relative w-10 h-10 rounded-xl transition duration-200 flex items-center justify-center cursor-pointer group text-muted-foreground hover:text-foreground hover:bg-muted"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            <Sun size={18} className="text-amber-400 group-hover:rotate-45 transition-transform" />
          ) : (
            <Moon size={18} className="text-zinc-700 group-hover:-rotate-12 transition-transform" />
          )}
          <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-popover border border-border text-popover-foreground text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-lg z-50">
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>
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
        className={`safe-area-drawer fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col justify-between border-r border-border bg-card p-4 backdrop-blur-2xl transition-transform duration-300 lg:hidden ${
          mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6 pt-12">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="FocusFlow" className="w-7 h-7" />
              <span className="font-bold text-foreground text-base">FocusFlow</span>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-border bg-muted/50 text-muted-foreground hover:text-foreground cursor-pointer"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-zinc-700" />}
            </button>
          </div>

          <nav className="space-y-1.5">
            {navigationItems.map((item) => {
              const isActive = isNavigationActive(location.pathname, item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileSidebar}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex min-h-11 items-center gap-3.5 rounded-xl px-4 py-3 text-xs font-semibold transition ${
                    isActive 
                      ? 'bg-primary/15 text-primary border border-primary/25' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-2 pb-4 text-[11px] text-muted-foreground">
          <span>Theme: </span>
          <span className="font-semibold text-foreground capitalize">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
        </div>
      </aside>

      {/* Main Content View Container */}
      <main className={`min-w-0 flex-1 flex flex-col justify-between ${
        location.pathname.includes('/lessons/') 
          ? 'lg:pl-20 xl:pl-22 p-0'
          : 'safe-area-main pt-16 lg:pt-5 lg:pl-20 xl:pl-22 px-3.5 sm:px-6'
      }`}>
        <div className="flex-1 w-full min-w-0 flex flex-col">
          <ErrorBoundary>
            <Suspense fallback={
              <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
              </div>
            }>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div 
                  key={location.pathname} 
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.1, ease: 'easeOut' }}
                  className="flex-1 min-w-0 w-full flex flex-col"
                >
                  <Routes location={location}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/courses/:courseId" element={<CourseDetail />} />
                    <Route path="/courses/:courseId/lessons/:lessonId" element={<Watch />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<Dashboard />} />
                  </Routes>
                </motion.div>
              </AnimatePresence>
            </Suspense>
          </ErrorBoundary>
        </div>

        {/* Compact Single-Tier Studio Footer */}
        {!location.pathname.includes('/lessons/') && (
          <footer className="mt-8 py-5 border-t border-border/60 text-xs text-muted-foreground w-full">
            <div className="max-w-6xl mx-auto px-2 sm:px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Left: Brand Identity */}
              <div className="flex items-center gap-2.5 text-center sm:text-left">
                <img src="/logo.svg" alt="FocusFlow" className="w-4 h-4 flex-shrink-0" />
                <span className="font-bold text-foreground text-xs tracking-tight">FocusFlow OS</span>
                <span className="text-muted-foreground/40">•</span>
                <span className="text-muted-foreground text-xs font-normal">
                  Less noise, more mastery.
                </span>
              </div>

              {/* Right: Local-First Status & Creator Tag */}
              <div className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>100% Local-First & Ad-Free</span>
                </div>
                <span className="text-muted-foreground/40 hidden sm:inline">•</span>
                <div className="text-muted-foreground">
                  Crafted by <span className="text-foreground font-semibold">Sameed Siddiqui</span>
                </div>
              </div>
            </div>
          </footer>
        )}
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
