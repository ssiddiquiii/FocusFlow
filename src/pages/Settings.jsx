import React, { useState } from 'react';
import { useFocusFlow } from '../hooks/useFocusFlow';
import { Download, Upload, Trash2, ShieldAlert } from 'lucide-react';

/**
 * Settings & Console Management Component.
 * Implements backup JSON export, schema-validated JSON import,
 * and data wiping actions.
 * @returns {React.JSX.Element}
 */
export default function Settings() {
  const { exportBackup, importBackup, resetDatabase } = useFocusFlow();
  
  const [statusMsg, setStatusMsg] = useState({ text: '', type: 'info' });
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleExport = async () => {
    setStatusMsg({ text: 'Generating backup file...', type: 'info' });
    try {
      const backupData = await exportBackup();
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `focusflow-backup-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setStatusMsg({ text: 'Backup downloaded successfully.', type: 'success' });
    } catch (err) {
      console.error(err);
      setStatusMsg({ text: `Failed to export backup: ${err.message}`, type: 'error' });
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatusMsg({ text: 'Reading backup file...', type: 'info' });
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const rawJson = JSON.parse(event.target.result);
        setStatusMsg({ text: 'Validating backup structure...', type: 'info' });
        
        await importBackup(rawJson);
        setStatusMsg({ text: 'Backup restored successfully! Refreshing dashboard data.', type: 'success' });
      } catch (err) {
        console.error(err);
        setStatusMsg({ text: `Failed to import backup: ${err.message}`, type: 'error' });
      }
    };

    reader.onerror = () => {
      setStatusMsg({ text: 'Error reading file from disk.', type: 'error' });
    };

    reader.readAsText(file);
    // Reset file input value so same file can be imported again if needed
    e.target.value = '';
  };

  const handleReset = async () => {
    try {
      setStatusMsg({ text: 'Clearing database...', type: 'info' });
      await resetDatabase();
      setStatusMsg({ text: 'Database reset to default seeded courses successfully.', type: 'success' });
      setShowConfirmReset(false);
    } catch (err) {
      console.error(err);
      setStatusMsg({ text: `Reset failed: ${err.message}`, type: 'error' });
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Settings</h1>
        <p className="text-zinc-400 text-sm mt-1">Manage your local database backups and system options.</p>
      </div>

      {/* Status Notifications banner */}
      {statusMsg.text && (
        <div className={`p-4 rounded-xl text-xs font-semibold border ${
          statusMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
          statusMsg.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
          'bg-zinc-800 text-zinc-300 border-zinc-700/50'
        }`}>
          {statusMsg.text}
        </div>
      )}

      {/* Backup and Restore Area */}
      <div className="glass-panel rounded-2xl p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white mb-1">Local Data Backups</h2>
          <p className="text-zinc-500 text-xs leading-relaxed">
            FocusFlow is a local-first application. Your watch progress and notes are stored entirely in your browser.
            We recommend exporting periodic backups to keep your data secure.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Export button */}
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-3 px-5 py-4 bg-zinc-900 border border-border hover:bg-zinc-800 transition rounded-xl font-bold text-white text-sm"
          >
            <Download size={18} />
            <span>Export Backup JSON</span>
          </button>

          {/* Import button wrapper */}
          <label className="flex items-center justify-center gap-3 px-5 py-4 bg-zinc-900 border border-border hover:bg-zinc-800 transition rounded-xl font-bold text-white text-sm cursor-pointer">
            <Upload size={18} />
            <span>Import Backup JSON</span>
            <input 
              type="file" 
              accept=".json" 
              onChange={handleImport} 
              className="hidden" 
            />
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-panel rounded-2xl p-6 border-red-500/20 bg-red-500/[0.01] space-y-6">
        <div>
          <h2 className="text-lg font-bold text-red-500 mb-1">Danger Zone</h2>
          <p className="text-zinc-500 text-xs leading-relaxed">
            Wiping the database will delete all progress, checkmarks, custom imported courses, and timestamped notes forever.
            This action cannot be undone.
          </p>
        </div>

        {!showConfirmReset ? (
          <button
            onClick={() => setShowConfirmReset(true)}
            className="px-5 py-3 rounded-lg bg-red-950/20 border border-red-500/30 text-red-400 hover:bg-red-950/50 hover:text-red-300 transition text-sm font-semibold flex items-center gap-2"
          >
            <Trash2 size={16} />
            <span>Reset Database to Default</span>
          </button>
        ) : (
          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 space-y-4">
            <div className="flex items-start gap-3 text-red-400 text-xs">
              <ShieldAlert size={18} className="flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-1">Confirm Reset Request</span>
                <span>Are you sure you want to proceed? All your custom notes and progress checkmarks will be permanently cleared.</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-xs font-bold rounded bg-red-600 hover:bg-red-700 text-white transition"
              >
                Yes, Clear Everything
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 text-xs font-bold rounded bg-zinc-800 border border-border text-white hover:bg-zinc-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}