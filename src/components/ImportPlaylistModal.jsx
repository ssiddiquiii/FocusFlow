import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Loader2, CheckCircle2, AlertCircle, Link2, X } from 'lucide-react';
import { extractPlaylistId, fetchYouTubePlaylistData } from '../services/youtubeApi';
import { useFocusFlow } from '../hooks/useFocusFlow';

export default function ImportPlaylistModal({ isOpen, onClose }) {
  const { importCourse } = useFocusFlow();
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Lock body scroll when modal is open to eliminate background page scrollbars
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-border rounded-2xl max-w-md sm:max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl relative">
        {/* Top Right Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition p-1.5 rounded-lg hover:bg-zinc-900 cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 pr-6">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 flex-shrink-0">
            <Link2 size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-snug">Import YouTube Course</h2>
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
      </div>
    </div>,
    document.body
  );
}
