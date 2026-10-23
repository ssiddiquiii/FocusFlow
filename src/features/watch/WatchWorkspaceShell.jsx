import React from 'react';

export function WatchWorkspaceShell({ main, sidebar }) {
  return (
    <div data-testid="watch-shell" className="flex min-h-dvh flex-col bg-background xl:h-dvh xl:flex-row xl:overflow-hidden">
      <main data-testid="watch-main" className="flex min-w-0 flex-1 flex-col bg-background pb-12 xl:pb-6 xl:h-full xl:overflow-y-auto">
        {main}
      </main>
      {sidebar}
    </div>
  );
}
