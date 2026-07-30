import React from 'react';
import { Check, Clock, Pencil, Plus, Trash2, X } from 'lucide-react';
import Dialog from '../../components/ui/Dialog';
import { formatSeconds } from './watchConstants';

export function NotesPanel({ notes, noteState, onSeek }) {
  globalThis.__focusFlowRenderProbe?.('NotesPanel');
  const isSaving = noteState.status === 'saving';

  return (
    <div className="min-w-0 space-y-4" data-testid="notes-workspace">
      <form onSubmit={noteState.saveNew} className="space-y-2">
        <label htmlFor="new-lesson-note" className="sr-only">New timestamped note</label>
        <textarea
          id="new-lesson-note"
          value={noteState.draft}
          onChange={event => noteState.setDraft(event.target.value)}
          placeholder="Type a timestamped note…"
          className="h-[70px] w-full resize-y rounded-xl border border-border bg-zinc-900 p-3 text-xs text-white placeholder-zinc-500 transition focus:outline-none focus:border-primary"
          onKeyDown={event => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              noteState.saveNew(event);
            }
          }}
        />
        <button
          type="submit"
          disabled={!noteState.draft.trim() || isSaving}
          className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-primary/95 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Plus size={15} /><span>{isSaving ? 'Saving Note…' : 'Save Note at current time'}</span>
        </button>
        <p className="text-[11px] text-zinc-500">The current player timestamp is captured only when you save.</p>
      </form>

      {noteState.error && (
        <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-300">
          {noteState.error} Your text has been kept so you can try again.
        </p>
      )}

      <div className="space-y-3 pt-2" aria-busy={isSaving}>
        {notes.length === 0 ? (
          <p className="py-6 text-center text-xs text-zinc-500">No notes written for this video yet.</p>
        ) : notes.map(note => {
          const isEditing = noteState.editingId === note.id;
          return (
            <article key={note.id} className="glass-panel min-w-0 space-y-2 rounded-xl border border-border p-3.5">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSeek(note.timestamp)}
                  aria-label={`Seek to note at ${formatSeconds(note.timestamp)}`}
                  className="flex min-h-11 items-center gap-1 rounded border border-accent/30 bg-accent/20 px-2.5 py-1 text-[10px] font-bold text-accent transition hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Clock size={10} /><span>{formatSeconds(note.timestamp)}</span>
                </button>
                <div className="flex items-center gap-1">
                  {!isEditing && (
                    <button type="button" onClick={() => noteState.beginEdit(note)} aria-label={`Edit note at ${formatSeconds(note.timestamp)}`} className="min-h-11 min-w-11 rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><Pencil size={15} /></button>
                  )}
                  <button type="button" title="Delete note" onClick={() => noteState.setDeleteCandidate(note)} aria-label={`Delete note at ${formatSeconds(note.timestamp)}`} className="min-h-11 min-w-11 rounded-lg p-2 text-zinc-400 hover:bg-red-500/10 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><Trash2 size={15} /></button>
                </div>
              </div>
              {isEditing ? (
                <form onSubmit={noteState.saveEdit} className="space-y-2">
                  <label htmlFor={`edit-note-${note.id}`} className="sr-only">Edit note</label>
                  <textarea id={`edit-note-${note.id}`} value={noteState.editDraft} onChange={event => noteState.setEditDraft(event.target.value)} className="min-h-20 w-full resize-y rounded-lg border border-border bg-zinc-950 p-2 text-xs text-white focus:outline-none focus:border-primary" />
                  <div className="flex gap-2">
                    <button type="submit" disabled={!noteState.editDraft.trim() || isSaving} className="flex min-h-11 flex-1 items-center justify-center gap-1 rounded-lg bg-primary px-3 text-xs font-bold text-white disabled:opacity-50"><Check size={14} />Save changes</button>
                    <button type="button" onClick={noteState.cancelEdit} disabled={isSaving} className="flex min-h-11 flex-1 items-center justify-center gap-1 rounded-lg border border-border px-3 text-xs font-bold text-zinc-300"><X size={14} />Cancel</button>
                  </div>
                </form>
              ) : (
                <p className="min-w-0 whitespace-pre-wrap break-words text-xs leading-relaxed text-zinc-200">{note.content}</p>
              )}
            </article>
          );
        })}
      </div>

      <Dialog
        isOpen={Boolean(noteState.deleteCandidate)}
        onClose={() => { if (!isSaving) noteState.setDeleteCandidate(null); }}
        titleId="delete-note-title"
        closeOnBackdrop={!isSaving}
        closeOnEscape={!isSaving}
        className="w-full max-w-sm rounded-2xl border border-border bg-zinc-950 p-5 shadow-2xl"
      >
        <h2 id="delete-note-title" className="text-base font-bold text-white">Delete this note?</h2>
        <p className="mt-2 text-sm text-zinc-400">This action removes the note permanently.</p>
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={() => noteState.setDeleteCandidate(null)} disabled={isSaving} className="min-h-11 flex-1 rounded-xl border border-border text-sm font-bold text-zinc-300">Cancel</button>
          <button type="button" onClick={noteState.confirmDelete} disabled={isSaving} className="min-h-11 flex-1 rounded-xl bg-red-600 text-sm font-bold text-white disabled:opacity-50">{isSaving ? 'Deleting…' : 'Delete note'}</button>
        </div>
      </Dialog>
    </div>
  );
}
