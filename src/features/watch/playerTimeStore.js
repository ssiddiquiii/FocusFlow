import { useSyncExternalStore } from 'react';

const INITIAL_SNAPSHOT = Object.freeze({ currentTime: 0, duration: 0 });

export function createPlayerTimeStore() {
  let snapshot = INITIAL_SNAPSHOT;
  const listeners = new Set();

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    set(currentTime, duration = snapshot.duration) {
      const nextCurrentTime = Number.isFinite(currentTime) ? Math.max(0, currentTime) : 0;
      const nextDuration = Number.isFinite(duration) ? Math.max(0, duration) : 0;
      if (snapshot.currentTime === nextCurrentTime && snapshot.duration === nextDuration) return;
      snapshot = { currentTime: nextCurrentTime, duration: nextDuration };
      listeners.forEach(listener => listener());
    },
    reset() {
      if (snapshot === INITIAL_SNAPSHOT) return;
      snapshot = INITIAL_SNAPSHOT;
      listeners.forEach(listener => listener());
    }
  };
}

export function usePlayerTime(timeStore) {
  return useSyncExternalStore(timeStore.subscribe, timeStore.getSnapshot, timeStore.getSnapshot);
}
