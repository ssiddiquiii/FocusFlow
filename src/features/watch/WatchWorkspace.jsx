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

function WorkspaceTabs({ activeTab, noteCount, onTabChange, lessonType, mobile = false }) {
  return (
    <div className={`flex border-b border-border bg-zinc-950 text-xs font-bold uppercase tracking-wider overflow-x-auto ${mobile ? '' : 'flex-shrink-0'}`}>
      {lessonType === 'youtube' && <>
        <button onClick={() => onTabChange('notes')} className={`py-3.5 px-4 border-b-2 transition cursor-pointer flex items-center gap-1.5 flex-1 justify-center ${activeTab === 'notes' ? 'border-primary text-white bg-zinc-900/50' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}><FileText size={14} className={activeTab === 'notes' ? 'text-primary' : ''} /><span>Notes ({noteCount})</span></button>
        <button onClick={() => onTabChange('reading')} className={`py-3.5 px-4 border-b-2 transition cursor-pointer flex items-center gap-1.5 flex-1 justify-center ${activeTab === 'reading' ? 'border-primary text-white bg-zinc-900/50' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}><BookOpen size={14} className={activeTab === 'reading' ? 'text-primary' : ''} /><span>Reading</span></button>
      </>}
    </div>
  );
}

export function MobileWatchWorkspace(props) {
  return (
    <div className="block lg:hidden px-4 sm:px-6 py-4 border-b border-border/50 bg-zinc-950/60">
      <div className="glass-panel rounded-2xl border border-border overflow-hidden">
        <WorkspaceTabs mobile lessonType={props.lessonType} activeTab={props.activeTab} noteCount={props.notesProps.notes.length} onTabChange={props.onTabChange} />
        <div className="p-4 space-y-4 max-h-[450px] overflow-y-auto"><WorkspaceContent {...props} /></div>
      </div>
    </div>
  );
}

export function DesktopWatchWorkspace(props) {
  return (
    <div className="hidden lg:flex w-72 lg:w-80 bg-zinc-950 border-l border-border flex-col flex-shrink-0 h-full overflow-hidden">
      <WorkspaceTabs lessonType={props.lessonType} activeTab={props.activeTab} noteCount={props.notesProps.notes.length} onTabChange={props.onTabChange} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4"><WorkspaceContent {...props} /></div>
    </div>
  );
}
