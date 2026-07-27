import React from 'react';
import { ExternalLink, CheckCircle2, Circle } from 'lucide-react';
import jsPracticeMap from '../data/jsPracticeMap.json';

/**
 * Platform brand colors and labels for visual distinction.
 */
const PLATFORM_CONFIG = {
  'freecodecamp': { label: 'freeCodeCamp', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  'javascript.info': { label: 'JavaScript.info', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  'leetcode': { label: 'LeetCode', color: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  'codewars': { label: 'Codewars', color: 'bg-red-500/15 text-red-400 border-red-500/30' },
  'exercism': { label: 'Exercism', color: 'bg-violet-500/15 text-violet-400 border-violet-500/30' },
  'w3schools': { label: 'W3Schools', color: 'bg-green-500/15 text-green-400 border-green-500/30' },
  'mdn': { label: 'MDN Docs', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  'other': { label: 'Resource', color: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30' }
};

const DIFFICULTY_BADGE = {
  'easy': { label: 'Easy', color: 'text-emerald-400' },
  'medium': { label: 'Medium', color: 'text-amber-400' },
  'hard': { label: 'Challenge', color: 'text-red-400' }
};

/**
 * PracticeTab Component.
 * Renders topic-specific coding challenges for a given lesson,
 * with completion checkboxes and external platform links.
 *
 * @param {object} props
 * @param {string} props.courseId — Current course ID.
 * @param {string} props.lessonId — Current lesson (video) ID.
 * @param {Array} props.practiceProgressList — Reactive Dexie practiceProgress records.
 * @param {Function} props.togglePractice — Toggle practice completion function.
 * @returns {React.JSX.Element}
 */
export default function PracticeTab({ courseId, lessonId, practiceProgressList, togglePractice }) {
  const practiceData = jsPracticeMap[lessonId];

  if (!practiceData) {
    return (
      <div className="py-8 text-center space-y-3">
        <span className="text-zinc-600 text-4xl block">🎯</span>
        <p className="text-sm text-zinc-500">No practice challenges mapped for this lesson yet.</p>
        <p className="text-xs text-zinc-600">Practice links are curated per concept. Check back later!</p>
      </div>
    );
  }

  const { conceptLabel, practices } = practiceData;
  const completedCount = practices.filter((_, i) =>
    practiceProgressList.some(p => p.id === `${lessonId}_${i}` && p.completed)
  ).length;

  return (
    <div className="space-y-5">
      {/* Concept Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg">🎯</span>
          <div>
            <h3 className="text-sm font-bold text-white">Practice: {conceptLabel}</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Complete challenges to solidify this concept</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${completedCount === practices.length ? 'text-emerald-400' : 'text-zinc-400'}`}>
            {completedCount}/{practices.length}
          </span>
          {/* Mini progress ring */}
          <div className="w-8 h-8 relative">
            <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="3" className="text-zinc-800" />
              <circle
                cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="3"
                className={completedCount === practices.length ? 'text-emerald-400' : 'text-primary'}
                strokeDasharray={`${(completedCount / practices.length) * 81.68} 81.68`}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Practice Cards */}
      <div className="space-y-3">
        {practices.map((practice, index) => {
          const isCompleted = practiceProgressList.some(
            p => p.id === `${lessonId}_${index}` && p.completed
          );
          const platformConf = PLATFORM_CONFIG[practice.platform] || PLATFORM_CONFIG['other'];
          const diffConf = DIFFICULTY_BADGE[practice.difficulty] || DIFFICULTY_BADGE['easy'];

          return (
            <div
              key={index}
              className={`group glass-panel rounded-xl p-4 border transition duration-200 ${
                isCompleted
                  ? 'border-emerald-500/20 bg-emerald-500/5'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Completion Toggle */}
                <button
                  onClick={() => togglePractice(courseId, lessonId, index, practice.url, !isCompleted)}
                  className="mt-0.5 flex-shrink-0 cursor-pointer transition hover:scale-110"
                  title={isCompleted ? 'Mark as incomplete' : 'Mark as done'}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={20} className="text-emerald-400" fill="currentColor" />
                  ) : (
                    <Circle size={20} className="text-zinc-700 group-hover:text-zinc-500" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`text-sm font-semibold leading-snug ${isCompleted ? 'text-zinc-400 line-through' : 'text-white'}`}>
                      {practice.title}
                    </h4>
                    <a
                      href={practice.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 p-1.5 rounded-lg text-zinc-500 hover:text-primary hover:bg-primary/10 transition"
                      title="Open in new tab"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>

                  {/* Badges Row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border ${platformConf.color}`}>
                      {platformConf.label}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${diffConf.color}`}>
                      {diffConf.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Message */}
      {completedCount === practices.length && practices.length > 0 && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
          <span className="text-emerald-400 text-sm font-bold">🎉 All practices completed! You've mastered this concept.</span>
        </div>
      )}
    </div>
  );
}
