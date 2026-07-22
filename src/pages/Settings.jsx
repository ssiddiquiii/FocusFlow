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

  const handleExecuteReset = async () => {
    try {
      await clearProgressAndNotes();
      setStatusMsg({ text: 'Watch progress and timestamped notes cleared successfully. All course catalogs remain intact.', type: 'success' });
      setShowConfirmReset(false);
    } catch (err) {
      console.error(err);
      setStatusMsg({ text: `Reset failed: ${err.message}`, type: 'error' });
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10 animate-page-entry">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Settings & Management</h1>
        <p className="text-zinc-400 text-xs mt-1">Manage local database backups and learning data progress.</p>
      </div>

      {statusMsg.text && (
        <div className={`p-4 rounded-xl text-xs font-semibold border ${
          statusMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
          statusMsg.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
          'bg-zinc-900 text-zinc-300 border-border'
        }`}>
          {statusMsg.text}
        </div>
      )}

      {/* Local Data Backups */}
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
            className="flex items-center justify-center gap-3 px-5 py-4 bg-zinc-900 border border-border hover:bg-zinc-800 transition rounded-xl font-bold text-white text-sm cursor-pointer"
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

      {/* Progress Data Management */}
      <div className="glass-panel rounded-2xl p-6 border-zinc-800 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white mb-1">Progress & Notes Reset</h2>
          <p className="text-zinc-500 text-xs leading-relaxed">
            Reset your watch times, checkmarks, and notes to zero. Your course catalogs (both default and imported playlists) will stay safe and untouched. To delete a specific course, use the Delete button on its card in the Dashboard.
          </p>
        </div>

        {!showConfirmReset ? (
          <button
            onClick={() => setShowConfirmReset(true)}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 transition text-xs font-bold flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw size={15} />
            <span>Clear Watch Progress & Notes</span>
          </button>
        ) : (
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-4">
            <div className="flex items-start gap-3 text-amber-400 text-xs">
              <ShieldAlert size={18} className="flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-1">Confirm Reset Progress & Notes</span>
                <span>Are you sure? All completed checkmarks, watch progress, and notes will be cleared. All course catalogs will remain untouched.</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleExecuteReset}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition cursor-pointer"
              >
                Yes, Clear Progress & Notes
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