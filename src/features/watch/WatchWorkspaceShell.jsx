import React from 'react';

export function WatchWorkspaceShell({ main, sidebar }) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen h-auto lg:h-screen overflow-y-auto lg:overflow-hidden bg-background">
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto bg-zinc-950/20 pb-4 sm:pb-6">{main}</div>
      {sidebar}
    </div>
  );
}
