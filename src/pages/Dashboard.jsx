import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFocusFlow } from '../hooks/useFocusFlow';
import { useUIStore } from '../hooks/useUIStore';
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Plus, 
  Trash2, 
  Target,
  FileText,
  Sparkles,
  ExternalLink,
  Flame,
  Command,
  Download,
  RotateCcw,
  RefreshCw,
  Loader2,
  AlertCircle,
  Search
} from 'lucide-react';
import ImportPlaylistModal from '../components/ImportPlaylistModal';
import StreakModal from '../components/StreakModal';
import QuoteSandbox from '../components/QuoteSandbox';
import { exportNotesToMarkdown } from '../utils/exportUtils';
import { calculateStreak } from '../utils/streakUtils';
import { fetchYouTubePlaylistData } from '../services/youtubeApi';

/**
 * Dashboard Component (Home Catalog).
 * Renders user learning statistics, a "Continue Learning" quick-action button,
 * and a list of course cards showing progress meters.
 * @returns {React.JSX.Element}
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const { openCommandPalette } = useUIStore();
  const { 
    courses, 
    progressList, 
    practiceProgressList,
    notes,
    stats, 
    isInitializing, 
    getCourseProgress, 
    getContinueLearningPath,
    deleteCourse,
    importCourse
  } = useFocusFlow();

  const [courseProgressMap, setCourseProgressMap] = useState({});
  const [continuePath, setContinuePath] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [syncingCourseId, setSyncingCourseId] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);

  // Dynamic Real-Time Streak Calculation
  const streakCount = useMemo(() => {
    return calculateStreak(progressList, practiceProgressList);
  }, [progressList, practiceProgressList]);

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

  const sortedCourses = useMemo(() => {
    return [...courses].sort((a, b) => {
      const progressA = progressList.filter(p => p.courseId === a.id);
      const maxTimeA = progressA.length > 0 ? Math.max(...progressA.map(p => p.updatedAt || p.lastWatched || 0)) : 0;

      const progressB = progressList.filter(p => p.courseId === b.id);
      const maxTimeB = progressB.length > 0 ? Math.max(...progressB.map(p => p.updatedAt || p.lastWatched || 0)) : 0;

      if (maxTimeA !== maxTimeB) {
        return maxTimeB - maxTimeA;
      }
      return a.title.localeCompare(b.title);
    });
  }, [courses, progressList]);

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

  const handleImportSuccess = async (importedCourse, importedLessons) => {
    try {
      await importCourse(importedCourse, importedLessons);
      setActionMsg({ text: `Course "${importedCourse.title}" imported successfully! (${importedLessons.length} lectures added)`, type: 'success' });
      setTimeout(() => setActionMsg(null), 3500);
    } catch (err) {
      console.error(err);
      setActionMsg({ text: `Failed to import course: ${err.message}`, type: 'error' });
    }
  };

  const handleDeleteCourse = async (course) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${course.title}"?\n\nAll progress, checkmarks, and timestamped notes for this course will be permanently removed.`);
    if (!confirmDelete) return;

    try {
      await deleteCourse(course.id);
      setActionMsg({ text: `Course "${course.title}" deleted successfully.`, type: 'info' });
      setTimeout(() => setActionMsg(null), 3500);
    } catch (err) {
      console.error(err);
      setActionMsg({ text: `Failed to delete course: ${err.message}`, type: 'error' });
    }
  };

  const handleSyncCourse = async (course) => {
    if (course.type !== 'youtube') {
      setActionMsg({ text: 'Udemy courses are manually tracked.', type: 'info' });
      setTimeout(() => setActionMsg(null), 3000);
      return;
    }

    setSyncingCourseId(course.id);
    setActionMsg({ text: `Syncing playlist "${course.title}" with YouTube...`, type: 'info' });

    try {
      const { course: updatedCourse, lessons: updatedLessons } = await fetchYouTubePlaylistData(course.id);
      await importCourse(updatedCourse, updatedLessons);
      setActionMsg({ text: `Successfully synced "${course.title}"! (${updatedLessons.length} lectures updated)`, type: 'success' });
      setTimeout(() => setActionMsg(null), 3500);
    } catch (err) {
      console.error(err);
      setActionMsg({ text: `Sync failed: ${err.message}`, type: 'error' });
    } finally {
      setSyncingCourseId(null);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8 sm:space-y-12">
      {/* Status Action Banner */}
      {actionMsg && (
        <div className={`p-4 rounded-xl text-xs font-semibold border flex items-center justify-between ${
          actionMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
          actionMsg.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
          'bg-zinc-800 text-zinc-300 border-zinc-700/50'
        }`}>
          <span>{actionMsg.text}</span>
          <button onClick={() => setActionMsg(null)} className="text-zinc-500 hover:text-white ml-4">✕</button>
        </div>
      )}

      {/* Option B: Vercel / Apple Split Hero Section */}
      <div className="space-y-6">
        {/* Sleek Top Header & Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                Welcome to FocusFlow
              </h1>
              <button
                onClick={() => setIsStreakModalOpen(true)}
                className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 hover:border-orange-500/60 text-orange-400 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md cursor-pointer transition"
                title="Click to view 30-Day Activity Heatmap Calendar"
              >
                <Flame size={13} className="fill-orange-400 animate-pulse" />
                <span>{streakCount} {streakCount === 1 ? 'Day' : 'Days'} Streak 🔥</span>
              </button>
            </div>
            <p className="text-zinc-400 text-xs sm:text-sm font-medium">Your distraction-free developer learning workspace.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Quick Export Notes Button */}
            <button
              onClick={() => exportNotesToMarkdown(notes, 'FocusFlow_Mastery_Notes')}
              className="px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Export all written notes to Markdown (.md)"
            >
              <Download size={14} />
              <span>Export Notes (.md)</span>
            </button>

            {/* Import Course Button */}
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold transition shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5 cursor-pointer flex-shrink-0"
            >
              <Plus size={15} />
              <span>Import Course</span>
            </button>
          </div>
        </div>

        {/* 2-Column Symmetrical Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* LEFT COLUMN (7 Cols): Resume Hero Banner + Mindset Quote */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-4">
            {/* Resume Learning Glass Banner */}
            {continuePath ? (
              <div className="glass-panel rounded-2xl p-5 border border-primary/20 bg-gradient-to-r from-primary/10 via-zinc-950 to-zinc-950 flex flex-col justify-between space-y-4 shadow-xl flex-1">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-extrabold uppercase tracking-widest border border-primary/30">
                    Active Learning Session
                  </span>
                  <Sparkles size={16} className="text-primary animate-pulse" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white tracking-tight">Ready to dive back in?</h3>
                  <p className="text-xs text-zinc-400 font-medium">Pick up exactly where you left off in your active course.</p>
                </div>

                <button
                  onClick={handleContinueLearning}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl font-extrabold text-xs bg-primary hover:bg-primary/90 text-white transition duration-200 active:scale-95 shadow-lg shadow-primary/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play size={15} fill="currentColor" />
                  <span>Resume Next Lesson</span>
                </button>
              </div>
            ) : (
              <div className="glass-panel rounded-2xl p-5 border border-zinc-800 bg-zinc-950/80 flex flex-col justify-between space-y-3 flex-1">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                    Getting Started
                  </span>
                  <BookOpen size={16} className="text-zinc-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-white">Start your developer journey</h3>
                  <p className="text-xs text-zinc-400">Import a YouTube playlist or select a course from your catalog below.</p>
                </div>
              </div>
            )}

            {/* Dynamic Mindset Quote Sandbox */}
            <div className="glass-panel rounded-2xl border border-white/10 bg-zinc-950/80 overflow-hidden shadow-lg">
              <QuoteSandbox />
            </div>
          </div>

          {/* RIGHT COLUMN (5 Cols): Search Capsule + 2x2 Micro Stats Grid */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Sleek Search Trigger Capsule */}
            <div 
              onClick={openCommandPalette}
              className="glass-panel rounded-2xl border border-white/10 bg-zinc-950/90 p-4 flex items-center justify-between cursor-pointer hover:border-primary/40 transition shadow-lg group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Search size={17} className="text-zinc-400 group-hover:text-primary transition flex-shrink-0" />
                <span className="text-xs font-medium text-zinc-400 group-hover:text-white transition truncate">
                  Search 140+ Qs, topics, or notes...
                </span>
              </div>
              <kbd className="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400 font-bold flex-shrink-0">
                Ctrl K
              </kbd>
            </div>

            {/* 2x2 Micro KPI Grid */}
            <div className="grid grid-cols-2 gap-3 flex-1">
              {/* Watch Time */}
              <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between hover:border-primary/40 transition shadow-sm bg-zinc-950/70 border border-zinc-800/80">
                <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center mb-2">
                  <Clock size={16} />
                </div>
                <div>
                  <span className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider block">Watch Time</span>
                  <span className="text-base font-extrabold text-white block mt-0.5">{stats.totalHours} hrs</span>
                </div>
              </div>

              {/* Lectures Done */}
              <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between hover:border-accent/40 transition shadow-sm bg-zinc-950/70 border border-zinc-800/80">
                <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center mb-2">
                  <BookOpen size={16} />
                </div>
                <div>
                  <span className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider block">Lectures Done</span>
                  <span className="text-base font-extrabold text-white block mt-0.5">{stats.completedLessons}</span>
                </div>
              </div>

              {/* Practices Solved */}
              <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-500/40 transition shadow-sm bg-zinc-950/70 border border-zinc-800/80">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-2">
                  <Target size={16} />
                </div>
                <div>
                  <span className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider block">Practices Solved</span>
                  <span className="text-base font-extrabold text-white block mt-0.5">{practiceProgressList.filter(p => p.completed).length}</span>
                </div>
              </div>

              {/* Notes Written */}
              <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between hover:border-purple-500/40 transition shadow-sm bg-zinc-950/70 border border-zinc-800/80">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-2">
                  <FileText size={16} />
                </div>
                <div>
                  <span className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider block">Notes Written</span>
                  <span className="text-base font-extrabold text-white block mt-0.5">{stats.notesCount || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                {/* Course Header Thumbnail (Compact Height) */}
                <div className="h-32 sm:h-36 relative bg-zinc-900 overflow-hidden">
                  <img 
                    src={course.thumbnailUrl} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                  
                  {/* Top-Right Action Buttons: Sync Playlist & Delete Course */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                    {course.type === 'youtube' && (
                      <button
                        onClick={(e) => { e.preventDefault(); handleSyncCourse(course); }}
                        disabled={syncingCourseId === course.id}
                        className="p-2 rounded-xl bg-black/70 hover:bg-black/90 text-zinc-300 hover:text-white border border-zinc-700/50 backdrop-blur transition cursor-pointer disabled:opacity-50"
                        title="Sync Playlist with YouTube"
                      >
                        {syncingCourseId === course.id ? (
                          <Loader2 size={14} className="animate-spin text-primary" />
                        ) : (
                          <RefreshCw size={14} />
                        )}
                      </button>
                    )}

                    <button
                      onClick={(e) => { e.preventDefault(); handleDeleteCourse(course); }}
                      className="p-2 rounded-xl bg-black/70 hover:bg-red-950/90 text-zinc-300 hover:text-red-400 border border-zinc-700/50 backdrop-blur transition cursor-pointer"
                      title="Delete Course"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

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
        onImportSuccess={handleImportSuccess}
      />

      {/* Streak Activity Heatmap Calendar Modal */}
      <StreakModal
        isOpen={isStreakModalOpen}
        onClose={() => setIsStreakModalOpen(false)}
        stats={stats}
        progressList={progressList}
        practiceProgressList={practiceProgressList}
      />
    </div>
  );
}