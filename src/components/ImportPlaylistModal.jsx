import React, { useState } from 'react';
import { Plus, Loader2, CheckCircle2, AlertCircle, Link2, X } from 'lucide-react';
import { extractPlaylistId, fetchYouTubePlaylistData } from '../services/youtubeApi';
import { importCourse } from '../services/dataCommands';
import Dialog from './ui/Dialog';

export default function ImportPlaylistModal({ isOpen, onClose }) {
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const playlistId = extractPlaylistId(urlInput);
    if (!playlistId) {
      setErrorMsg('Invalid YouTube Playlist URL or ID. Please check the link and try again.');
      return;
    }

    setLoading(true);

    try {
      // Fetch playlist & lessons from YouTube Data API
      const { course, lessons } = await fetchYouTubePlaylistData(playlistId);

      // Save into Dexie.js (IndexedDB)
      await importCourse(course, lessons);

      setSuccessMsg(`Successfully imported "${course.title}" with ${lessons.length} lectures!`);
      setUrlInput('');
      
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to import playlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      titleId="import-playlist-title"
      closeOnBackdrop={!loading}
      closeOnEscape={!loading}
      className="relative max-h-[calc(100dvh-2rem)] w-full max-w-md space-y-4 overflow-y-auto rounded-2xl border border-border bg-zinc-950 p-5 shadow-2xl sm:max-w-lg sm:p-6"
    >
        {/* Top Right Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          aria-label="Close import dialog"
          className="absolute top-3 right-3 min-h-11 min-w-11 text-zinc-500 hover:text-white transition rounded-lg hover:bg-zinc-900 cursor-pointer flex items-center justify-center"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 pr-6">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 flex-shrink-0">
            <Link2 size={18} />
          </div>
          <div>
            <h2 id="import-playlist-title" className="text-lg font-bold text-white leading-snug">Import YouTube Course</h2>
            <p className="text-zinc-400 text-xs mt-0.5">Paste any public YouTube Playlist URL to add it to your catalog.</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 size={15} className="flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleImportSubmit} className="space-y-4 pt-1">
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              YouTube Playlist Link / ID
            </label>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="e.g. https://www.youtube.com/playlist?list=PLu71SKxNbfo..."
              disabled={loading}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-border text-white text-xs sm:text-sm focus:outline-none focus:border-primary placeholder:text-zinc-600 transition"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 border border-border text-zinc-300 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !urlInput.trim()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-hover text-white transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Fetching...</span>
                </>
              ) : (
                <>
                  <Plus size={14} />
                  <span>Import Course</span>
                </>
              )}
            </button>
          </div>
        </form>
    </Dialog>
  );
}
