import React from 'react';

/**
 * Dashboard View component.
 * Displays the list of imported courses.
 * @returns {React.JSX.Element} The rendered dashboard.
 */
export default function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold mb-6">My Courses</h1>
      <p className="text-zinc-400">Welcome to FocusFlow. Your playlists will appear here.</p>
    </div>
  );
}