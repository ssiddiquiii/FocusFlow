import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useWatchData } from '../hooks/useWatchData';
import { setLessonCompletion } from '../services/dataCommands';
import { ChaptersPanel } from '../features/watch/ChaptersPanel';
import { CourseSyllabus } from '../features/watch/CourseSyllabus';
import { PlayerSurface } from '../features/watch/PlayerSurface';
import { WatchDetails } from '../features/watch/WatchDetails';
import { WatchHeader } from '../features/watch/WatchHeader';
import { DesktopWatchWorkspace, MobileWatchWorkspace } from '../features/watch/WatchWorkspace';
import { WatchWorkspaceShell } from '../features/watch/WatchWorkspaceShell';
import { useDesktopWatchWorkspace } from '../features/watch/useDesktopWatchWorkspace';
import { useLessonNotes } from '../features/watch/useLessonNotes';
import { useWatchPlayerController } from '../features/watch/useWatchPlayerController';

export default function Watch() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { isLoading, notFound, course, lesson, courseLessons, progressList, lessonNotes } = useWatchData(courseId, lessonId);
  const [activeTab, setActiveTab] = useState('notes');
  const isDesktopWorkspace = useDesktopWatchWorkspace();
  const player = useWatchPlayerController({ courseId, lessonId, lesson, progressList });
  const noteState = useLessonNotes({ courseId, lessonId, getTimestamp: player.getCurrentTime });

  if (isLoading) {
    return <div className="p-8 min-h-[60vh] flex items-center justify-center"><div className="animate-spin w-9 h-9 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }
  if (notFound) {
    return <div className="p-8 text-center"><h2 className="text-2xl font-bold text-red-500 mb-4">Lecture Details Not Found</h2><Link to="/" className="text-primary hover:underline">Return to Dashboard</Link></div>;
  }

  const udemyProgress = progressList.find(progress => progress.id === `${courseId}_${lessonId}`);
  const isUdemyCompleted = udemyProgress ? udemyProgress.completed : false;
  const handleUdemyToggle = async () => {
    await setLessonCompletion(courseId, lessonId, !isUdemyCompleted, isUdemyCompleted ? 0 : 2700);
  };
  const notesProps = {
    notes: lessonNotes,
    noteState,
    onSeek: player.triggerPlayerSeek
  };
  const workspaceProps = {
    activeTab,
    lessonId,
    lessonType: lesson.type,
    description: lesson.description,
    notesProps,
    isDesktop: isDesktopWorkspace,
    onTabChange: setActiveTab
  };
  const main = (
    <>
      <WatchHeader courseId={courseId} courseTitle={course.title} lessonTitle={lesson.title} />
      <PlayerSurface course={course} lesson={lesson} lessonId={lessonId} controller={player} isUdemyCompleted={isUdemyCompleted} onUdemyToggle={handleUdemyToggle} />
      <WatchDetails course={course} lesson={lesson} lessonId={lessonId} onOpenPractice={() => navigate('/practice')} />
      <MobileWatchWorkspace {...workspaceProps} />
      <ChaptersPanel key={lessonId} chapters={lesson.chapters} onSelect={player.triggerPlayerSeek} />
      <CourseSyllabus courseId={courseId} lessonId={lessonId} lessons={courseLessons} progressList={progressList} onNavigate={nextLessonId => navigate(`/courses/${courseId}/lessons/${nextLessonId}`)} />
    </>
  );
  return <WatchWorkspaceShell main={main} sidebar={<DesktopWatchWorkspace {...workspaceProps} />} />;
}
