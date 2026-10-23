import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function WatchHeader({ courseId, courseTitle, lessonTitle }) {
  return (
    <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-zinc-950/95 px-[max(.5rem,env(safe-area-inset-left))] py-1.5 backdrop-blur-xl sm:gap-3 sm:px-6 sm:py-2.5">
      <Link to={`/courses/${courseId}`} aria-label="Back to Course Detail" className="flex min-h-11 min-w-11 flex-shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" title="Back to Course Detail">
        <ArrowLeft size={18} />
      </Link>
      <div className="min-w-0">
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold truncate">{courseTitle}</span>
        <h2 className="text-xs sm:text-sm font-semibold text-white truncate">{lessonTitle}</h2>
      </div>
    </div>
  );
}
