import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFocusFlow } from '../hooks/useFocusFlow';
import { ArrowLeft, Play, CheckCircle2, Circle, Clock } from 'lucide-react';
import { buttonVariants } from '../components/ui/button';

/**
 * Course Detail & Syllabus View.
 * Displays course overview, progress bar, and list of lectures.
 * @returns {React.JSX.Element}
 */
export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { courses, lessons, progressList, getCourseProgress } = useFocusFlow();

  const [courseProgress, setCourseProgress] = useState(0);
  const [expandedDesc, setExpandedDesc] = useState(false);

  // Retrieve matching course
  const course = courses.find(c => c.id === courseId);
  // Retrieve lessons for this course sorted by index
  const courseLessons = lessons
    .filter(l => l.courseId === courseId)
    .sort((a, b) => a.index - b.index);

  useEffect(() => {
    if (courseId) {
      getCourseProgress(courseId).then(progress => setCourseProgress(progress));
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

  // Find the first uncompleted lesson to "Resume"
  const firstIncompleteLesson = courseLessons.find(lesson => {
    const progress = progressList.find(p => p.id === `${courseId}_${lesson.id}`);
    return !progress || !progress.completed;
  }) || courseLessons[0];

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
          <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded bg-primary/20 text-primary border border-primary/30">
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
        {firstIncompleteLesson && (
          <button
            onClick={() => navigate(`/courses/${courseId}/lessons/${firstIncompleteLesson.id}`)}
            className="w-full md:w-auto px-6 py-4 rounded-xl font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 active:scale-95 transition text-white shadow-lg shadow-primary/25 flex items-center justify-center gap-3"
          >
            <Play size={18} fill="currentColor" />
            <span>{courseProgress > 0 ? 'Resume Course' : 'Start Course'}</span>
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

            return (
              <Link 
                key={lesson.id}
                to={`/courses/${courseId}/lessons/${lesson.id}`}
                className="py-4 px-3 flex items-center justify-between hover:bg-zinc-900/50 transition group rounded-lg"
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
                  </div>
                </div>

                <div className="flex items-center gap-4 text-zinc-500 text-xs">
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
