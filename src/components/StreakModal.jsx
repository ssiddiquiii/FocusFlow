import React, { useState } from 'react';
import { Flame, Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { buildMonthlyActivityCalendar } from '../utils/streakUtils';
import Dialog from './ui/Dialog';

/**
 * Compact Fixed-Size Real-Time Streak & Monthly Activity Calendar Modal
 * Day cells are smaller (h-8), layout is fixed and shrink-wrapped so month navigation
 * Previous and next controls maintain a perfectly centered, stable modal dialog.
 * Theme-aware for Light and Dark modes.
 */
export default function StreakModal({ isOpen, onClose, stats, streakCount, activeDates }) {
  const [viewDate, setViewDate] = useState(new Date());

  if (!isOpen) return null;

  const currentYear = viewDate.getFullYear();
  const currentMonthIndex = viewDate.getMonth();
  const calendar = buildMonthlyActivityCalendar(activeDates, viewDate);

  // Month navigation handlers
  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonthIndex - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonthIndex + 1, 1));
  };

  const weekHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      titleId="streak-dialog-title"
      className="relative max-h-[calc(100dvh-2rem)] w-full max-w-sm space-y-4 overflow-y-auto rounded-2xl border border-border bg-card p-4 shadow-2xl sm:max-w-md sm:p-5"
    >
      {/* Modal Top Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center flex-shrink-0">
            <Flame size={18} className="fill-primary animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 id="streak-dialog-title" className="text-sm sm:text-base font-bold text-foreground tracking-normal">Streak Calendar</h3>
              <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[9px] font-bold uppercase tracking-wider border border-primary/25">
                {streakCount} {streakCount === 1 ? 'Day' : 'Days'}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">Watch at least 10 minutes daily to maintain your streak.</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          aria-label="Close streak calendar"
          className="min-h-11 min-w-11 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer flex items-center justify-center"
        >
          <X size={16} />
        </button>
      </div>

      {/* Real-Time Month & Year Navigation Control */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between bg-muted/50 p-2 rounded-xl border border-border">
          <button
            onClick={handlePrevMonth}
            className="min-h-11 min-w-11 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground transition cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
            title="Previous Month"
          >
            <ChevronLeft size={14} />
            <span>Prev</span>
          </button>

          <div className="flex items-center gap-1.5 text-foreground font-semibold text-xs sm:text-sm tracking-normal">
            <Calendar size={14} className="text-primary" />
            <span>{calendar.label}</span>
          </div>

          <button
            onClick={handleNextMonth}
            className="min-h-11 min-w-11 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground transition cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
            title="Next Month"
          >
            <span>Next</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Compact Monthly Grid (7 Columns: Sun - Sat) */}
        <div className="p-2.5 rounded-xl bg-muted/30 border border-border space-y-1.5 min-h-[200px] flex flex-col justify-start">
          {/* Day Name Columns */}
          <div className="grid grid-cols-7 gap-1 text-center border-b border-border pb-1.5">
            {weekHeaders.map((dayName, idx) => (
              <span key={idx} className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                {dayName}
              </span>
            ))}
          </div>

          {/* Compact Monthly Calendar Days (1 to 30 / 31 Grid) */}
          <div className="grid grid-cols-7 gap-1 pt-0.5">
            {/* Empty Offset Cells before Day 1 */}
            {Array.from({ length: calendar.leadingEmptyDays }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-7 rounded-lg bg-transparent" />
            ))}

            {/* Days of the Month (1 to 30/31) */}
            {calendar.days.map(({ day: dayNum, isToday, isActive }) => {
              return (
                <div
                  key={dayNum}
                  className={`h-7 sm:h-8 rounded-lg border flex flex-col items-center justify-center transition text-center cursor-default ${
                    isActive 
                      ? 'bg-primary/20 border-primary/40 text-primary font-bold shadow-sm' 
                      : 'bg-card border-border text-muted-foreground'
                  } ${isToday ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}`}
                  title={`${calendar.label} ${dayNum}: ${isActive ? 'Active learning recorded' : 'No activity recorded'}`}
                >
                  <span className="text-[11px] font-medium block leading-none">{dayNum}</span>
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-primary mt-0.5 shadow-sm" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Learning Stats Footer */}
      <div className="grid grid-cols-2 gap-2.5 pt-0.5">
        <div className="p-3 rounded-xl bg-muted/40 border border-border">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Watch Time</span>
          <span className="text-xs sm:text-sm font-bold text-foreground block mt-0.5">{stats.totalHours} Hours</span>
        </div>

        <div className="p-3 rounded-xl bg-muted/40 border border-border">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Total Courses</span>
          <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">{stats.totalCourses ?? 0} Enrolled</span>
        </div>
      </div>
    </Dialog>
  );
}
