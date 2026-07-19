import React from 'react';

/**
 * Settings view component.
 * Controls backups, JSON imports, and configurations.
 * @returns {React.JSX.Element} The settings panel.
 */
export default function Settings() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold mb-6">Settings</h1>
      <p className="text-zinc-400">Export backups, restore data, or change your API key.</p>
    </div>
  );
}