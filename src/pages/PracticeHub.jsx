import React from 'react';
import { useFocusFlow } from '../hooks/useFocusFlow';
import PracticeTab from '../components/PracticeTab';

/**
 * Dedicated Global Practice Hub Page (`/practice`).
 * Allows learners to browse and solve all 80 JS interview & practice questions
 * across 10 topic modules.
 */
export default function PracticeHub() {
  const { practiceProgressList, togglePractice } = useFocusFlow();

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 via-accent/5 to-zinc-950 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Practice Hub — Dedicated Course Catalogs</h1>
        </div>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
          Select between <strong className="text-amber-400">🟨 JavaScript Mastery (100 Qs)</strong> and <strong className="text-orange-400">🐙 Git & GitHub Mastery (40 Qs)</strong> catalogs.
          Each module includes interactive checkboxes, difficulty ratings, and expandable code solutions.
        </p>
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
