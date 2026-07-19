import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFocusFlow } from '../hooks/useFocusFlow';
import { useUIStore } from '../hooks/useUIStore';
import { ArrowLeft, BookOpen, FileText, CheckCircle2, Circle, Clock, Plus, Trash2, Play, Pause, Maximize, Volume2, VolumeX, Gauge } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/FocusFlowDB';

const SPEED_OPTIONS = [0.5, 1, 1.25, 1.5, 2];

/**
 * Formats a duration in seconds to standard MM:SS or HH:MM:SS string.
 * @param {number} totalSeconds Total play duration.
 * @returns {string} Formatted duration.
 */
function formatSeconds(totalSeconds) {
  if (isNaN(totalSeconds) || totalSeconds === null) return '0:00';
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
 * Wraps official YouTube IFrame Player API with custom controls
 * to eliminate "More Videos" overlays, recommendation links, and ad clicks.
 * Features a lazy-load play-on-click thumbnail placeholder and speed controls.
 * @returns {React.JSX.Element}
 */
export default function Watch() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  
  const playerContainerRef = useRef(null);
  const progressBarRef = useRef(null);
  
  const { courses, lessons, progressList, saveProgress } = useFocusFlow();
  const { activeLessonId, isPlaying, seekRequestTime, setActiveLessonId, setIsPlaying, triggerPlayerSeek } = useUIStore();

  const [activeTab, setActiveTab] = useState('syllabus');
  const [noteContent, setNoteContent] = useState('');
  const [ytPlayer, setYtPlayer] = useState(null);
  
  // Lazy Loading / Click-to-Play State
  const [isPlayerTriggered, setIsPlayerTriggered] = useState(false);

  // Custom Player states
  const [playerCurrentTime, setPlayerCurrentTime] = useState(0);
  const [playerDuration, setPlayerDuration] = useState(0);
  const [playerMuted, setPlayerMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Retrieve course and lesson metadata
  const course = courses.find(c => c.id === courseId);
  const lesson = lessons.find(l => l.courseId === courseId && l.id === lessonId);
  const courseLessons = lessons
    .filter(l => l.courseId === courseId)
    .sort((a, b) => a.index - b.index);

  // Reactive Dexie query for timestamped notes
  const lessonNotes = useLiveQuery(() => 
    db.notes.where({ courseId, lessonId }).sortBy('timestamp')
  , [courseId, lessonId]) || [];

  // Reset play states when navigating to a new lesson
  useEffect(() => {
    if (lessonId) {
      setActiveLessonId(lessonId);
      setPlayerCurrentTime(0);
      setPlayerDuration(0);
      setIsPlayerTriggered(false); // require click on new lesson
      setPlaybackSpeed(1);
    }
  }, [lessonId]);

  // Handle player seek trigger changes from Zustand store
  useEffect(() => {
    if (ytPlayer && seekRequestTime !== null) {
      // If player wasn't initialized yet, trigger it
      if (!isPlayerTriggered) {
        setIsPlayerTriggered(true);
        // Wait for player to load before seeking
        setTimeout(() => {
          if (ytPlayer) {
            ytPlayer.seekTo(seekRequestTime, true);
            ytPlayer.playVideo();
          }
        }, 1000);
      } else {
        ytPlayer.seekTo(seekRequestTime, true);
        ytPlayer.playVideo();
      }
      triggerPlayerSeek(null);
    }
  }, [seekRequestTime, ytPlayer, isPlayerTriggered]);

  // YouTube IFrame Player API Initialization
  // Runs ONLY after the user clicks the play/thumbnail overlay (isPlayerTriggered === true)
  useEffect(() => {
    if (!lesson || lesson.type !== 'youtube' || !isPlayerTriggered) return;

    let playerInstance = null;
    let progressTimer = null;
    let uiSyncTimer = null;

    const currentProgress = progressList.find(p => p.id === `${courseId}_${lessonId}`);
    const resumeSeconds = currentProgress && !currentProgress.completed ? Math.max(0, currentProgress.watchTime - 2) : 0;

    const onPlayerReady = (event) => {
      const player = event.target;
      setYtPlayer(player);
      setPlayerDuration(player.getDuration());
      setPlayerMuted(player.isMuted());
      player.setPlaybackRate(playbackSpeed);

      // Auto-start video when user clicked the thumbnail placeholder
      player.seekTo(resumeSeconds, true);
      player.playVideo();
    };

    const startProgressTracking = (player) => {
      if (progressTimer) clearInterval(progressTimer);
      
      progressTimer = setInterval(() => {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        if (duration > 0) {
          const isCompleted = (currentTime / duration) >= 0.90;
          saveProgress(courseId, lessonId, currentTime, isCompleted);
        }
      }, 10000);

      uiSyncTimer = setInterval(() => {
        setPlayerCurrentTime(player.getCurrentTime());
      }, 100);
    };

    const stopProgressTracking = () => {
      if (progressTimer) {
        clearInterval(progressTimer);
        progressTimer = null;
      }
      if (uiSyncTimer) {
        clearInterval(uiSyncTimer);
        uiSyncTimer = null;
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
        
        if (state === window.YT.PlayerState.PAUSED) {
          const currentTime = event.target.getCurrentTime();
          const duration = event.target.getDuration();
          const isCompleted = duration > 0 ? (currentTime / duration) >= 0.90 : false;
          saveProgress(courseId, lessonId, currentTime, isCompleted);
        }

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
          rel: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          controls: 0, // hide native controls to avoid "More videos"
          disablekb: 1,
          fs: 0,
          cc_load_policy: 0 // Disable captions by default
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange
        }
      });
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = initializePlayer;
    } else {
      initializePlayer();
    }

    return () => {
      stopProgressTracking();
      if (playerInstance) {
        playerInstance.destroy();
      }
      setYtPlayer(null);
      setIsPlaying(false);
    };
  }, [lessonId, courseId, isPlayerTriggered]);

  // Sync fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!lesson || !course) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Lecture Details Not Found</h2>
        <Link to="/" className="text-primary hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  // Toggle play/pause
  const handlePlayPause = () => {
    if (!ytPlayer) return;
    if (isPlaying) {
      ytPlayer.pauseVideo();
    } else {
      ytPlayer.playVideo();
    }
  };

  // Toggle Mute
  const handleMuteToggle = () => {
    if (!ytPlayer) return;
    if (playerMuted) {
      ytPlayer.unMute();
      setPlayerMuted(false);
    } else {
      ytPlayer.mute();
      setPlayerMuted(true);
    }
  };

  // Cycle speed (0.5x -> 1x -> 1.25x -> 1.5x -> 2x)
  const handleSpeedCycle = () => {
    if (!ytPlayer) return;
    const currentIndex = SPEED_OPTIONS.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length;
    const nextSpeed = SPEED_OPTIONS[nextIndex];
    
    ytPlayer.setPlaybackRate(nextSpeed);
    setPlaybackSpeed(nextSpeed);
  };

  // Toggle Fullscreen
  const handleFullscreenToggle = () => {
    const container = playerContainerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => {
        console.error('Fullscreen Error:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Click seek timeline
  const handleProgressBarClick = (e) => {
    if (!ytPlayer || !progressBarRef.current || playerDuration === 0) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickedPercentage = clickX / width;
    const seekSeconds = clickedPercentage * playerDuration;

    ytPlayer.seekTo(seekSeconds, true);
    setPlayerCurrentTime(seekSeconds);
  };

  // Udemy toggle
  const udemyProgress = progressList.find(p => p.id === `${courseId}_${lessonId}`);
  const isUdemyCompleted = udemyProgress ? udemyProgress.completed : false;

  const handleUdemyToggle = async () => {
    await saveProgress(courseId, lessonId, isUdemyCompleted ? 0 : 2700, !isUdemyCompleted);
  };

  // Save note
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

  const handleDeleteNote = async (id) => {
    await db.notes.delete(id);
  };

  const progressPercent = playerDuration > 0 ? (playerCurrentTime / playerDuration) * 100 : 0;

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-background">
      {/* Left Area: Video Player Panel */}
      <div className="flex-1 bg-black flex flex-col min-w-0 h-full relative">
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
        <div 
          ref={playerContainerRef} 
          className="flex-1 relative bg-zinc-950 flex items-center justify-center group/player"
        >
          {lesson.type === 'youtube' ? (
            <div className="w-full h-full relative">
              {/* Play-on-Click Lazy Load Thumbnail Placeholder */}
              {!isPlayerTriggered ? (
                <div 
                  onClick={() => setIsPlayerTriggered(true)}
                  className="w-full h-full absolute inset-0 cursor-pointer flex items-center justify-center bg-zinc-900 group/thumb z-10"
                >
                  <img 
                    src={lesson.thumbnailUrl} 
                    alt={lesson.title} 
                    className="w-full h-full object-cover opacity-75 group-hover/thumb:scale-[1.02] transition duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover/thumb:bg-black/30 transition duration-300" />
                  
                  {/* Glowing Play Circle */}
                  <div className="w-20 h-20 rounded-full flex items-center justify-center bg-primary text-white border-2 border-white/20 shadow-2xl shadow-primary/45 group-hover/thumb:scale-110 transition duration-300 absolute z-20">
                    <Play size={32} fill="currentColor" className="ml-1" />
                  </div>
                </div>
              ) : (
                /* YouTube Iframe element */
                <div id="yt-player-iframe" className="w-full h-full absolute inset-0 pointer-events-none" />
              )}

              {/* Transparent pointer-events overlay */}
              {isPlayerTriggered && (
                <div 
                  onClick={handlePlayPause}
                  className="w-full h-[calc(100%-48px)] absolute inset-x-0 top-0 cursor-pointer z-10 bg-transparent"
                />
              )}

              {/* Custom Controls Bar overlay */}
              {isPlayerTriggered && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/90 to-transparent p-4 flex flex-col gap-3 z-20 opacity-0 group-hover/player:opacity-100 transition-opacity duration-300">
                  
                  {/* Seek Timeline */}
                  <div 
                    ref={progressBarRef}
                    onClick={handleProgressBarClick}
                    className="w-full h-1.5 bg-zinc-800 rounded-full cursor-pointer relative overflow-hidden group/timeline hover:h-2 transition-all"
                  >
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-75"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Control Actions Row */}
                  <div className="flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-4">
                      {/* Play/Pause Button */}
                      <button 
                        onClick={handlePlayPause} 
                        className="p-1 text-zinc-300 hover:text-white transition cursor-pointer"
                      >
                        {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                      </button>

                      {/* Mute Button */}
                      <button 
                        onClick={handleMuteToggle}
                        className="p-1 text-zinc-300 hover:text-white transition cursor-pointer"
                      >
                        {playerMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </button>

                      {/* Speed Cycle Button */}
                      <button
                        onClick={handleSpeedCycle}
                        className="px-2 py-1 rounded bg-zinc-800 border border-border text-[10px] font-bold text-zinc-300 hover:text-white transition cursor-pointer flex items-center gap-1"
                        title="Change Playback Speed"
                      >
                        <Gauge size={12} />
                        <span>{playbackSpeed === 1 ? 'Normal' : `${playbackSpeed}x`}</span>
                      </button>

                      {/* Elapsed Time */}
                      <span className="font-semibold text-zinc-400 select-none">
                        {formatSeconds(playerCurrentTime)} / {formatSeconds(playerDuration)}
                      </span>
                    </div>

                    {/* Fullscreen Button */}
                    <button 
                      onClick={handleFullscreenToggle}
                      className="p-1 text-zinc-300 hover:text-white transition cursor-pointer"
                    >
                      <Maximize size={16} />
                    </button>
                  </div>

                </div>
              )}
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
