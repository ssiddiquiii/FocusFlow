import React from 'react';
import { BookOpen, FileText } from 'lucide-react';
import ReadingTab from '../../components/ReadingTab';
import { NotesPanel } from './NotesPanel';

function WorkspaceContent(props) {
  if (props.activeTab === 'desc') {
    return <div className="glass-panel p-4 rounded-xl border border-border space-y-3"><h4 className="text-xs font-bold text-white uppercase tracking-wider">Video Description</h4><p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">{props.description || 'No description available for this lecture.'}</p></div>;
  }
  if (props.lessonType !== 'youtube') return null;
  if (props.activeTab === 'notes') return <NotesPanel {...props.notesProps} />;
  if (props.activeTab === 'reading') return <ReadingTab lessonId={props.lessonId} />;
  return null;
}

function WorkspaceTabs({ activeTab, noteCount, onTabChange, lessonType }) {
  return (
    <div className="flex flex-shrink-0 border-b border-border bg-zinc-950 text-xs font-bold uppercase tracking-wider">
      {lessonType === 'youtube' && <>
        <button type="button" aria-pressed={activeTab === 'notes'} onClick={() => onTabChange('notes')} className={`flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 border-b-2 px-3 py-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${activeTab === 'notes' ? 'border-primary text-white bg-zinc-900/50' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}><FileText size={14} className={activeTab === 'notes' ? 'text-primary' : ''} /><span>Notes ({noteCount})</span></button>
        <button type="button" aria-pressed={activeTab === 'reading'} onClick={() => onTabChange('reading')} className={`flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 border-b-2 px-3 py-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${activeTab === 'reading' ? 'border-primary text-white bg-zinc-900/50' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}><BookOpen size={14} className={activeTab === 'reading' ? 'text-primary' : ''} /><span>Reading</span></button>
      </>}
    </div>
  );
}

export function MobileWatchWorkspace(props) {
  return (
    <section data-testid="watch-inline-workspace" className="block border-b border-border/50 bg-zinc-950/60 px-3 py-4 sm:px-6 xl:hidden">
      <div className="glass-panel rounded-2xl border border-border overflow-hidden">
        <WorkspaceTabs lessonType={props.lessonType} activeTab={props.activeTab} noteCount={props.notesProps.notes.length} onTabChange={props.onTabChange} />
        <div className="min-w-0 space-y-4 p-3 sm:p-4">{!props.isDesktop && <WorkspaceContent {...props} />}</div>
      </div>
    </section>
  );
}

export function DesktopWatchWorkspace(props) {
  return (
    <aside data-testid="watch-side-workspace" className="hidden h-full w-80 flex-shrink-0 flex-col overflow-hidden border-l border-border bg-zinc-950 xl:flex">
      <WorkspaceTabs lessonType={props.lessonType} activeTab={props.activeTab} noteCount={props.notesProps.notes.length} onTabChange={props.onTabChange} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">{props.isDesktop && <WorkspaceContent {...props} />}</div>
    </aside>
  );
}
