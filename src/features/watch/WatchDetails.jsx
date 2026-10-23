import React from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Circle } from 'lucide-react';

export function WatchDetails({
  course,
  lesson,
  currentIndex = 0,
  totalLessons = 1,
  isCompleted = false,
  onToggleComplete,
  prevLessonId,
  nextLessonId,
  onNavigate
}) {
  return (
    <div className="px-3 sm:px-6 py-3 max-w-7xl w-full mx-auto border-b border-border/50">
      {/* Title */}
      <h1 className="text-base sm:text-lg md:text-xl font-bold text-foreground tracking-tight leading-snug">
        {lesson.title}
      </h1>

      {/* Meta & Quick Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs text-muted-foreground pt-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-foreground truncate max-w-[180px] sm:max-w-xs">{course.channelName || 'YouTube Creator'}</span>
          <span className="text-muted-foreground/40">•</span>
          <span className="font-mono text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-medium flex-shrink-0">
            Lecture {currentIndex + 1} of {totalLessons}
          </span>
        </div>

        {/* Quick Progress & Navigation Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {onToggleComplete && (
            <button
              type="button"
              onClick={onToggleComplete}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-muted hover:bg-muted/80 text-foreground border border-border'
              }`}
            >
              {isCompleted ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Circle size={14} className="text-muted-foreground" />}
              <span>{isCompleted ? 'Completed' : 'Mark Done'}</span>
            </button>
          )}

          {prevLessonId && (
            <button
              type="button"
              onClick={() => onNavigate(prevLessonId)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground border border-border text-xs font-medium transition cursor-pointer"
              title="Previous Lecture"
            >
              <ChevronLeft size={14} />
              <span className="hidden sm:inline">Prev</span>
            </button>
          )}

          {nextLessonId && (
            <button
              type="button"
              onClick={() => onNavigate(nextLessonId)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-sm transition cursor-pointer"
              title="Next Lecture"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
