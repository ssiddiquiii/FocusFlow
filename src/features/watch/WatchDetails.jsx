import React from 'react';

export function WatchDetails({ course, lesson }) {
  return (
    <div className="px-6 py-4 space-y-3 max-w-7xl w-full mx-auto border-b border-border/50">
      <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-normal">{lesson.title}</h1>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <div><span className="text-muted-foreground">Instructor:</span> <span className="text-foreground font-semibold">{course.channelName}</span></div>
        <span className="text-muted-foreground/40">•</span>
        <div><span className="text-muted-foreground">Origin:</span> <span className="text-foreground font-semibold">{course.type === 'youtube' ? 'YouTube Public API' : 'Udemy manual tracking'}</span></div>
      </div>
      {lesson.description && (
        <div className="p-4 rounded-xl bg-card border border-border space-y-2 mt-3">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Video Description</span>
          <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">{lesson.description}</p>
        </div>
      )}
    </div>
  );
}
