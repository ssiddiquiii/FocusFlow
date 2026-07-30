import React from 'react';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { formatSeconds } from './watchConstants';

export function NotesPanel({ noteContent, notes, currentTime, onContentChange, onSave, onDelete, onSeek }) {
  globalThis.__focusFlowRenderProbe?.('NotesPanel');
  return (
    <div className="space-y-4">
      <form onSubmit={onSave} className="space-y-2">
        <textarea value={noteContent} onChange={event => onContentChange(event.target.value)} placeholder="Type a timestamped note... (Press Enter to Save)" className="w-full h-[70px] p-3 bg-zinc-900 border border-border rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-primary transition resize-none" onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); onSave(event); } }} />
        <button type="submit" disabled={!noteContent.trim()} className="w-full py-2.5 bg-primary disabled:opacity-50 text-white rounded-xl text-xs font-bold hover:bg-primary/95 transition flex items-center justify-center gap-2 cursor-pointer shadow-md">
          <Plus size={15} /><span>Save Note {currentTime !== null && `[${formatSeconds(currentTime)}]`}</span>
        </button>
      </form>
      <div className="space-y-3 pt-2">
        {notes.length === 0 ? <p className="text-xs text-zinc-500 py-6 text-center">No notes written for this video yet.</p> : notes.map(note => (
          <div key={note.id} className="glass-panel p-3.5 rounded-xl relative group border border-border space-y-2">
            <div className="flex items-center justify-between">
              <button onClick={() => onSeek(note.timestamp)} className="px-2.5 py-1 text-[10px] font-bold rounded bg-accent/20 text-accent hover:bg-accent/30 border border-accent/30 transition flex items-center gap-1 cursor-pointer"><Clock size={10} /><span>{formatSeconds(note.timestamp)}</span></button>
              <button onClick={() => onDelete(note.id)} className="text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1 cursor-pointer" title="Delete note"><Trash2 size={14} /></button>
            </div>
            <p className="text-xs text-zinc-200 leading-relaxed whitespace-pre-line">{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
