import React from 'react';

/**
 * Offline Fallback View.
 * Renders when network connection is missing.
 * @returns {React.JSX.Element}
 */
export default function Offline() {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[50vh]">
      <h1 className="text-3xl font-semibold mb-4 text-accent">You are Offline</h1>
      <p className="text-zinc-400 text-center max-w-md">
        FocusFlow can display cached course layouts, but playing YouTube videos requires an active network connection.
      </p>
    </div>
  );
}