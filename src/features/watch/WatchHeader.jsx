import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function WatchHeader({ courseId, courseTitle, lessonTitle }) {
  return (
    <div className="flex items-center gap-3 px-3 sm:px-6 py-2.5 sm:py-3.5 bg-zinc-950/95 border-b border-border sticky top-0 z-30 backdrop-blur-xl">
      <Link to={`/courses/${courseId}`} className="text-zinc-400 hover:text-white transition p-1 rounded-lg hover:bg-zinc-900 flex-shrink-0" title="Back to Course Detail">
        <ArrowLeft size={18} />
      </Link>
      <div className="min-w-0">
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold truncate">{courseTitle}</span>
        <h2 className="text-xs sm:text-sm font-semibold text-white truncate">{lessonTitle}</h2>
      </div>
    </div>
  );
}
