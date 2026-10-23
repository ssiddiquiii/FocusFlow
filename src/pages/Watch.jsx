import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useWatchData } from '../hooks/useWatchData';
import { setLessonCompletion } from '../services/dataCommands';
import { ChaptersPanel } from '../features/watch/ChaptersPanel';
import { PlayerSurface } from '../features/watch/PlayerSurface';
import { WatchDetails } from '../features/watch/WatchDetails';
import { WatchHeader } from '../features/watch/WatchHeader';
import { DesktopWatchWorkspace, MobileWatchWorkspace } from '../features/watch/WatchWorkspace';
import { WatchWorkspaceShell } from '../features/watch/WatchWorkspaceShell';
import { useDesktopWatchWorkspace } from '../features/watch/useDesktopWatchWorkspace';
import { useLessonNotes } from '../features/watch/useLessonNotes';
import { useWatchPlayerController } from '../features/watch/useWatchPlayerController';
import { NotesPanel } from '../features/watch/NotesPanel';
import { FileText } from 'lucide-react';

export default function Watch() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { isLoading, notFound, course, lesson, courseLessons, progressList, lessonNotes } = useWatchData(courseId, lessonId);
  const [activeTab, setActiveTab] = useState('notes');
  const isDesktopWorkspace = useDesktopWatchWorkspace();
  const player = useWatchPlayerController({ courseId, lessonId, lesson, progressList });
  const noteState = useLessonNotes({ courseId, lessonId, getTimestamp: player.getCurrentTime });

  if (isLoading) {
    return (
      <div className="p-8 min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-9 h-9 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  if (notFound) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Lecture Details Not Found</h2>
        <Link to="/" className="text-primary hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  // Navigation indices
  const currentIndex = courseLessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? courseLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < courseLessons.length - 1 ? courseLessons[currentIndex + 1] : null;

  const currentProgress = progressList.find(progress => progress.id === `${courseId}_${lessonId}`);
  const isCompleted = currentProgress ? currentProgress.completed : false;
  const handleToggleComplete = async () => {
    await setLessonCompletion(courseId, lessonId, !isCompleted, isCompleted ? 0 : 2700);
  };

  const handleNavigate = (nextId) => {
    navigate(`/courses/${courseId}/lessons/${nextId}`);
  };

  const notesProps = {
    notes: lessonNotes,
    noteState,
    onSeek: player.triggerPlayerSeek
  };

  const workspaceProps = {
    activeTab,
    courseId,
    lessonId,
    lessonType: lesson.type,
    description: lesson.description,
    lessons: courseLessons,
    progressList,
    onNavigate: handleNavigate,
    notesProps,
    isDesktop: isDesktopWorkspace,
    onTabChange: setActiveTab
  };

  const main = (
    <>
      <WatchHeader courseId={courseId} courseTitle={course.title} lessonTitle={lesson.title} />
      <PlayerSurface
        course={course}
        lesson={lesson}
        lessonId={lessonId}
        controller={player}
        isUdemyCompleted={isCompleted}
        onUdemyToggle={handleToggleComplete}
      />
      <WatchDetails
        course={course}
        lesson={lesson}
        currentIndex={currentIndex >= 0 ? currentIndex : 0}
        totalLessons={courseLessons.length}
        isCompleted={isCompleted}
        onToggleComplete={handleToggleComplete}
        prevLessonId={prevLesson?.id}
        nextLessonId={nextLesson?.id}
        onNavigate={handleNavigate}
      />

      {/* Mobile Inline Switcher (Notes vs Lectures on Mobile, No Reading Tab) */}
      <MobileWatchWorkspace {...workspaceProps} />

      {/* Desktop Direct Notes Section Under Video (Shown on xl screens) */}
      <div className="hidden xl:block px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center flex-shrink-0">
              <FileText size={16} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
                Notes & Timestamped Insights
              </h2>
              <span className="text-[11px] text-muted-foreground block">
                {lessonNotes.length} {lessonNotes.length === 1 ? 'note' : 'notes'} captured for this video
              </span>
            </div>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Current time syncs automatically • Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono border border-border">Enter</kbd> to save
          </span>
        </div>

        <NotesPanel notes={lessonNotes} noteState={noteState} onSeek={player.triggerPlayerSeek} />
      </div>

      {/* Chapters Panel if available */}
      <ChaptersPanel key={lessonId} chapters={lesson.chapters} onSelect={player.triggerPlayerSeek} />
    </>
  );

  return <WatchWorkspaceShell main={main} sidebar={<DesktopWatchWorkspace {...workspaceProps} />} />;
}
