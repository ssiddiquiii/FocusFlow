import React from 'react';

export function WatchDetails({ course, lesson }) {
  return (
    <div className="px-6 py-4 space-y-3 max-w-7xl w-full mx-auto border-b border-border/50">
      <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{lesson.title}</h1>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
        <div><span className="text-zinc-600">Instructor:</span> <span className="text-zinc-300 font-semibold">{course.channelName}</span></div>
        <span className="text-zinc-700">•</span>
        <div><span className="text-zinc-600">Origin:</span> <span className="text-zinc-300 font-semibold">{course.type === 'youtube' ? 'YouTube Public API' : 'Udemy manual tracking'}</span></div>
      </div>
      {lesson.description && (
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2 mt-3">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Video Description</span>
          <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">{lesson.description}</p>
        </div>
      )}
    </div>
  );
}
