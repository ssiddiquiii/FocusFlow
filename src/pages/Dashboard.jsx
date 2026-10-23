import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDashboardData } from '../hooks/useDashboardData';
import { useUIStore } from '../hooks/useUIStore';
import { 
  Play, 
  Clock, 
  Trash2, 
  FileText, 
  Sparkles, 
  Flame, 
  Download, 
  RefreshCw, 
  Loader2, 
  Search, 
  CheckCircle2 
} from 'lucide-react';
import StreakModal from '../components/StreakModal';
import { exportNotesToMarkdown } from '../utils/exportUtils';
import { calculateStreak, getActiveDateSet } from '../utils/streakUtils';
import { fetchYouTubePlaylistData } from '../services/youtubeApi';
import { deleteCourse, exportNotes, importCourse } from '../services/dataCommands';
import { DeleteCourseDialog } from '../features/dashboard/DashboardSections';

/**
 * Clean & Minimalist Dashboard Component.
 * - Single direct YouTube playlist/video course importer.
 * - Minimalist inline stats summary (zero cluttered boxes).
 * - Distraction-free active learning resume banner.
 * - Clean responsive course catalog grid.
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const { openCommandPalette } = useUIStore();
  const {
    isLoading,
    sortedCourses,
    progressList,
    practiceProgressList,
    stats,
    courseProgressMap,
    continuePath
  } = useDashboardData();

  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [syncingCourseId, setSyncingCourseId] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Direct Importer States
  const [directUrl, setDirectUrl] = useState('');
  const [isDirectImporting, setIsDirectImporting] = useState(false);
  const [newlyImportedCourse, setNewlyImportedCourse] = useState(null);

  // Dynamic Real-Time Streak Calculation
  const streakCount = useMemo(() => {
    return calculateStreak(progressList, practiceProgressList);
  }, [progressList, practiceProgressList]);

  const activeDates = useMemo(
    () => getActiveDateSet(progressList, practiceProgressList),
    [progressList, practiceProgressList]
  );

  const continueCourse = useMemo(() => {
    if (!continuePath?.courseId) return null;
    return sortedCourses.find(c => c.id === continuePath.courseId) || null;
  }, [sortedCourses, continuePath]);

  const handleContinueLearning = () => {
    if (continuePath) {
      navigate(`/courses/${continuePath.courseId}/lessons/${continuePath.lessonId}`);
    }
  };

  const handleExportNotes = async () => {
    const notes = await exportNotes();
    exportNotesToMarkdown(notes, 'FocusFlow_Mastery_Notes');
  };

  const handleDirectImport = async (e) => {
    if (e) e.preventDefault();
    const urlToUse = directUrl.trim();
    if (!urlToUse) return;

    setIsDirectImporting(true);
    setActionMsg({ text: 'Connecting to YouTube and importing course...', type: 'info' });

    try {
      const { course, lessons } = await fetchYouTubePlaylistData(urlToUse);
      await importCourse(course, lessons);
      setDirectUrl('');
      setNewlyImportedCourse({ course, firstLessonId: lessons[0]?.id });
      setActionMsg({ 
        text: `Successfully imported "${course.title}" with ${lessons.length} lectures!`, 
        type: 'success' 
      });
      setTimeout(() => setActionMsg(null), 5000);
    } catch (err) {
      console.error(err);
      setActionMsg({ text: `Import failed: ${err.message}`, type: 'error' });
      setTimeout(() => setActionMsg(null), 5000);
    } finally {
      setIsDirectImporting(false);
    }
  };
  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCourse(courseToDelete.id);
      setActionMsg({ text: `Course "${courseToDelete.title}" deleted successfully.`, type: 'info' });
      setTimeout(() => setActionMsg(null), 3500);
      setCourseToDelete(null);
    } catch (err) {
      console.error(err);
      setActionMsg({ text: `Failed to delete course: ${err.message}`, type: 'error' });
    } finally {
      setIsDeleting(false);
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
    <div aria-busy={isLoading} className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8">
      {/* Status Action Banner */}
      {actionMsg && (
        <div className={`p-4 rounded-xl text-xs font-semibold border flex items-center justify-between ${
          actionMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
          actionMsg.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
          'bg-zinc-800 text-zinc-300 border-zinc-700/50'
        }`}>
          <span>{actionMsg.text}</span>
          <button onClick={() => setActionMsg(null)} className="text-zinc-500 hover:text-white ml-4">&times;</button>
        </div>
      )}

      {/* Clean Top Header (No duplicate buttons) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome to FocusFlow
            </h1>
            <button
              onClick={() => setIsStreakModalOpen(true)}
              aria-label={`Open streak calendar, ${streakCount} day streak`}
              className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 hover:border-orange-500/60 text-orange-400 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md cursor-pointer transition"
              title="Click to view 30-Day Activity Heatmap Calendar"
            >
              <Flame size={13} className="fill-orange-400 animate-pulse" />
              <span>{streakCount} {streakCount === 1 ? 'Day' : 'Days'} Streak</span>
            </button>
          </div>
          <p className="text-zinc-400 text-xs sm:text-sm font-medium mt-1">
            Your distraction-free developer learning workspace.
          </p>
        </div>

        {/* Clean Header Action */}
        <button
          onClick={handleExportNotes}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          title="Export all written notes to Markdown (.md)"
        >
          <Download size={14} />
          <span>Export Notes (.md)</span>
        </button>
      </div>

      {/* 🚀 HORIZONTAL ACTION ROW: DIRECT IMPORTER + RESUME SESSION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: YouTube Course Importer */}
        <div className="glass-panel p-5 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-zinc-950 to-zinc-950 shadow-md flex flex-col justify-between gap-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center flex-shrink-0">
              <Play size={15} fill="currentColor" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                Import YouTube Course
              </h2>
              <p className="text-[11px] text-zinc-400">
                Paste any playlist or video tutorial link
              </p>
            </div>
          </div>

          <form onSubmit={handleDirectImport} className="flex gap-2">
            <input
              type="text"
              value={directUrl}
              onChange={(e) => setDirectUrl(e.target.value)}
              placeholder="Paste YouTube playlist or video link..."
              disabled={isDirectImporting}
              className="flex-1 min-w-0 bg-zinc-900/90 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium transition"
            />
            <button
              type="submit"
              disabled={isDirectImporting || !directUrl.trim()}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-primary/25 cursor-pointer disabled:opacity-50 flex-shrink-0"
            >
              {isDirectImporting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
              <span>Import</span>
            </button>
          </form>
        </div>

        {/* Right: Active Learning Session */}
        <div className="glass-panel p-5 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-zinc-950 to-zinc-950 shadow-md flex flex-col justify-between gap-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary border border-primary/30 flex items-center justify-center flex-shrink-0">
              <Flame size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight truncate">
                {continueCourse ? continueCourse.title : 'Ready to dive in?'}
              </h2>
              <p className="text-[11px] text-zinc-400 truncate">
                {continueCourse ? 'Pick up right where you left off' : 'Import your first course above to begin'}
              </p>
            </div>
          </div>

          <div>
            <button
              onClick={handleContinueLearning}
              disabled={!continuePath}
              className="w-full px-4 py-2.5 rounded-xl font-extrabold text-xs bg-primary hover:bg-primary/90 text-white transition duration-200 active:scale-95 shadow-md shadow-primary/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play size={13} fill="currentColor" />
              <span>{continuePath ? 'Resume Next Lesson' : 'Awaiting First Course'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Newly Imported Course Quick Launch Banner */}
      {newlyImportedCourse && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5 min-w-0">
            <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
            <span className="text-xs font-bold text-white truncate">
              Ready to study: <span className="text-emerald-300 font-extrabold">{newlyImportedCourse.course.title}</span>
            </span>
          </div>
          <button
            onClick={() => navigate(`/courses/${newlyImportedCourse.course.id}/lessons/${newlyImportedCourse.firstLessonId}`)}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs transition cursor-pointer flex-shrink-0 flex items-center gap-1"
          >
            <span>Start Lesson 1 →</span>
          </button>
        </div>
      )}

      {/* 📚 LEARNING CATALOG HEADER WITH CLEAN INLINE STATS & SEARCH */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Your Learning Catalog
            </h2>
            {/* Elegant Minimalist Single-Line Stats (Zero Clutter) */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-zinc-400 font-medium">
              <span className="text-zinc-200 font-bold">{sortedCourses.length} Courses</span>
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-1">
                <Clock size={13} className="text-primary" />
                <span>{stats.totalHours} hrs watched</span>
              </span>
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span>{stats.completedLessons} lectures done</span>
              </span>
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-1">
                <FileText size={13} className="text-purple-400" />
                <span>{stats.totalNotes || 0} notes written</span>
              </span>
            </div>
          </div>

          {/* Quick Search Button */}
          <button
            type="button"
            onClick={openCommandPalette}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs hover:border-zinc-700 hover:text-white transition cursor-pointer self-start md:self-auto shadow-sm"
          >
            <Search size={14} className="text-zinc-400" />
            <span>Search courses & notes...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-300 font-bold ml-1 border border-zinc-700">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Courses Responsive Grid or Clean Onboarding Guide */}
        {sortedCourses.length === 0 ? (
          <div className="glass-panel p-6 sm:p-10 rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-zinc-950 to-zinc-950 text-center max-w-2xl mx-auto space-y-5 my-2 shadow-xl animate-in fade-in">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center mx-auto shadow-lg shadow-primary/25">
              <Play size={24} fill="currentColor" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                Welcome to FocusFlow! No Courses Yet
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                Your workspace starts clean with zero distractions. Follow these 3 easy steps to import your favorite YouTube course:
              </p>
            </div>

            {/* 3 Step Instruction Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-left">
              <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1">
                <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider block">Step 1</span>
                <p className="text-xs font-bold text-zinc-200">Copy Link</p>
                <p className="text-[11px] text-zinc-400 leading-snug">Copy any playlist or video URL from YouTube.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1">
                <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider block">Step 2</span>
                <p className="text-xs font-bold text-zinc-200">Paste in Box</p>
                <p className="text-[11px] text-zinc-400 leading-snug">Paste it into the "Import YouTube Course" input above.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1">
                <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider block">Step 3</span>
                <p className="text-xs font-bold text-zinc-200">Click Import</p>
                <p className="text-[11px] text-zinc-400 leading-snug">Enjoy studying with timestamps, notes, and 0 ads!</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex md:grid overflow-x-auto md:overflow-visible gap-4 md:gap-6 pb-4 md:pb-0 snap-x snap-mandatory scrollbar-none md:grid-cols-2 lg:grid-cols-3 -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
            {sortedCourses.map((course) => {
              const progress = courseProgressMap[course.id] || 0;

              return (
                <div 
                  key={course.id}
                  className="glass-panel rounded-2xl overflow-hidden flex flex-col hover:border-primary/30 transition duration-300 group flex-shrink-0 w-[85vw] sm:w-[340px] md:w-auto snap-center"
                >
                  {/* Course Header Thumbnail */}
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
                        onClick={(e) => { e.preventDefault(); setCourseToDelete(course); }}
                        className="min-h-11 min-w-11 rounded-xl bg-black/70 hover:bg-red-950/90 text-zinc-300 hover:text-red-400 border border-zinc-700/50 backdrop-blur transition cursor-pointer flex items-center justify-center"
                        title="Delete Course"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <span className="absolute bottom-3 left-3 px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase rounded bg-black/70 text-zinc-300 border border-zinc-700/50 shadow-md">
                      {course.type === 'youtube' ? 'YouTube' : 'Udemy'}
                    </span>
                  </div>

                  {/* Course Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-white tracking-tight leading-snug group-hover:text-primary transition line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                        {course.description}
                      </p>
                    </div>

                    {/* Progress bar gauge */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-zinc-500">Progress</span>
                        <span className="text-white font-bold">{progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-border">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <span className="text-[10px] font-semibold text-zinc-500 truncate max-w-[140px]">
                        {course.channelName}
                      </span>
                      <Link
                        to={`/courses/${course.id}`}
                        className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-border bg-zinc-900/50 text-white hover:bg-zinc-900 hover:border-primary/50 transition"
                      >
                        Open Syllabus →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <DeleteCourseDialog 
        course={courseToDelete} 
        isDeleting={isDeleting} 
        onCancel={() => !isDeleting && setCourseToDelete(null)} 
        onConfirm={handleDeleteCourse} 
      />

      {/* Streak Activity Heatmap Calendar Modal */}
      <StreakModal
        isOpen={isStreakModalOpen}
        onClose={() => setIsStreakModalOpen(false)}
        stats={{ ...stats, totalCourses: sortedCourses.length }}
        streakCount={streakCount}
        activeDates={activeDates}
      />
    </div>
  );
}
