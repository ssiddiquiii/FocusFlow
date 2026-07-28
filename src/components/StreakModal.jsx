import React, { useState } from 'react';
import { Flame, Calendar, ChevronLeft, ChevronRight, X, CheckCircle2 } from 'lucide-react';

/**
 * Compact Fixed-Size Real-Time Streak & Monthly Activity Calendar Modal
 * Day cells are smaller (h-8), layout is fixed and shrink-wrapped so month navigation
 * (‹ Prev | Next ›) maintains a perfectly centered, stable modal dialog.
 */
export default function StreakModal({ isOpen, onClose, stats, progressList = [], practiceProgressList = [] }) {
  const [viewDate, setViewDate] = useState(new Date());

  if (!isOpen) return null;

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const currentYear = viewDate.getFullYear();
  const currentMonthIndex = viewDate.getMonth();
  
  // Format Month Name and Year (e.g., "July 2026", "August 2026")
  const monthYearLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Calculate days in selected month
  const firstDayOfWeek = new Date(currentYear, currentMonthIndex, 1).getDay(); // 0 = Sun, 1 = Mon, etc.
  const totalDaysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate(); // 28, 30, 31

  // Set of active study dates from IndexedDB
  const activeDateSet = new Set();
  
  // Rule 1: Add progressList activity if completed OR watchTime >= 10 mins (600s)
  progressList.forEach(p => {
    const isWatchedTenMins = (p.currentTime && p.currentTime >= 600) || p.completed === true;
    if (isWatchedTenMins && (p.lastWatched || p.updatedAt)) {
      const d = new Date(p.lastWatched || p.updatedAt);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      activeDateSet.add(dateStr);
    }
  });

  // Rule 2: Add practiceProgressList activity if completed === true
  practiceProgressList.forEach(p => {
    if (p.completed && (p.completedAt || p.updatedAt)) {
      const d = new Date(p.completedAt || p.updatedAt);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      activeDateSet.add(dateStr);
    }
  });

  // Calculate real consecutive streak ending today or yesterday
  let streakCount = 0;
  let checkDate = new Date(today);
  
  while (true) {
    const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    if (activeDateSet.has(dateStr)) {
      streakCount++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (streakCount === 0) {
      // Check if yesterday was active
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      if (activeDateSet.has(yesterdayStr)) {
        streakCount++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    } else {
      break;
    }
  }

  // Month navigation handlers
  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonthIndex - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonthIndex + 1, 1));
  };

  const weekHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div 
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-sm sm:max-w-md shadow-2xl overflow-hidden space-y-4 p-4 sm:p-5 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center flex-shrink-0">
              <Flame size={18} className="fill-orange-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">Streak Calendar</h3>
                <span className="px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[9px] font-black uppercase tracking-wider border border-orange-500/30">
                  🔥 {streakCount} {streakCount === 1 ? 'Day' : 'Days'}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">Watch ≥ 10 mins or solve 1 Q daily to grow streak!</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Real-Time Month & Year Navigation Control */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between bg-zinc-900/80 p-2 rounded-xl border border-zinc-800">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition cursor-pointer flex items-center gap-1 text-[11px] font-bold"
              title="Previous Month"
            >
              <ChevronLeft size={14} />
              <span>Prev</span>
            </button>

            <div className="flex items-center gap-1.5 text-white font-extrabold text-xs sm:text-sm tracking-tight">
              <Calendar size={14} className="text-primary" />
              <span>{monthYearLabel}</span>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition cursor-pointer flex items-center gap-1 text-[11px] font-bold"
              title="Next Month"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Compact Monthly Grid (7 Columns: Sun - Sat) */}
          <div className="p-2.5 rounded-xl bg-zinc-900/50 border border-border/60 space-y-1.5 min-h-[200px] flex flex-col justify-start">
            {/* Day Name Columns */}
            <div className="grid grid-cols-7 gap-1 text-center border-b border-border/40 pb-1.5">
              {weekHeaders.map((dayName, idx) => (
                <span key={idx} className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                  {dayName}
                </span>
              ))}
            </div>

            {/* Compact Monthly Calendar Days (1 to 30 / 31 Grid) */}
            <div className="grid grid-cols-7 gap-1 pt-0.5">
              {/* Empty Offset Cells before Day 1 */}
              {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-7 rounded-lg bg-transparent" />
              ))}

              {/* Days of the Month (1 to 30/31) */}
              {Array.from({ length: totalDaysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const cellDateStr = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                
                const isToday = cellDateStr === todayStr;
                const isActive = activeDateSet.has(cellDateStr);

                return (
                  <div
                    key={dayNum}
                    className={`h-7 sm:h-8 rounded-lg border flex flex-col items-center justify-center transition text-center cursor-default ${
                      isActive 
                        ? 'bg-orange-500/20 border-orange-500/40 text-orange-300 font-extrabold shadow-sm' 
                        : 'bg-zinc-950/70 border-zinc-800/80 text-zinc-500'
                    } ${isToday ? 'ring-2 ring-primary ring-offset-1 ring-offset-zinc-950' : ''}`}
                    title={`${monthYearLabel} ${dayNum}: ${isActive ? 'Active Learning Session Completed 🔥' : 'No activity recorded'}`}
                  >
                    <span className="text-[11px] font-bold block leading-none">{dayNum}</span>
                    {isActive && (
                      <span className="w-1 h-1 rounded-full bg-orange-400 mt-0.5 shadow-sm shadow-orange-400" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Learning Stats Footer */}
        <div className="grid grid-cols-2 gap-2.5 pt-0.5">
          <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Watch Time</span>
            <span className="text-xs sm:text-sm font-extrabold text-white block mt-0.5">{stats.totalHours} Hours</span>
          </div>

          <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Practices Solved</span>
            <span className="text-xs sm:text-sm font-extrabold text-emerald-400 block mt-0.5">{practiceProgressList.filter(p => p.completed).length} Solved</span>
          </div>
        </div>
      </div>
    </div>
  );
}
