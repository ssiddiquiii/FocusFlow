import { useSyncExternalStore } from 'react';

const DESKTOP_WORKSPACE_QUERY = '(min-width: 1280px)';

export function useDesktopWatchWorkspace() {
  return useSyncExternalStore(
    callback => {
      const media = window.matchMedia(DESKTOP_WORKSPACE_QUERY);
      media.addEventListener('change', callback);
      return () => media.removeEventListener('change', callback);
    },
    () => window.matchMedia(DESKTOP_WORKSPACE_QUERY).matches,
    () => false
  );
}
