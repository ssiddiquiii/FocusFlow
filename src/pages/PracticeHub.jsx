import React from 'react';
import { useFocusFlow } from '../hooks/useFocusFlow';
import PracticeTab from '../components/PracticeTab';
import { JsLogo, GitLogo } from '../components/BrandLogos';

/**
 * Dedicated Global Practice Hub Page (`/practice`).
 * Allows learners to browse and solve all JS & Git interview & practice questions
 * across dedicated course catalogs.
 */
export default function PracticeHub() {
  const { practiceProgressList, togglePractice } = useFocusFlow();

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 via-accent/5 to-zinc-950 space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🎯</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Practice Hub — Dedicated Course Catalogs</h1>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
          <span className="flex items-center gap-1.5 font-bold text-yellow-300">
            <JsLogo size={16} /> JavaScript Mastery (100 Qs)
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center gap-1.5 font-bold text-orange-300">
            <GitLogo size={16} /> Git & GitHub Mastery (40 Qs)
          </span>
        </div>
      </div>

      {/* Main Practice Component */}
      <div className="glass-panel rounded-2xl p-6 border border-border">
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
