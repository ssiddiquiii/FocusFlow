import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFocusFlow } from '../hooks/useFocusFlow';
import { useUIStore } from '../hooks/useUIStore';
import { ArrowLeft, BookOpen, FileText, CheckCircle2, Circle, Clock, Plus, Trash2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/FocusFlowDB';

/**
 * Formats a duration in seconds to standard MM:SS or HH:MM:SS string.
 * @param {number} totalSeconds Total play duration.
 * @returns {string} Formatted duration.
 */
function formatSeconds(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Custom Interactive Watch Player View.
 * Wraps official YouTube IFrame Player API, synchronizes playback position
 * to IndexedDB, and exposes timestamped note-taking.
 * @returns {React.JSX.Element}
 */
export default function Watch() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef(null);
  
  const { courses, lessons, progressList, saveProgress } = useFocusFlow();
  const { activeLessonId, isPlaying, seekRequestTime, setActiveLessonId, setIsPlaying, triggerPlayerSeek } = useUIStore();

  const [activeTab, setActiveTab] = useState('syllabus'); // 'syllabus' | 'notes' | 'desc'
  const [noteContent, setNoteContent] = useState('');
  const [ytPlayer, setYtPlayer] = useState(null);

  // Retrieve course
  const course = courses.find(c => c.id === courseId);
  // Retrieve lesson
  const lesson = lessons.find(l => l.courseId === courseId && l.id === lessonId);
  // Retrieve all lessons in course sorted by index
  const courseLessons = lessons
    .filter(l => l.courseId === courseId)
    .sort((a, b) => a.index - b.index);

  // Reactive Dexie query for timestamped notes for this specific lesson
  const lessonNotes = useLiveQuery(() => 
    db.notes.where({ courseId, lessonId }).sortBy('timestamp')
  , [courseId, lessonId]) || [];

  // Update active Zustand lesson tracking on component mount/lesson change
  useEffect(() => {
    if (lessonId) {
      setActiveLessonId(lessonId);
    }
  }, [lessonId]);

  // Handle player seek trigger changes from Zustand store
  useEffect(() => {
    if (ytPlayer && seekRequestTime !== null) {
      ytPlayer.seekTo(seekRequestTime, true);
      ytPlayer.playVideo();
      triggerPlayerSeek(null); // Reset trigger
    }
  }, [seekRequestTime, ytPlayer]);

  // YouTube IFrame Player API Initialization
  useEffect(() => {
    if (!lesson || lesson.type !== 'youtube') return;

    let playerInstance = null;
    let progressTimer = null;

    // Retrieve previous watch position to resume
    const currentProgress = progressList.find(p => p.id === `${courseId}_${lessonId}`);
    // Business Rule: Resume at saved seconds minus two seconds, bounded to >= 0
    const resumeSeconds = currentProgress && !currentProgress.completed ? Math.max(0, currentProgress.watchTime - 2) : 0;

    const onPlayerReady = (event) => {
      // Seek to resume position on ready
      if (resumeSeconds > 0) {
        event.target.seekTo(resumeSeconds, true);
      }
      setYtPlayer(event.target);
    };

    const startProgressTracking = (player) => {
      if (progressTimer) clearInterval(progressTimer);
      progressTimer = setInterval(() => {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        if (duration > 0) {
          // Mark completed if watched at least 90% during active playback
          const isCompleted = (currentTime / duration) >= 0.90;
          saveProgress(courseId, lessonId, currentTime, isCompleted);
        }
      }, 10000); // save state every 10 seconds
    };

    const stopProgressTracking = () => {
      if (progressTimer) {
        clearInterval(progressTimer);
        progressTimer = null;
      }
    };

    const onPlayerStateChange = (event) => {
      const state = event.data;
      if (state === window.YT.PlayerState.PLAYING) {
        setIsPlaying(true);
        startProgressTracking(event.target);
      } else {
        setIsPlaying(false);
        stopProgressTracking();
        
        // Save state immediately on key lifecycle pauses
        if (state === window.YT.PlayerState.PAUSED) {
          const currentTime = event.target.getCurrentTime();
          const duration = event.target.getDuration();
          const isCompleted = duration > 0 ? (currentTime / duration) >= 0.90 : false;
          saveProgress(courseId, lessonId, currentTime, isCompleted);
        }

        // Business Rule: Mark completed when video ends
        if (state === window.YT.PlayerState.ENDED) {
          const duration = event.target.getDuration();
          saveProgress(courseId, lessonId, duration, true);
        }
      }
    };

    const initializePlayer = () => {
      playerInstance = new window.YT.Player('yt-player-iframe', {
        height: '100%',
        width: '100%',
        videoId: lessonId,
        playerVars: {
          rel: 0, // Disable related videos outside this channel
          iv_load_policy: 3, // Disable annotations
          modestbranding: 1, // Minimize logo presence
          controls: 1
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange
        }
      });
    };

    // Load the official YouTube IFrame Script dynamically if not present
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = initializePlayer;
    } else {
      initializePlayer();
    }

    // Cleanup hook resources on unmount
    return () => {
      stopProgressTracking();
      if (playerInstance) {
        playerInstance.destroy();
      }
      setYtPlayer(null);
      setIsPlaying(false);
    };
  }, [lessonId, courseId]);

  if (!lesson || !course) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Lecture Details Not Found</h2>
        <Link to="/" className="text-primary hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  // Handle manual Udemy completion toggle
  const udemyProgress = progressList.find(p => p.id === `${courseId}_${lessonId}`);
  const isUdemyCompleted = udemyProgress ? udemyProgress.completed : false;

  const handleUdemyToggle = async () => {
    await saveProgress(courseId, lessonId, isUdemyCompleted ? 0 : 2700, !isUdemyCompleted);
  };

  // Save new note at the active playhead timestamp
  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    let timestamp = 0;
    if (ytPlayer && lesson.type === 'youtube') {
      timestamp = Math.round(ytPlayer.getCurrentTime());
    }

    const now = Date.now();
    await db.notes.add({
      courseId,
      lessonId,
      timestamp,
      content: noteContent.trim(),
      createdAt: now,
      updatedAt: now
    });

    setNoteContent('');
  };

  // Delete a timestamped note
  const handleDeleteNote = async (id) => {
    await db.notes.delete(id);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-0px)] overflow-hidden">
      {/* Left Area: Video Player Panel */}
      <div className="flex-1 bg-black flex flex-col min-w-0">
        {/* Navigation header */}
        <div className="flex items-center gap-4 px-6 py-4 bg-zinc-950/80 border-b border-border z-10">
          <Link to={`/courses/${courseId}`} className="text-zinc-400 hover:text-white transition">
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold truncate">
              {course.title}
            </span>
            <h2 className="text-sm font-semibold text-white truncate">{lesson.title}</h2>
          </div>
        </div>

        {/* Player Container */}
        <div className="flex-1 relative bg-zinc-950 flex items-center justify-center">
          {lesson.type === 'youtube' ? (
            <div className="w-full h-full">
              <div id="yt-player-iframe" className="w-full h-full absolute inset-0" />
            </div>
          ) : (
            // Manual Udemy course content tracker shell
            <div className="flex flex-col items-center justify-center p-8 max-w-md text-center space-y-6">
              <span className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded bg-accent/20 text-accent border border-accent/30">
                Udemy Cohort
              </span>
              <h3 className="text-2xl font-bold text-white leading-snug">{lesson.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                This course is manually tracked. Visit Udemy.com to watch the video, then mark it complete below.
              </p>
              <a 
                href={course.udemyUrl} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-zinc-900 border border-border text-white hover:bg-zinc-800 transition font-medium"
              >
                Open Course on Udemy
              </a>

              <button
                onClick={handleUdemyToggle}
                className={`w-full py-4 rounded-xl font-bold transition duration-200 active:scale-98 ${
                  isUdemyCompleted 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                    : 'bg-primary text-white hover:bg-primary/95 shadow-lg shadow-primary/20'
                }`}
              >
                {isUdemyCompleted ? '✓ Completed (Unmark)' : 'Mark as Completed'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Area: Sidebar Panels (Syllabus, Notes, Description) */}
      <div className="w-full lg:w-[420px] bg-zinc-950 border-l border-border flex flex-col flex-shrink-0 h-full">
        {/* Tab Selection Header */}
        <div className="flex border-b border-border bg-zinc-950">
          <button
            onClick={() => setActiveTab('syllabus')}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider border-b-2 text-center transition ${
              activeTab === 'syllabus' ? 'border-primary text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <BookOpen size={14} />
              <span>Syllabus</span>
            </div>
          </button>

          {lesson.type === 'youtube' && (
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider border-b-2 text-center transition ${
                activeTab === 'notes' ? 'border-primary text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText size={14} />
                <span>Notes ({lessonNotes.length})</span>
              </div>
            </button>
          )}

          <button
            onClick={() => setActiveTab('desc')}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider border-b-2 text-center transition ${
              activeTab === 'desc' ? 'border-primary text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span>Details</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {/* TAB 1: SYLLABUS LIST */}
          {activeTab === 'syllabus' && (
            <div className="space-y-2">
              {courseLessons.map((item) => {
                const prog = progressList.find(p => p.id === `${courseId}_${item.id}`);
                const isCompleted = prog ? prog.completed : false;
                const isActive = item.id === lessonId;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (!isActive) navigate(`/courses/${courseId}/lessons/${item.id}`);
                    }}
                    className={`w-full text-left p-3 rounded-lg flex items-center justify-between border transition group ${
                      isActive 
                        ? 'bg-zinc-900 border-primary/50 text-white' 
                        : 'bg-transparent border-transparent hover:bg-zinc-900/50 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {isCompleted ? (
                        <CheckCircle2 className="text-accent flex-shrink-0" size={16} fill="currentColor" />
                      ) : (
                        <Circle className="text-zinc-700 group-hover:text-zinc-500 flex-shrink-0" size={16} />
                      )}
                      <div className="min-w-0">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold block mb-0.5">
                          Lecture {item.index}
                        </span>
                        <span className="text-xs font-medium truncate block">{item.title}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-600 font-medium flex-shrink-0 flex items-center gap-1">
                      <Clock size={10} />
                      <span>{item.duration}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 2: NOTES INPUT & LIST */}
          {activeTab === 'notes' && (
            <div className="space-y-4 flex flex-col h-full min-h-0">
              {/* Form Input */}
              <form onSubmit={handleSaveNote} className="space-y-2 flex-shrink-0">
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Type a timestamped note... (Press Shift+Enter for new line)"
                  className="w-full h-24 p-3 bg-zinc-900 border border-border rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-primary transition resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSaveNote(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!noteContent.trim()}
                  className="w-full py-2.5 bg-primary disabled:opacity-50 text-white rounded-lg text-xs font-bold hover:bg-primary/95 transition flex items-center justify-center gap-2"
                >
                  <Plus size={14} />
                  <span>Save Note {ytPlayer && `[${formatSeconds(ytPlayer.getCurrentTime())}]`}</span>
                </button>
              </form>

              {/* Notes List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
                {lessonNotes.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-8">No notes written for this video yet.</p>
                ) : (
                  lessonNotes.map((note) => (
                    <div key={note.id} className="glass-panel p-3 rounded-xl relative group">
                      <div className="flex items-center justify-between mb-2">
                        {/* Clickable Seek Timestamp Badge */}
                        <button
                          onClick={() => triggerPlayerSeek(note.timestamp)}
                          className="px-2 py-1 text-[10px] font-bold rounded bg-accent/20 text-accent hover:bg-accent/30 border border-accent/30 transition flex items-center gap-1"
                        >
                          <Clock size={10} />
                          <span>{formatSeconds(note.timestamp)}</span>
                        </button>

                        {/* Delete Note */}
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1"
                          title="Delete note"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <p className="text-xs text-zinc-200 leading-relaxed whitespace-pre-line">{note.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DESCRIPTION */}
          {activeTab === 'desc' && (
            <div className="space-y-4">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block">Course Info</span>
              <div className="p-3 bg-zinc-900/50 border border-border rounded-xl space-y-2 text-xs">
                <div><span className="text-zinc-500">Instructor:</span> <span className="text-zinc-300 font-semibold">{course.channelName}</span></div>
                <div><span className="text-zinc-500">Origin:</span> <span className="text-zinc-300 font-semibold">{course.type === 'youtube' ? 'YouTube Public API' : 'Udemy manual tracking'}</span></div>
              </div>

              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block mt-6">Video Description</span>
              <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">
                {lesson.description || 'No description available for this lecture.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
