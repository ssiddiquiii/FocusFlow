import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFocusFlow } from '../hooks/useFocusFlow';
import { BookOpen, Clock, FileText, Play, RotateCcw, Plus } from 'lucide-react';
import ImportPlaylistModal from '../components/ImportPlaylistModal';

/**
 * Dashboard Component (Home Catalog).
 * Renders user learning statistics, a "Continue Learning" quick-action button,
 * and a list of course cards showing progress meters.
 * @returns {React.JSX.Element}
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const { 
    courses, 
    progressList, 
    stats, 
    isInitializing, 
    getCourseProgress, 
    getContinueLearningPath 
  } = useFocusFlow();

  const [courseProgressMap, setCourseProgressMap] = useState({});
  const [continuePath, setContinuePath] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Compute progress for each course reactively when list changes (Parallel execution)
  useEffect(() => {
    let isCancelled = false;

    async function loadAllProgress() {
      const progressEntries = await Promise.all(
        courses.map(async (course) => {
          const progress = await getCourseProgress(course.id);
          return [course.id, progress];
        })
      );

      if (!isCancelled) {
        setCourseProgressMap(Object.fromEntries(progressEntries));
      }
    }
    
    if (courses.length > 0) {
      loadAllProgress();
    }

    return () => {
      isCancelled = true;
    };
  }, [courses, progressList, getCourseProgress]);

  // Calculate the "Continue Learning" path on mount
  useEffect(() => {
    let isCancelled = false;
    getContinueLearningPath().then(path => {
      if (!isCancelled) setContinuePath(path);
    });
    return () => {
      isCancelled = true;
    };
  }, [progressList, getContinueLearningPath]);

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
        <span className="text-sm text-zinc-500 uppercase tracking-widest font-semibold">Initializing FocusFlow Database...</span>
      </div>
    );
  }

  const handleContinueLearning = () => {
    if (continuePath) {
      navigate(`/courses/${continuePath.courseId}/lessons/${continuePath.lessonId}`);
    }
  };

  const sortedCourses = [...courses].sort((a, b) => {
    const progressA = progressList.filter(p => p.courseId === a.id);
    const maxTimeA = progressA.length > 0 ? Math.max(...progressA.map(p => p.updatedAt || p.lastWatched || 0)) : 0;

    const progressB = progressList.filter(p => p.courseId === b.id);
    const maxTimeB = progressB.length > 0 ? Math.max(...progressB.map(p => p.updatedAt || p.lastWatched || 0)) : 0;

    if (maxTimeA !== maxTimeB) {
      return maxTimeB - maxTimeA;
    }
    return a.title.localeCompare(b.title);
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      {/* Welcome Header & Stats Grid */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Welcome to FocusFlow</h1>
            <p className="text-zinc-400 text-sm mt-1">Your distraction-free personal learning workspace.</p>
          </div>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
          >
            <Plus size={16} />
            <span>Import Course</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel rounded-2xl p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
              <Clock size={24} />
            </div>
            <div>
              <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">Watch Time</span>
              <span className="text-2xl font-extrabold text-white">{stats.totalHours} hrs</span>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-accent/20 text-accent flex items-center justify-center">
              <BookOpen size={24} />
            </div>
            <div>
              <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">Lectures Completed</span>
              <span className="text-2xl font-extrabold text-white">{stats.completedLessons}</span>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <FileText size={24} />
            </div>
            <div>
              <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">Notes Written</span>
              <span className="text-2xl font-extrabold text-white">{stats.totalNotes}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Learning Call to Action */}
      {continuePath && (
        <div className="p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/5 to-zinc-900 border border-primary/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-accent uppercase tracking-widest">Ready to dive back in?</span>
            <h2 className="text-xl font-bold text-white">Pick up exactly where you left off.</h2>
          </div>
          <button
            onClick={handleContinueLearning}
            className="px-6 py-3.5 rounded-xl font-bold bg-primary hover:bg-primary-hover text-white transition duration-200 active:scale-95 shadow-lg shadow-primary/25 flex items-center gap-2"
          >
            <Play size={16} fill="currentColor" />
            <span>Continue Learning</span>
          </button>
        </div>
      )}

      {/* Courses Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">Your Learning Catalog</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCourses.map((course) => {
            const progress = courseProgressMap[course.id] || 0;

            return (
              <div 
                key={course.id}
                className="glass-panel rounded-2xl overflow-hidden flex flex-col hover:border-primary/30 transition duration-300 group"
              >
                {/* Course Header Thumbnail */}
                <div className="aspect-video relative bg-zinc-900 overflow-hidden">
                  <img 
                    src={course.thumbnailUrl} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                  <span className="absolute bottom-6 left-6 px-1.5 py-0.5 text-[9px] font-bold tracking-widest uppercase rounded bg-black/70 text-zinc-300 border border-zinc-700/50 shadow-md">
                    {course.type === 'youtube' ? 'YouTube' : 'Udemy'}
                  </span>
                </div>

                {/* Course Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white tracking-tight leading-snug group-hover:text-primary transition">
                      {course.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                      {course.description}
                    </p>
                  </div>

                  {/* Progress bar gauge */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-zinc-500">Progress</span>
                      <span className="text-white">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-border">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-[10px] font-semibold text-zinc-500">
                      Instructor: {course.channelName}
                    </span>
                    <Link
                      to={`/courses/${course.id}`}
                      className="px-4 py-2 text-xs font-bold rounded-lg border border-border bg-zinc-900/50 text-white hover:bg-zinc-900 hover:border-primary/50 transition"
                    >
                      Open Syllabus
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Import YouTube Playlist Modal */}
      <ImportPlaylistModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
      />
    </div>
  );
}