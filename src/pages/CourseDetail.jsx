import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCourseDetail } from '../hooks/useCourseDetail';
import { ArrowLeft, Play, CheckCircle2, Circle, Clock, RotateCcw, RefreshCw } from 'lucide-react';
import { fetchYouTubePlaylistData } from '../services/youtubeApi';
import { importCourse } from '../services/dataCommands';

/**
 * Course Detail & Syllabus View.
 * Displays course overview, progress bar, and list of lectures.
 * Fully theme-adaptive with clean typography and spacing.
 * @returns {React.JSX.Element}
 */
export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const {
    isLoading,
    courseNotFound,
    course,
    courseLessons,
    progressByLessonId,
    courseProgress,
    lastWatched,
    resumeLesson
  } = useCourseDetail(courseId);
  const [expandedDesc, setExpandedDesc] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  const handleSyncPlaylist = async () => {
    if (course?.type !== 'youtube' || isSyncing) return;
    setIsSyncing(true);
    setSyncStatus('Fetching all lectures from YouTube...');
    try {
      const { course: updatedCourse, lessons: updatedLessons } = await fetchYouTubePlaylistData(course.id);
      await importCourse(updatedCourse, updatedLessons);
      setSyncStatus(`Synced ${updatedLessons.length} lectures successfully!`);
      setTimeout(() => setSyncStatus(null), 3500);
    } catch (err) {
      console.error(err);
      setSyncStatus(`Sync failed: ${err.message}`);
      setTimeout(() => setSyncStatus(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-9 h-9 border-3 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (courseNotFound) {
    return (
      <div className="p-8 text-center space-y-3">
        <h2 className="text-2xl font-bold text-destructive">Course Not Found</h2>
        <Link to="/" className="text-primary hover:underline text-sm font-semibold">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="p-3.5 sm:p-8 max-w-5xl mx-auto space-y-7 animate-page-entry">
      {/* Back button */}
      <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition text-sm font-medium">
        <ArrowLeft size={16} />
        <span>Back to Dashboard</span>
      </Link>

      {/* Course Banner Card */}
      <div className="glass-panel rounded-2xl p-5 sm:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8 items-start lg:items-center min-w-0 w-full bg-card border border-border shadow-sm">
        <div className="w-full lg:w-64 h-48 sm:h-38 rounded-xl overflow-hidden bg-muted border border-border flex-shrink-0">
          <img 
            src={course.thumbnailUrl} 
            alt={course.title} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1 space-y-3 min-w-0">
          <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-primary/10 text-primary border border-primary/20 select-none">
            {course.type === 'youtube' ? 'YouTube Course' : 'Udemy Manual'}
          </span>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground tracking-normal break-words">{course.title}</h1>
          <div className="space-y-1.5 max-w-2xl">
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
              {expandedDesc ? course.description : `${course.description.slice(0, 180)}${course.description.length > 180 ? '...' : ''}`}
            </p>
            {course.description.length > 180 && (
              <button
                onClick={() => setExpandedDesc(!expandedDesc)}
                className="text-primary hover:underline text-xs font-semibold focus:outline-none cursor-pointer"
              >
                {expandedDesc ? "Show Less" : "Read More"}
              </button>
            )}
          </div>
          <div className="text-xs text-muted-foreground font-medium">Instructor: {course.channelName}</div>
        </div>

        {/* Continue Learning Button */}
        {resumeLesson && (
          <button
            onClick={() => navigate(`/courses/${courseId}/lessons/${resumeLesson.id}`)}
            className="w-full lg:w-auto px-6 py-3 rounded-xl font-semibold bg-primary hover:bg-primary/90 active:scale-95 transition text-primary-foreground shadow-sm shadow-primary/20 flex items-center justify-center gap-2.5 flex-shrink-0 cursor-pointer"
          >
            {lastWatched ? <RotateCcw size={17} /> : <Play size={17} fill="currentColor" />}
            <span>{lastWatched ? 'Resume Last Video' : courseProgress > 0 ? 'Resume Course' : 'Start Course'}</span>
          </button>
        )}
      </div>

      {/* Progress metrics */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 bg-card border border-border shadow-sm">
        <div className="w-full sm:w-auto">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block mb-1">Course Progress</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">{courseProgress}%</span>
            <span className="text-muted-foreground text-xs">completed</span>
          </div>
        </div>

        {/* Animated Progress bar */}
        <div className="flex-1 w-full bg-muted h-2 rounded-full overflow-hidden border border-border">
          <div 
            className="h-full bg-gradient-to-r from-primary to-orange-400 transition-all duration-500 ease-out" 
            style={{ width: `${courseProgress}%` }}
          />
        </div>

        <div className="text-right w-full sm:w-auto">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block mb-1">Total Lessons</span>
          <span className="text-2xl font-bold text-foreground">{courseLessons.length} Lectures</span>
        </div>
      </div>

      {/* Syllabus checklist */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground tracking-normal">Syllabus Curriculum</h2>
          {course.type === 'youtube' && (
            <button
              onClick={handleSyncPlaylist}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition cursor-pointer disabled:opacity-50 shadow-xs"
              title="Sync complete lecture catalog from YouTube"
            >
              <RefreshCw size={13} className={isSyncing ? "animate-spin text-primary" : "text-muted-foreground"} />
              <span>{isSyncing ? "Syncing..." : "Sync Lectures"}</span>
            </button>
          )}
        </div>
        {syncStatus && (
          <p className="text-xs text-primary font-medium animate-in fade-in">{syncStatus}</p>
        )}
        {courseLessons.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">This course does not contain any lessons yet.</div>
        )}
        
        <div className="divide-y divide-border border-y border-border">
          {courseLessons.map((lesson) => {
            const progress = progressByLessonId.get(lesson.id);
            const isCompleted = progress ? progress.completed : false;

            const isLastWatched = lastWatched && lesson.id === lastWatched.lessonId;
            const watchTimePercent = isLastWatched && lesson.durationSeconds > 0
              ? Math.round((lastWatched.watchTime / lesson.durationSeconds) * 100)
              : null;

            return (
              <Link 
                key={lesson.id}
                to={`/courses/${courseId}/lessons/${lesson.id}`}
                className={`py-4 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/50 transition group rounded-xl min-w-0 ${isLastWatched ? 'bg-primary/5 border border-primary/20' : ''}`}
              >
                <div className="flex min-w-0 items-start gap-4">
                  {/* Status Indicator */}
                  {isCompleted ? (
                    <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={20} fill="currentColor" />
                  ) : (
                    <Circle className="text-muted-foreground/50 group-hover:text-muted-foreground flex-shrink-0" size={20} />
                  )}
                  
                  <div>
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block mb-0.5">
                      Lecture {lesson.index}
                    </span>
                    <span className="block break-words text-sm font-medium text-foreground group-hover:text-primary transition">
                      {lesson.title}
                    </span>
                    {/* In-progress mini progress bar */}
                    {isLastWatched && watchTimePercent !== null && (
                      <div className="mt-1.5 w-32 h-1 bg-muted rounded-full overflow-hidden border border-border">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${watchTimePercent}%` }} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-4 text-muted-foreground text-xs">
                  {isLastWatched && (
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">In Progress</span>
                  )}
                  {lesson.duration && lesson.duration !== '0:00' ? (
                    <span className="flex items-center gap-1 font-mono">
                      <Clock size={12} />
                      <span>{lesson.duration}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                      Lecture
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
