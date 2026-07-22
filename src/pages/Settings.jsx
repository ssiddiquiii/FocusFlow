import React, { useState } from 'react';
import { useFocusFlow } from '../hooks/useFocusFlow';
import { Download, Upload, Trash2, ShieldAlert, RotateCcw } from 'lucide-react';

/**
 * Settings & Console Management Component.
 * Implements backup JSON export, schema-validated JSON import,
 * and data wiping actions.
 * @returns {React.JSX.Element}
 */
export default function Settings() {
  const { exportBackup, importBackup, resetDatabase, clearProgressAndNotes } = useFocusFlow();
  
  const [statusMsg, setStatusMsg] = useState({ text: '', type: 'info' });
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [resetType, setResetType] = useState('progress'); // 'progress' | 'full'

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
            Manage or reset your stored learning data. You can choose to clear your watch progress while keeping all your course catalogs intact, or perform a full factory reset.
          </p>
        </div>

        {!showConfirmReset ? (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => { setResetType('progress'); setShowConfirmReset(true); }}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 transition text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw size={15} />
              <span>Clear Watch Progress & Notes Only (Keep Courses)</span>
            </button>

            <button
              onClick={() => { setResetType('full'); setShowConfirmReset(true); }}
              className="px-4 py-2.5 rounded-xl bg-red-950/30 border border-red-500/30 text-red-400 hover:bg-red-950/60 hover:text-red-300 transition text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <Trash2 size={15} />
              <span>Factory Reset (Wipe Everything)</span>
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 space-y-4">
            <div className="flex items-start gap-3 text-red-400 text-xs">
              <ShieldAlert size={18} className="flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-1">
                  {resetType === 'progress' ? 'Confirm Reset Progress & Notes' : 'Confirm Full Factory Reset'}
                </span>
                <span>
                  {resetType === 'progress' 
                    ? 'Are you sure? All your completed checkmarks, watch progress, and notes will be cleared, but your imported courses will remain in your catalog.'
                    : 'Are you sure? This will delete ALL progress, notes, and ALL custom imported courses forever, restoring only initial default seed courses.'}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleExecuteReset}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-red-600 hover:bg-red-700 text-white transition cursor-pointer"
              >
                {resetType === 'progress' ? 'Yes, Reset Progress Only' : 'Yes, Wipe Everything'}
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-zinc-800 border border-border text-white hover:bg-zinc-700 transition cursor-pointer"
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