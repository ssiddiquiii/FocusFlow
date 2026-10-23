import React from 'react';
import { BookOpen, CheckCircle2, Circle, Clock, FileText, ListVideo } from 'lucide-react';
import ReadingTab from '../../components/ReadingTab';
import { NotesPanel } from './NotesPanel';

function PlaylistSyllabusList({ courseId, lessonId, lessons, progressList, onNavigate }) {
  if (!lessons || lessons.length === 0) {
    return <p className="text-xs text-muted-foreground p-4 text-center">No lectures found.</p>;
  }

  return (
    <div className="space-y-1.5">
      {lessons.map(item => {
        const progress = progressList?.find(candidate => candidate.id === `${courseId}_${item.id}`);
        const isCompleted = progress ? progress.completed : false;
        const isActive = item.id === lessonId;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => { if (!isActive && onNavigate) onNavigate(item.id); }}
            className={`w-full text-left p-2.5 sm:p-3 rounded-xl flex items-center justify-between border transition group cursor-pointer ${
              isActive
                ? 'bg-primary/15 border-primary/50 text-foreground font-semibold shadow-sm ring-1 ring-primary/30'
                : 'bg-card/70 border-border/80 hover:bg-muted text-foreground'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isCompleted ? (
                <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={16} fill="currentColor" />
              ) : (
                <Circle className="text-muted-foreground/40 group-hover:text-muted-foreground flex-shrink-0" size={16} />
              )}
              <div className="min-w-0">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block leading-tight">
                  {item.index ? `Lecture ${item.index}` : 'Video'}
                </span>
                <span className="text-xs font-semibold truncate block leading-snug">
                  {item.title}
                </span>
              </div>
            </div>
            {item.duration && item.duration !== '0:00' ? (
              <span className="text-[10px] text-muted-foreground font-medium flex-shrink-0 flex items-center gap-1 ml-2 font-mono">
                <Clock size={10} />
                <span>{item.duration}</span>
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function WorkspaceContent(props) {
  if (props.activeTab === 'lectures') {
    return (
      <PlaylistSyllabusList
        courseId={props.courseId}
        lessonId={props.lessonId}
        lessons={props.lessons}
        progressList={props.progressList}
        onNavigate={props.onNavigate}
      />
    );
  }
  if (props.activeTab === 'desc') {
    return (
      <div className="bg-card p-4 rounded-xl border border-border space-y-3">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Video Description</h4>
        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {props.description || 'No description available for this lecture.'}
        </p>
      </div>
    );
  }
  if (props.lessonType !== 'youtube') return null;
  if (props.activeTab === 'notes') return <NotesPanel {...props.notesProps} />;
  if (props.activeTab === 'reading') return <ReadingTab lessonId={props.lessonId} />;
  return null;
}

function WorkspaceTabs({ activeTab, noteCount, lecturesCount, onTabChange, lessonType }) {
  return (
    <div className="flex flex-shrink-0 border-b border-border bg-card text-xs font-bold uppercase tracking-wider">
      {lecturesCount > 1 && (
        <button
          type="button"
          aria-pressed={activeTab === 'lectures'}
          onClick={() => onTabChange('lectures')}
          className={`flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 border-b-2 px-2 py-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${
            activeTab === 'lectures'
              ? 'border-primary text-primary bg-primary/10'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <ListVideo size={14} className={activeTab === 'lectures' ? 'text-primary' : ''} />
          <span>Lectures ({lecturesCount})</span>
        </button>
      )}
      {lessonType === 'youtube' && (
        <>
          <button
            type="button"
            aria-pressed={activeTab === 'notes'}
            onClick={() => onTabChange('notes')}
            className={`flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 border-b-2 px-2 py-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${
              activeTab === 'notes'
                ? 'border-primary text-primary bg-primary/10'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <FileText size={14} className={activeTab === 'notes' ? 'text-primary' : ''} />
            <span>Notes ({noteCount})</span>
          </button>
          <button
            type="button"
            aria-pressed={activeTab === 'reading'}
            onClick={() => onTabChange('reading')}
            className={`flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 border-b-2 px-2 py-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${
              activeTab === 'reading'
                ? 'border-primary text-primary bg-primary/10'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <BookOpen size={14} className={activeTab === 'reading' ? 'text-primary' : ''} />
            <span>Reading</span>
          </button>
        </>
      )}
    </div>
  );
}

export function MobileWatchWorkspace(props) {
  return (
    <section data-testid="watch-inline-workspace" className="block border-b border-border/50 bg-background px-3 py-4 sm:px-6 xl:hidden">
      <div className="glass-panel rounded-2xl border border-border overflow-hidden">
        <WorkspaceTabs
          lessonType={props.lessonType}
          activeTab={props.activeTab}
          noteCount={props.notesProps?.notes?.length || 0}
          lecturesCount={props.lessons?.length || 0}
          onTabChange={props.onTabChange}
        />
        <div className="min-w-0 space-y-4 p-3 sm:p-4">{!props.isDesktop && <WorkspaceContent {...props} />}</div>
      </div>
    </section>
  );
}

export function DesktopWatchWorkspace(props) {
  return (
    <aside data-testid="watch-side-workspace" className="hidden h-full w-80 xl:w-96 flex-shrink-0 flex-col overflow-hidden border-l border-border bg-card xl:flex">
      <WorkspaceTabs
        lessonType={props.lessonType}
        activeTab={props.activeTab}
        noteCount={props.notesProps?.notes?.length || 0}
        lecturesCount={props.lessons?.length || 0}
        onTabChange={props.onTabChange}
      />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">{props.isDesktop && <WorkspaceContent {...props} />}</div>
    </aside>
  );
}
