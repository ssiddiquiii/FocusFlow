/**
 * FocusFlow Real-Time Dynamic Streak Calculator
 * Calculates active consecutive daily streak based strictly on Dexie IndexedDB records:
 * 1. Video watched >= 10 mins (600s) or marked completed.
 * 2. Practice question marked solved (completed: true).
 */
export function calculateStreak(progressList = [], practiceProgressList = []) {
  const activeDateSet = new Set();

  // Rule 1: Video watched >= 10 mins (600s) or completed
  progressList.forEach(p => {
    const watchTimeSecs = p.watchTime || p.currentTime || 0;
    const isWatchedTenMins = watchTimeSecs >= 600 || p.completed === true;
    if (isWatchedTenMins && (p.lastWatched || p.updatedAt)) {
      const d = new Date(p.lastWatched || p.updatedAt);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      activeDateSet.add(dateStr);
    }
  });

  // Rule 2: Practice question solved
  practiceProgressList.forEach(p => {
    if (p.completed && (p.completedAt || p.updatedAt)) {
      const d = new Date(p.completedAt || p.updatedAt);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      activeDateSet.add(dateStr);
    }
  });

  let streakCount = 0;
  let checkDate = new Date();
  
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

  return streakCount;
}
