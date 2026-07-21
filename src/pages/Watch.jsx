import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFocusFlow } from '../hooks/useFocusFlow';
import { useUIStore } from '../hooks/useUIStore';
import { ArrowLeft, BookOpen, FileText, CheckCircle2, Circle, Clock, Plus, Trash2, Play, Pause, Maximize, Volume2, VolumeX, Gauge, Type } from 'lucide-react';
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
 * YouTube-style layout: strict 16:9 aspect ratio video player at top,
 * scrollable title/notes/description below, syllabus checklist on the right.
 * @returns {React.JSX.Element}
 */
export default function Watch() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  
  const playerContainerRef = useRef(null);
  const progressBarRef = useRef(null);
  
  const { courses, lessons, progressList, saveProgress } = useFocusFlow();
  const { activeLessonId, isPlaying, seekRequestTime, setActiveLessonId, setIsPlaying, triggerPlayerSeek } = useUIStore();

  const [activeTab, setActiveTab] = useState('notes'); // default to notes below video
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
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  
  // Auto-hide controls state
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const mouseTimerRef = useRef(null);

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
      if (!isPlayerTriggered) {
        setIsPlayerTriggered(true);
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
  useEffect(() => {
    if (!lesson || lesson.type !== 'youtube' || !isPlayerTriggered) return;

    let playerInstance = null;
    let progressTimer = null;
    let uiSyncTimer = null;
    let captionTimeout1 = null;
    let captionTimeout2 = null;

    const currentProgress = progressList.find(p => p.id === `${courseId}_${lessonId}`);
    const resumeSeconds = currentProgress && !currentProgress.completed ? Math.max(0, currentProgress.watchTime - 2) : 0;

    const forceCaptionsOff = (player) => {
      try {
        if (player && typeof player.unloadModule === 'function') {
          player.unloadModule('captions');
          player.unloadModule('cc');
          player.setOption('captions', 'track', {});
          player.setOption('captions', 'reload', true);
        }
      } catch (_) {}
      setCaptionsEnabled(false);
    };

    const onPlayerReady = (event) => {
      const player = event.target;
      setYtPlayer(player);
      setPlayerDuration(player.getDuration());
      setPlayerMuted(player.isMuted());
      player.setPlaybackRate(playbackSpeed);

      // Force captions OFF immediately
      forceCaptionsOff(player);
      // Also force off after a short delay
      captionTimeout1 = setTimeout(() => forceCaptionsOff(player), 500);
      captionTimeout2 = setTimeout(() => forceCaptionsOff(player), 1500);

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
        // Force captions off again when playback actually starts
        forceCaptionsOff(event.target);
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
          controls: 0, 
          disablekb: 1,
          fs: 0,
          cc_load_policy: 0 
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
      if (captionTimeout1) clearTimeout(captionTimeout1);
      if (captionTimeout2) clearTimeout(captionTimeout2);
      if (playerInstance) {
        try {
          playerInstance.destroy();
        } catch (_) {}
      }
      setYtPlayer(null);
      setIsPlaying(false);
    };
  }, [lessonId, courseId, isPlayerTriggered]);

  // Cleanup mouse timer on unmount
  useEffect(() => {
    return () => {
      if (mouseTimerRef.current) {
        clearTimeout(mouseTimerRef.current);
      }
    };
  }, []);

  // Sync fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard controls
  useEffect(() => {
    if (!isPlayerTriggered) return;

    const handleKeyDown = (e) => {
      // Don't hijack shortcuts when user is typing in inputs/textareas
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;

      switch (e.key) {
        case ' ':
        case 'k':
        case 'K':
          e.preventDefault();
          if (ytPlayer) {
            if (isPlaying) ytPlayer.pauseVideo();
            else ytPlayer.playVideo();
          }
          break;
        case 'ArrowLeft':
        case 'j':
        case 'J':
          e.preventDefault();
          if (ytPlayer) {
            const t = Math.max(0, ytPlayer.getCurrentTime() - 5);
            ytPlayer.seekTo(t, true);
            setPlayerCurrentTime(t);
          }
          break;
        case 'ArrowRight':
        case 'l':
        case 'L':
          e.preventDefault();
          if (ytPlayer) {
            const t = Math.min(playerDuration, ytPlayer.getCurrentTime() + 5);
            ytPlayer.seekTo(t, true);
            setPlayerCurrentTime(t);
          }
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          if (ytPlayer) {
            if (playerMuted) { ytPlayer.unMute(); setPlayerMuted(false); }
            else { ytPlayer.mute(); setPlayerMuted(true); }
          }
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          if (playerContainerRef.current) {
            if (!document.fullscreenElement) playerContainerRef.current.requestFullscreen();
            else document.exitFullscreen();
          }
          break;
        case 'c':
        case 'C':
          e.preventDefault();
          if (ytPlayer) {
            if (captionsEnabled) { ytPlayer.unloadModule('captions'); setCaptionsEnabled(false); }
            else { ytPlayer.loadModule('captions'); setCaptionsEnabled(true); }
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [ytPlayer, isPlaying, playerMuted, playerDuration, captionsEnabled, isPlayerTriggered]);

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

  // Toggle CC (Captions)
  const handleCCToggle = () => {
    if (!ytPlayer) return;
    if (captionsEnabled) {
      ytPlayer.unloadModule('captions');
      setCaptionsEnabled(false);
    } else {
      ytPlayer.loadModule('captions');
      setCaptionsEnabled(true);
    }
  };

  // Mouse idle detection for controls — hide quickly when mouse stops
  const handleMouseMove = () => {
    setIsControlsVisible(true);
    if (mouseTimerRef.current) clearTimeout(mouseTimerRef.current);
    mouseTimerRef.current = setTimeout(() => {
      if (isPlaying) setIsControlsVisible(false);
    }, 800);
  };

  const handleMouseLeave = () => {
    if (mouseTimerRef.current) clearTimeout(mouseTimerRef.current);
    if (isPlaying) setIsControlsVisible(false);
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
      {/* Left Panel: Scrollable main content containing Player and Metadata details (YouTube Style) */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto bg-zinc-950/20">
        
        {/* Navigation header */}
        <div className="flex items-center gap-4 px-6 py-4 bg-zinc-950/80 border-b border-border sticky top-0 z-30 backdrop-blur">
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

        {/* Player Container: Framed YouTube-style container with rounded borders */}
        <div className="w-full max-w-5xl mx-auto mt-6 px-6">
          <div 
            ref={playerContainerRef} 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`w-full aspect-video relative bg-[#1E1E1E] rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 group/player border border-border ${!isControlsVisible && isPlaying ? 'cursor-none' : ''}`}
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
                    className="w-full h-full object-cover opacity-70 group-hover/thumb:scale-[1.01] transition duration-500"
                  />
                  <div className="absolute inset-0 bg-black/35 group-hover/thumb:bg-black/25 transition duration-300" />
                  
                  {/* Glowing Play Circle */}
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-primary text-white border-2 border-white/20 shadow-2xl shadow-primary/45 group-hover/thumb:scale-110 transition duration-300 absolute z-20">
                    <Play size={24} fill="currentColor" className="ml-1" />
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
                  className={`w-full h-[calc(100%-48px)] absolute inset-x-0 top-0 z-10 bg-transparent ${!isControlsVisible && isPlaying ? 'cursor-none' : 'cursor-pointer'}`}
                />
              )}

              {/* Custom Controls Bar overlay */}
              {isPlayerTriggered && (
                <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/90 to-transparent p-4 flex flex-col gap-3 z-20 transition-opacity duration-300 ${isControlsVisible || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
                  
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

                    <div className="flex items-center gap-4">
                      {/* CC / Captions Button */}
                      <button 
                        onClick={handleCCToggle}
                        className={`p-1.5 transition cursor-pointer rounded flex items-center gap-1 ${captionsEnabled ? 'text-white bg-primary/20 border-b-2 border-primary' : 'text-zinc-400 hover:text-white'}`}
                        title="Toggle Captions (CC)"
                      >
                        <Type size={16} />
                      </button>

                      {/* Fullscreen Button */}
                      <button 
                        onClick={handleFullscreenToggle}
                        className="p-1 text-zinc-300 hover:text-white transition cursor-pointer"
                      >
                        <Maximize size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Manual Udemy course content tracker shell
            <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center space-y-6 h-full justify-center">
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

        {/* Video details & interactive workspaces directly below player */}
        <div className="px-6 py-6 space-y-6 max-w-5xl w-full mx-auto">
          <div className="space-y-2 border-b border-border pb-4">
            <h1 className="text-2xl font-bold text-white tracking-tight">{lesson.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
              <div>
                <span className="text-zinc-600">Instructor:</span> <span className="text-zinc-300 font-semibold">{course.channelName}</span>
              </div>
              <span className="text-zinc-700">•</span>
              <div>
                <span className="text-zinc-600">Origin:</span> <span className="text-zinc-300 font-semibold">{course.type === 'youtube' ? 'YouTube Public API' : 'Udemy manual tracking'}</span>
              </div>
            </div>
          </div>

          {/* Interactive Workspace Panel (Notes and Description) */}
          <div className="space-y-4">
            <div className="flex border-b border-border text-xs font-bold uppercase tracking-wider">
              {lesson.type === 'youtube' && (
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`pb-3 pr-6 border-b-2 transition ${
                    activeTab === 'notes' ? 'border-primary text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Notes ({lessonNotes.length})
                </button>
              )}
              <button
                onClick={() => setActiveTab('desc')}
                className={`pb-3 px-6 border-b-2 transition ${
                  activeTab === 'desc' ? 'border-primary text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Video Description
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="py-2">
              {/* NOTES TAB */}
              {activeTab === 'notes' && lesson.type === 'youtube' && (
                <div className="space-y-6">
                  {/* Form Input */}
                  <form onSubmit={handleSaveNote} className="flex gap-3 items-center">
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Type a timestamped note... (Press Enter to Save)"
                      className="flex-1 h-[50px] p-3 bg-zinc-900 border border-border rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-primary transition resize-none"
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
                      className="px-5 py-3 h-[50px] bg-primary disabled:opacity-50 text-white rounded-xl text-xs font-bold hover:bg-primary/95 transition flex items-center justify-center gap-2 flex-shrink-0"
                    >
                      <Plus size={16} />
                      <span>Note {ytPlayer && `[${formatSeconds(ytPlayer.getCurrentTime())}]`}</span>
                    </button>
                  </form>

                  {/* Notes Timeline List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lessonNotes.length === 0 ? (
                      <p className="text-xs text-zinc-500 py-4 col-span-2">No notes written for this video yet.</p>
                    ) : (
                      lessonNotes.map((note) => (
                        <div key={note.id} className="glass-panel p-4 rounded-xl relative group border border-border">
                          <div className="flex items-center justify-between mb-2">
                            {/* Clickable Seek Timestamp Badge */}
                            <button
                              onClick={() => triggerPlayerSeek(note.timestamp)}
                              className="px-2.5 py-1 text-[10px] font-bold rounded bg-accent/20 text-accent hover:bg-accent/30 border border-accent/30 transition flex items-center gap-1 cursor-pointer"
                            >
                              <Clock size={10} />
                              <span>{formatSeconds(note.timestamp)}</span>
                            </button>

                            {/* Delete Note */}
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1 cursor-pointer"
                              title="Delete note"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-line">{note.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* DESCRIPTION TAB */}
              {activeTab === 'desc' && (
                <div className="glass-panel p-5 rounded-xl border border-border">
                  <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">
                    {lesson.description || 'No description available for this lecture.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Right Sidebar: Syllabus Checklist (Full Height, clean scrollable syllabus playlist) */}
      <div className="w-full lg:w-[380px] bg-zinc-950 border-l border-border flex flex-col flex-shrink-0 h-full">
        <div className="px-5 py-4 border-b border-border bg-zinc-950 flex items-center gap-2">
          <BookOpen size={16} className="text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">Course Syllabus</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
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
                className={`w-full text-left p-3 rounded-xl flex items-center justify-between border transition group ${
                  isActive 
                    ? 'bg-secondary/60 border-primary/45 text-white' 
                    : 'bg-transparent border-transparent hover:bg-zinc-900/50 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {isCompleted ? (
                    <CheckCircle2 className="text-accent flex-shrink-0" size={16} fill="currentColor" />
                  ) : (
                    <Circle className="text-zinc-800 group-hover:text-zinc-600 flex-shrink-0" size={16} />
                  )}
                  <div className="min-w-0">
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold block mb-0.5">
                      Lecture {item.index}
                    </span>
                    <span className="text-xs font-medium truncate block">{item.title}</span>
                  </div>
                </div>
                <span className="text-[10px] text-zinc-600 font-medium flex-shrink-0 flex items-center gap-1 ml-2">
                  <Clock size={10} />
                  <span>{item.duration}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
