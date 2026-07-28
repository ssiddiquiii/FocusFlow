import React from 'react';
import { Search } from 'lucide-react';
import { useFocusFlow } from '../hooks/useFocusFlow';
import { useUIStore } from '../hooks/useUIStore';
import PracticeTab from '../components/PracticeTab';
import { JsLogo, GitLogo } from '../components/BrandLogos';
import { togglePractice } from '../services/dataCommands';

/**
 * Dedicated Global Practice Hub Page (`/practice`).
 * Allows learners to browse and solve all JS & Git interview & practice questions
 * across dedicated course catalogs.
 */
export default function PracticeHub() {
  const { practiceProgressList } = useFocusFlow();
  const { openCommandPalette } = useUIStore();

  return (
    <div className="p-3.5 sm:p-8 max-w-5xl mx-auto space-y-4 sm:space-y-6 min-w-0 w-full overflow-hidden">
      {/* Header Banner */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 via-accent/5 to-zinc-950 space-y-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl">🎯</span>
          <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">Practice Hub — Dedicated Course Catalogs</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
          <span className="flex items-center gap-1.5 font-bold text-yellow-300">
            <JsLogo size={16} /> JavaScript Mastery (100 Qs)
          </span>
          <span className="text-zinc-600 hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5 font-bold text-orange-300">
            <GitLogo size={16} /> Git & GitHub Mastery (40 Qs)
          </span>
        </div>

        {/* Wide Search Bar Trigger */}
        <div 
          onClick={openCommandPalette}
          className="w-full bg-zinc-900/90 border border-zinc-800 hover:border-primary/50 transition p-3 rounded-xl flex items-center justify-between cursor-pointer shadow-md group"
        >
          <div className="flex items-center gap-2.5">
            <Search size={16} className="text-zinc-400 group-hover:text-primary transition" />
            <span className="text-xs sm:text-sm font-medium text-zinc-400 group-hover:text-white transition">Filter & Search 140+ JavaScript & Git Interview Questions...</span>
          </div>
          <kbd className="hidden sm:inline-flex px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-400 font-bold">Ctrl + K</kbd>
        </div>
      </div>

      {/* Main Practice Component */}
      <div className="glass-panel rounded-2xl p-3.5 sm:p-6 border border-border min-w-0 w-full relative">
        <PracticeTab
          courseId="global"
          lessonId="yY0bKZNYmJs"
          practiceProgressList={practiceProgressList}
          togglePractice={togglePractice}
        />
      </div>
    </div>
  );
}
