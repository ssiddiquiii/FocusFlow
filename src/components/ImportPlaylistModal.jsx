import React, { useState } from 'react';
import { Plus, Loader2, CheckCircle2, AlertCircle, Link2 } from 'lucide-react';
import { extractPlaylistId, fetchYouTubePlaylistData } from '../services/youtubeApi';
import { useFocusFlow } from '../hooks/useFocusFlow';

export default function ImportPlaylistModal({ isOpen, onClose }) {
  const { importCourse } = useFocusFlow();
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
      }, 1800);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to import playlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-border rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-page-entry">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Link2 size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Import YouTube Course</h2>
              <p className="text-zinc-400 text-xs mt-0.5">Paste any public YouTube Playlist URL to add it to your catalog.</p>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleImportSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              YouTube Playlist Link / ID
            </label>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="e.g. https://www.youtube.com/playlist?list=PLu71SKxNbfo..."
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-border text-white text-sm focus:outline-none focus:border-primary placeholder:text-zinc-600"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-zinc-900 border border-border text-zinc-300 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !urlInput.trim()}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary hover:bg-primary-hover text-white transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Fetching Playlist...</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>Import Course</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
