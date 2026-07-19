import { create } from 'zustand';

/**
 * Zustand Store for Ephemeral UI State only.
 * Persistent domain data remains strictly in Dexie/IndexedDB.
 */
export const useUIStore = create((set) => ({
  // Active states for the video watch player
  activeLessonId: null,
  isPlaying: false,
  seekRequestTime: null, // Set to a timestamp in seconds to trigger player seek
  
  // Sidebar collapsed state
  sidebarCollapsed: false,
  
  // Importer state
  isImporting: false,
  importError: null,

  // Setters
  setActiveLessonId: (id) => set({ activeLessonId: id }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  triggerPlayerSeek: (seconds) => set({ seekRequestTime: seconds }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setIsImporting: (status) => set({ isImporting: status }),
  setImportError: (err) => set({ importError: err }),
  
  // Reset watch state
  resetPlayerState: () => set({ activeLessonId: null, isPlaying: false, seekRequestTime: null })
}));
