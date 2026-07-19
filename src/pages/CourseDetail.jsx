import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFocusFlow } from '../hooks/useFocusFlow';
import { ArrowLeft, Play, CheckCircle2, Circle, Clock, RotateCcw } from 'lucide-react';
import { buttonVariants } from '../components/ui/button';

/**
 * Course Detail & Syllabus View.
 * Displays course overview, progress bar, and list of lectures.
 * @returns {React.JSX.Element}
 */
export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { courses, lessons, progressList, getCourseProgress, getLastWatchedLesson } = useFocusFlow();

  const [courseProgress, setCourseProgress] = useState(0);
  const [expandedDesc, setExpandedDesc] = useState(false);
  const [lastWatched, setLastWatched] = useState(null);

  // Retrieve matching course
  const course = courses.find(c => c.id === courseId);
  // Retrieve lessons for this course sorted by index
  const courseLessons = lessons
    .filter(l => l.courseId === courseId)
    .sort((a, b) => a.index - b.index);

  useEffect(() => {
    if (courseId) {
      getCourseProgress(courseId).then(progress => setCourseProgress(progress));
      getLastWatchedLesson(courseId).then(lw => setLastWatched(lw));
    }
  }, [courseId, progressList]);

  if (!course) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Course Not Found</h2>
        <Link to="/" className="text-primary hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  // Resume target: last in-progress video first, then first incomplete, then first lesson
  const resumeLesson = (() => {
    if (lastWatched) {
      return courseLessons.find(l => l.id === lastWatched.lessonId);
    }
    return courseLessons.find(lesson => {
      const progress = progressList.find(p => p.id === `${courseId}_${lesson.id}`);
      return !progress || !progress.completed;
    }) || courseLessons[0];
  })();

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Back button */}
      <Link to="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition">
        <ArrowLeft size={16} />
        <span>Back to Dashboard</span>
      </Link>

      {/* Course Banner Card */}
      <div className="glass-panel rounded-2xl p-8 mb-8 flex flex-col md:flex-row gap-8 items-start md:items-center">
        <div className="w-full md:w-64 h-36 rounded-xl overflow-hidden bg-zinc-900 border border-border flex-shrink-0">
          <img 
            src={course.thumbnailUrl} 
            alt={course.title} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1 space-y-4">
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded bg-primary/15 text-primary border border-primary/20 mb-3 select-none">
            {course.type === 'youtube' ? 'YouTube Course' : 'Udemy manual'}
          </span>
          <h1 className="text-3xl font-bold text-white tracking-tight">{course.title}</h1>
          <div className="space-y-1 max-w-2xl">
            <p className="text-zinc-400 text-sm leading-relaxed">
              {expandedDesc ? course.description : `${course.description.slice(0, 180)}${course.description.length > 180 ? '...' : ''}`}
            </p>
            {course.description.length > 180 && (
              <button
                onClick={() => setExpandedDesc(!expandedDesc)}
                className="text-primary hover:text-primary-hover hover:underline text-xs font-bold focus:outline-none cursor-pointer"
              >
                {expandedDesc ? "Show Less" : "Read More"}
              </button>
            )}
          </div>
          <div className="text-xs text-zinc-500 font-semibold">Instructor: {course.channelName}</div>
        </div>

        {/* Continue Learning Button */}
        {resumeLesson && (
          <button
            onClick={() => navigate(`/courses/${courseId}/lessons/${resumeLesson.id}`)}
            className="w-full md:w-auto px-6 py-4 rounded-xl font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 active:scale-95 transition text-white shadow-lg shadow-primary/25 flex items-center justify-center gap-3"
          >
            {lastWatched ? <RotateCcw size={18} /> : <Play size={18} fill="currentColor" />}
            <span>{lastWatched ? 'Resume Last Video' : courseProgress > 0 ? 'Resume Course' : 'Start Course'}</span>
          </button>
        )}
      </div>

      {/* Progress metrics */}
      <div className="glass-panel rounded-xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="w-full sm:w-auto">
          <span className="text-zinc-500 text-sm font-semibold uppercase tracking-wider block mb-1">Course Progress</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{courseProgress}%</span>
            <span className="text-zinc-500 text-sm">completed</span>
          </div>
        </div>

        {/* Animated Progress bar */}
        <div className="flex-1 w-full bg-zinc-900 h-3 rounded-full overflow-hidden border border-border">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out" 
            style={{ width: `${courseProgress}%` }}
          />
        </div>

        <div className="text-right w-full sm:w-auto">
          <span className="text-zinc-500 text-sm font-semibold uppercase tracking-wider block mb-1">Total Lessons</span>
          <span className="text-2xl font-bold text-white">{courseLessons.length} Lectures</span>
        </div>
      </div>

      {/* Syllabus checklist */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white mb-4">Syllabus Curriculum</h2>
        
        <div className="divide-y divide-border border-y border-border">
          {courseLessons.map((lesson) => {
            const progress = progressList.find(p => p.id === `${courseId}_${lesson.id}`);
            const isCompleted = progress ? progress.completed : false;

            const isLastWatched = lastWatched && lesson.id === lastWatched.lessonId;
            const watchTimePercent = isLastWatched && lesson.durationSeconds > 0
              ? Math.round((lastWatched.watchTime / lesson.durationSeconds) * 100)
              : null;

            return (
              <Link 
                key={lesson.id}
                to={`/courses/${courseId}/lessons/${lesson.id}`}
                className={`py-4 px-3 flex items-center justify-between hover:bg-zinc-900/50 transition group rounded-lg ${isLastWatched ? 'bg-primary/5 border border-primary/20' : ''}`}
              >
                <div className="flex items-center gap-4">
                  {/* Status Indicator */}
                  {isCompleted ? (
                    <CheckCircle2 className="text-accent flex-shrink-0" size={20} fill="currentColor" />
                  ) : (
                    <Circle className="text-zinc-600 group-hover:text-zinc-400 flex-shrink-0" size={20} />
                  )}
                  
                  <div>
                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block mb-1">
                      Lecture {lesson.index}
                    </span>
                    <span className="text-sm font-medium text-zinc-200 group-hover:text-white transition">
                      {lesson.title}
                    </span>
                    {/* In-progress mini progress bar */}
                    {isLastWatched && watchTimePercent !== null && (
                      <div className="mt-1.5 w-32 h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${watchTimePercent}%` }} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-zinc-500 text-xs">
                  {isLastWatched && (
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">In Progress</span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{lesson.duration}</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
