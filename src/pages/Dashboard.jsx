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

const STARTER_COURSES = [
  {
    tag: 'JS',
    tagColor: 'text-amber-500 bg-amber-500/10 border-amber-500/25',
    title: 'JavaScript Masterclass',
    channel: 'Chai aur Code',
    url: 'https://www.youtube.com/playlist?list=PLu71SKxNbfoBuX3f4EOACle2y-tRC5Q37'
  },
  {
    tag: 'WEB',
    tagColor: 'text-blue-500 bg-blue-500/10 border-blue-500/25',
    title: 'Modern Web Dev',
    channel: 'Net Ninja',
    url: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9gksOX3Kd9KPo-O68ncT05o'
  },
  {
    tag: 'PY',
    tagColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/25',
    title: 'Python Crash Course',
    channel: 'freeCodeCamp',
    url: 'https://www.youtube.com/watch?v=rfscVS0vtbw'
  }
];

/**
 * Option 1 "Obsidian Studio" Minimalist Dashboard Component with Solution 1 Interactive Hero.
 * - Single high-converting, distraction-free Hero when 0 courses enrolled.
 * - Direct in-card YouTube importer with 1-click test-drive starter masterclasses.
 * - Dynamic active session resume and catalog view when courses are enrolled.
 * - Full Light Mode & Dark Mode seamless synchronization.
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

  const handleDirectImport = async (e, overrideUrl) => {
    if (e) e.preventDefault();
    const urlToUse = (overrideUrl || directUrl).trim();
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

  const handleQuickStart = (url) => {
    setDirectUrl(url);
    handleDirectImport(null, url);
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
    <div aria-busy={isLoading} className="p-3.5 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto animate-page-entry flex-1 flex flex-col justify-center">
      {/* Status Action Banner */}
      {actionMsg && (
        <div className={`p-3.5 mb-5 rounded-xl text-xs font-semibold border flex items-center justify-between shadow-sm ${
          actionMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
          actionMsg.type === 'error' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' :
          'bg-muted text-muted-foreground border-border'
        }`}>
          <span>{actionMsg.text}</span>
          <button onClick={() => setActionMsg(null)} className="text-muted-foreground hover:text-foreground ml-4 cursor-pointer">&times;</button>
        </div>
      )}

      {/* Newly Imported Course Quick Launch Banner */}
      {newlyImportedCourse && (
        <div className="p-3.5 mb-5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-3 animate-in fade-in shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <CheckCircle2 size={17} className="text-emerald-500 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
              Ready to study: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{newlyImportedCourse.course.title}</span>
            </span>
          </div>
          <button
            onClick={() => navigate(`/courses/${newlyImportedCourse.course.id}/lessons/${newlyImportedCourse.firstLessonId}`)}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition cursor-pointer flex-shrink-0 flex items-center gap-1 shadow-sm"
          >
            <span>Start Lesson 1 →</span>
          </button>
        </div>
      )}

      {/* 🚀 CONDITIONAL RENDERING: ZERO-COURSE COMMAND CENTER vs REGULAR CATALOG */}
      {sortedCourses.length === 0 ? (
        /* ⚡ OPTION 1: "COMMAND CENTER STUDIO" — ABOVE-THE-FOLD ZERO-SCROLL HERO */
        <div className="my-auto py-2 sm:py-6 max-w-3xl w-full mx-auto space-y-6 text-center animate-page-entry">
          {/* Subtle Local-First Tech Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold">
            <Sparkles size={13} />
            <span>Local-First Developer Workspace</span>
          </div>

          {/* Direct Impactful Headline & Subtitle */}
          <div className="space-y-2.5 max-w-2xl mx-auto">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
              Turn YouTube Into Your Distraction-Free Deep Work Studio
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">
              Paste any tutorial playlist or video link to study with synchronized timestamped notes, zero ads, no algorithm feeds, and 100% offline-ready local storage.
            </p>
          </div>

          {/* Direct Importer Input Bar */}
          <form onSubmit={(e) => handleDirectImport(e)} className="max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-2 p-1.5 bg-card border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-2xl transition shadow-sm">
              <div className="flex items-center gap-2.5 px-3 flex-1 min-w-0">
                <Play size={15} className="text-primary fill-primary flex-shrink-0" />
                <input
                  type="text"
                  value={directUrl}
                  onChange={(e) => setDirectUrl(e.target.value)}
                  placeholder="Paste YouTube playlist or video link..."
                  disabled={isDirectImporting}
                  className="w-full bg-transparent text-foreground text-xs sm:text-sm placeholder:text-muted-foreground focus:outline-none font-normal py-2"
                />
              </div>
              <button
                type="submit"
                disabled={isDirectImporting || !directUrl.trim()}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 flex-shrink-0"
              >
                {isDirectImporting ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Sparkles size={15} />
                )}
                <span>{isDirectImporting ? 'Importing Course...' : 'Import Course →'}</span>
              </button>
            </div>
          </form>

          {/* 1-Click Starter Masterclasses with Monospace Tech Tags (NO EMOJIS / NO SNAKES) */}
          <div className="space-y-2.5 pt-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Or test-drive immediately with 1-click popular courses:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {STARTER_COURSES.map((item) => (
                <button
                  key={item.url}
                  type="button"
                  disabled={isDirectImporting}
                  onClick={() => handleQuickStart(item.url)}
                  className="group flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted hover:border-primary/40 text-foreground text-xs font-medium transition cursor-pointer shadow-xs disabled:opacity-50"
                  title={`Import ${item.title} by ${item.channel}`}
                >
                  <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold border ${item.tagColor}`}>
                    {item.tag}
                  </span>
                  <span className="font-semibold group-hover:text-primary transition">{item.title}</span>
                  <span className="text-[10px] text-muted-foreground">• {item.channel}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3 Minimalist Micro-Trust Chips */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-3 text-[11px] text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-500" />
              <span>Zero Ads & Distractions</span>
            </span>
            <span className="text-muted-foreground/30">•</span>
            <span className="flex items-center gap-1.5">
              <FileText size={13} className="text-primary" />
              <span>Timestamped Code Notes</span>
            </span>
            <span className="text-muted-foreground/30">•</span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} className="text-blue-500" />
              <span>100% Local IndexedDB</span>
            </span>
          </div>
        </div>
      ) : (
        /* 📚 REGULAR WORKSPACE WITH ACTIVE RESUME + CATALOG GRID */
        <div className="space-y-6 sm:space-y-8">
          {/* Enrolled Courses Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                  Your Learning Studio
                </h1>
                <button
                  onClick={() => setIsStreakModalOpen(true)}
                  aria-label={`Open streak calendar, ${streakCount} day streak`}
                  className="px-3 py-1 rounded-full bg-primary/10 border border-primary/25 hover:border-primary/50 text-primary text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition shadow-sm"
                  title="Click to view 30-Day Activity Heatmap Calendar"
                >
                  <Flame size={13} className="fill-primary animate-pulse" />
                  <span>{streakCount} {streakCount === 1 ? 'Day' : 'Days'} Streak</span>
                </button>
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm font-normal mt-1 leading-relaxed">
                {sortedCourses.length} {sortedCourses.length === 1 ? 'course' : 'courses'} enrolled in your local workspace.
              </p>
            </div>

            {/* Clean Header Action */}
            <button
              onClick={handleExportNotes}
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-card hover:bg-muted border border-border text-foreground text-xs font-semibold transition flex items-center gap-2 cursor-pointer shadow-sm hover:shadow"
              title="Export all written notes to Markdown (.md)"
            >
              <Download size={14} className="text-muted-foreground" />
              <span>Export Notes (.md)</span>
            </button>
          </div>

          {/* Top Action Row: Importer + Resume Session */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left: YouTube Course Importer */}
            <div className="glass-panel p-6 rounded-2xl border border-border bg-card flex flex-col justify-between gap-4 transition duration-200 hover:border-border/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                  <Play size={16} fill="currentColor" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-foreground tracking-normal">
                    Import YouTube Course
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                    Paste any playlist or video tutorial link
                  </p>
                </div>
              </div>

              <form onSubmit={(e) => handleDirectImport(e)} className="flex gap-2.5">
                <input
                  type="text"
                  value={directUrl}
                  onChange={(e) => setDirectUrl(e.target.value)}
                  placeholder="Paste YouTube playlist or video link..."
                  disabled={isDirectImporting}
                  className="flex-1 min-w-0 bg-muted/60 border border-border rounded-xl px-4 py-2.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-normal transition"
                />
                <button
                  type="submit"
                  disabled={isDirectImporting || !directUrl.trim()}
                  className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-sm shadow-primary/20 cursor-pointer disabled:opacity-50 flex-shrink-0"
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
            <div className="glass-panel p-6 rounded-2xl border border-border bg-card flex flex-col justify-between gap-4 transition duration-200 hover:border-border/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <Flame size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm sm:text-base font-semibold text-foreground tracking-normal truncate">
                    {continueCourse ? continueCourse.title : 'Ready to dive in?'}
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed truncate mt-0.5">
                    {continueCourse ? 'Pick up right where you left off' : 'Import your first course above to begin'}
                  </p>
                </div>
              </div>

              <div>
                <button
                  onClick={handleContinueLearning}
                  disabled={!continuePath}
                  className="w-full px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-primary hover:bg-primary/90 text-primary-foreground transition duration-200 active:scale-95 shadow-sm shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play size={13} fill="currentColor" />
                  <span>{continuePath ? 'Resume Next Lesson' : 'Awaiting First Course'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Catalog Section Header with Live Stats & Search */}
          <div className="space-y-5 pt-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-normal">
                  Your Learning Catalog
                </h2>
                <div className="flex flex-wrap items-center gap-3 pt-1.5 text-xs text-muted-foreground font-normal">
                  <span className="text-foreground font-semibold">{sortedCourses.length} Courses</span>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-primary" />
                    <span>{stats.totalHours} hrs watched</span>
                  </span>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-500" />
                    <span>{stats.completedLessons} lectures done</span>
                  </span>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="flex items-center gap-1.5">
                    <FileText size={13} className="text-purple-500" />
                    <span>{stats.totalNotes || 0} notes written</span>
                  </span>
                </div>
              </div>

              {/* Quick Search Button */}
              <button
                type="button"
                onClick={openCommandPalette}
                className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-card border border-border text-muted-foreground text-xs hover:text-foreground hover:bg-muted transition cursor-pointer self-start md:self-auto shadow-sm"
              >
                <Search size={14} className="text-muted-foreground" />
                <span>Search courses & notes...</span>
                <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono text-muted-foreground font-semibold ml-1 border border-border">
                  Ctrl K
                </kbd>
              </button>
            </div>

            {/* Courses Responsive Grid */}
            <div className="flex md:grid overflow-x-auto md:overflow-visible gap-4 md:gap-6 pb-4 md:pb-0 snap-x snap-mandatory scrollbar-none md:grid-cols-2 lg:grid-cols-3 -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
              {sortedCourses.map((course) => {
                const progress = courseProgressMap[course.id] || 0;

                return (
                  <div 
                    key={course.id}
                    className="glass-panel rounded-2xl overflow-hidden flex flex-col hover:border-primary/40 hover:shadow-md transition duration-300 group flex-shrink-0 w-[85vw] sm:w-[340px] md:w-auto snap-center bg-card border border-border"
                  >
                    {/* Course Header Thumbnail */}
                    <div className="h-34 sm:h-38 relative bg-muted overflow-hidden">
                      <img 
                        src={course.thumbnailUrl} 
                        alt={course.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {/* Top-Right Action Buttons: Sync Playlist & Delete Course */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                        {course.type === 'youtube' && (
                          <button
                            onClick={(e) => { e.preventDefault(); handleSyncCourse(course); }}
                            disabled={syncingCourseId === course.id}
                            className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white/90 border border-white/20 backdrop-blur transition cursor-pointer disabled:opacity-50"
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
                          className="min-h-10 min-w-10 rounded-xl bg-black/60 hover:bg-red-600/90 text-white/90 hover:text-white border border-white/20 backdrop-blur transition cursor-pointer flex items-center justify-center"
                          title="Delete Course"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <span className="absolute bottom-3 left-3 px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded bg-black/70 text-white/90 border border-white/20 shadow-sm">
                        {course.type === 'youtube' ? 'YouTube' : 'Udemy'}
                      </span>
                    </div>

                    {/* Course Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1.5">
                        <h3 className="text-sm sm:text-base font-semibold text-foreground tracking-normal leading-snug group-hover:text-primary transition line-clamp-1">
                          {course.title}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {course.description}
                        </p>
                      </div>

                      {/* Progress bar gauge */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="text-foreground font-semibold">{progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden border border-border">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-orange-400 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Actions footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <span className="text-[11px] font-medium text-muted-foreground truncate max-w-[140px]">
                          {course.channelName}
                        </span>
                        <Link
                          to={`/courses/${course.id}`}
                          className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-border bg-muted/50 text-foreground hover:bg-muted hover:border-primary/40 transition shadow-sm"
                        >
                          Open Syllabus →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
