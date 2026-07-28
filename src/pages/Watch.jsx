import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFocusFlow } from '../hooks/useFocusFlow';
import { useUIStore } from '../hooks/useUIStore';
import { ArrowLeft, BookOpen, FileText, CheckCircle2, Circle, Clock, Plus, Trash2, Play, Pause, Maximize, Volume2, VolumeX, Gauge, Type, Sliders, Target, Info } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/FocusFlowDB';
import { createNote, deleteNote, saveProgress, setLessonCompletion } from '../services/dataCommands';
import PracticeTab from '../components/PracticeTab';
import ReadingTab from '../components/ReadingTab';
import CategoryIcon from '../components/CategoryIcon';
import jsTopicPractice from '../data/jsTopicPractice.json';

const LESSON_TOPIC_MAP = {
  'yY0bKZNYmJs': 'cat-1-variables-datatypes',
  '-9knnv97wSc': 'cat-1-variables-datatypes',
  'X7hDBhd_L5U': 'cat-1-variables-datatypes',
  'N9el4APFtAo': 'cat-1-variables-datatypes',
  'giP2uXMlv4c': 'cat-1-variables-datatypes',
  'suMvZWjjKbo': 'cat-2-memory-strings-math',
  '7gwc-1czolw': 'cat-2-memory-strings-math',
  'fozwNnFunlo': 'cat-2-memory-strings-math',
  '_KqpeDc47Ro': 'cat-2-memory-strings-math',
  'tGLCuoumaGY': 'cat-2-memory-strings-math',
  'cejBux2gtEE': 'cat-3-arrays-objects-json',
  'm6azhgyCi-k': 'cat-3-arrays-objects-json',
  'vVYOHmqQDCU': 'cat-3-arrays-objects-json',
  '4lb2pXWWXJI': 'cat-3-arrays-objects-json',
  'AViTh83k-IE': 'cat-3-arrays-objects-json',
  'Bn56WahG_t0': 'cat-4-functions-scopes-this',
  't7ZHPhgdA4U': 'cat-4-functions-scopes-this',
  'cHHU0jXfjKY': 'cat-4-functions-scopes-this',
  'eWwge2YpHhc': 'cat-4-functions-scopes-this',
  '9ksqBa8_txM': 'cat-4-functions-scopes-this',
  'GAIbn16Iytc': 'cat-5-execution-callstack-control',
  'ByhtOgF6uYM': 'cat-5-execution-callstack-control',
  '0P_YvC6Gg0c': 'cat-5-execution-callstack-control',
  'Y1cpFsXrEgY': 'cat-5-execution-callstack-control',
  'w3Q55-l47P0': 'cat-5-execution-callstack-control',
  'M0YImBHQsWU': 'cat-6-hofs-filter-map-reduce-dom',
  '9MfwYoWKKVE': 'cat-6-hofs-filter-map-reduce-dom',
  'DcjNkHtDj8A': 'cat-6-hofs-filter-map-reduce-dom',
  'Ab6K57WjWTE': 'cat-6-hofs-filter-map-reduce-dom',
  'xAvTgCsCHLs': 'cat-6-hofs-filter-map-reduce-dom',
  'VQlY-X_eeTE': 'cat-7-dom-events-async-basics',
  'EGqHVjU-fas': 'cat-7-dom-events-async-basics',
  '_ALUMTa8BAE': 'cat-7-dom-events-async-basics',
  'zgt5oTD3rRc': 'cat-7-dom-events-async-basics',
  'efrW5-IYoCU': 'cat-7-dom-events-async-basics',
  'pDPAcYdSse8': 'cat-8-promises-fetch-prototypes',
  'NJwRQgsu1Q8': 'cat-8-promises-fetch-prototypes',
  'Rive84an6Lc': 'cat-8-promises-fetch-prototypes',
  'pN-Qmv4zBcI': 'cat-8-promises-fetch-prototypes',
  'uMI5cNeHTOc': 'cat-8-promises-fetch-prototypes',
  '-owpuf4lbyU': 'cat-9-classes-callbind-descriptors',
  'u6mVHkMpoMk': 'cat-9-classes-callbind-descriptors',
  '75dMiOY_4ac': 'cat-9-classes-callbind-descriptors',
  'jss2rL9kv6s': 'cat-9-classes-callbind-descriptors',
  't6vLhF-iSxQ': 'cat-9-classes-callbind-descriptors',
  'VaH09NXQZ58': 'cat-10-closures-v8-internals',
  'z9PINyinqwo': 'cat-10-closures-v8-internals',
  'ZRS485LxX0s': 'cat-10-closures-v8-internals',
  'q8EevlEpQ2A': 'cat-git-1-intro',
  'git_ch_1': 'cat-git-1-intro',
  'git_ch_2': 'cat-git-2-config',
  'git_ch_3': 'cat-git-3-staging',
  'git_ch_4': 'cat-git-4-commits',
  'git_ch_5': 'cat-git-5-branching',
  'git_ch_6': 'cat-git-6-remotes',
  'git_ch_7': 'cat-git-7-prs-open-source',
  'git_ch_8': 'cat-git-8-conflicts-rebase'
};

const SPEED_OPTIONS = [0.5, 1, 1.25, 1.5, 2];
const QUALITY_OPTIONS = [
  { label: 'Auto', value: 'auto' },
  { label: '4K', value: 'highres' },
  { label: '2K', value: 'hd1440' },
  { label: '1080p', value: 'hd1080' },
  { label: '720p', value: 'hd720' },
  { label: '480p', value: 'large' },
  { label: '360p', value: 'medium' }
];

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
  
  const { courses, lessons, progressList, practiceProgressList } = useFocusFlow();
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
  const [qualityLevel, setQualityLevel] = useState('auto');
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

  // Reset play states when navigating to a new lesson so thumbnail displays cleanly
  useEffect(() => {
    if (lessonId) {
      setActiveLessonId(lessonId);
      setPlayerCurrentTime(0);
      setPlayerDuration(0);
      setIsPlayerTriggered(false); // Display thumbnail preview on lesson load/switch
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

      // Start time: resume seconds first, or chapter startTimestamp, or 0
      const startSec = resumeSeconds > 0 
        ? resumeSeconds 
        : (lesson.startTimestamp || 0);

      player.seekTo(startSec, true);
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

      let lastStep = -1;
      uiSyncTimer = setInterval(() => {
        if (player && typeof player.getCurrentTime === 'function') {
          const t = player.getCurrentTime();
          const dur = player.getDuration();
          if (dur > 0) {
            setPlayerDuration(dur);
          }
          const step = Math.floor(t * 4); // 250ms threshold
          if (step !== lastStep) {
            lastStep = step;
            setPlayerCurrentTime(t);
          }
        }
      }, 200);
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

    const targetVideoId = lesson.videoId || lessonId;
    const startSec = resumeSeconds > 0 ? resumeSeconds : (lesson.startTimestamp || 0);

    const initializePlayer = () => {
      // If player instance already exists, load new video directly
      if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
        ytPlayer.loadVideoById({
          videoId: targetVideoId,
          startSeconds: startSec
        });
        ytPlayer.playVideo();
        return;
      }

      playerInstance = new window.YT.Player('yt-player-iframe', {
        height: '100%',
        width: '100%',
        videoId: targetVideoId,
        playerVars: {
          start: startSec,
          rel: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          controls: 0, 
          disablekb: 1,
          fs: 0,
          autoplay: 1,
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
      setTimeout(initializePlayer, 50);
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

  // Toggle play/pause cleanly
  const handlePlayPause = () => {
    if (!ytPlayer) return;
    try {
      const state = typeof ytPlayer.getPlayerState === 'function' ? ytPlayer.getPlayerState() : -1;
      if (state === 1 || isPlaying) { // 1 = PLAYING
        ytPlayer.pauseVideo();
        setIsPlaying(false);
      } else {
        ytPlayer.playVideo();
        setIsPlaying(true);
      }
    } catch (_) {
      setIsPlaying(prev => !prev);
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

  // Cycle Video Quality (Auto -> 4K -> 2K -> 1080p -> 720p -> 480p -> 360p)
  const handleQualityCycle = () => {
    if (!ytPlayer) return;
    const currentIndex = QUALITY_OPTIONS.findIndex(q => q.value === qualityLevel);
    const nextIndex = (currentIndex + 1) % QUALITY_OPTIONS.length;
    const nextQuality = QUALITY_OPTIONS[nextIndex];
    
    try {
      ytPlayer.setPlaybackQuality(nextQuality.value);
    } catch (_) {}
    setQualityLevel(nextQuality.value);
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
    await setLessonCompletion(courseId, lessonId, !isUdemyCompleted, isUdemyCompleted ? 0 : 2700);
  };

  // Save note
  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    let timestamp = 0;
    if (ytPlayer && lesson.type === 'youtube') {
      timestamp = Math.round(ytPlayer.getCurrentTime());
    }

    await createNote({
      courseId,
      lessonId,
      timestamp,
      content: noteContent.trim()
    });

    setNoteContent('');
  };

  const handleDeleteNote = async (id) => {
    await deleteNote(id);
  };

  const progressPercent = playerDuration > 0 ? (playerCurrentTime / playerDuration) * 100 : 0;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen h-auto lg:h-screen overflow-y-auto lg:overflow-hidden bg-background">
      {/* Left Panel: Scrollable main content (Maximized Player + Below Syllabus) */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto bg-zinc-950/20 pb-4 sm:pb-6">
        
        {/* Navigation header */}
        <div className="flex items-center gap-3 px-3 sm:px-6 py-2.5 sm:py-3.5 bg-zinc-950/95 border-b border-border sticky top-0 z-30 backdrop-blur-xl">
          <Link to={`/courses/${courseId}`} className="text-zinc-400 hover:text-white transition p-1 rounded-lg hover:bg-zinc-900 flex-shrink-0" title="Back to Course Detail">
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold truncate">
              {course.title}
            </span>
            <h2 className="text-xs sm:text-sm font-semibold text-white truncate">{lesson.title}</h2>
          </div>
        </div>

        {/* Player Container: Maximized Video View */}
        <div className="w-full max-w-7xl mx-auto mt-1 sm:mt-4 px-1 sm:px-6">
          <div 
            ref={playerContainerRef} 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`w-full aspect-video min-h-[210px] sm:min-h-[300px] relative bg-[#1E1E1E] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 group/player border border-border ${!isControlsVisible && isPlaying ? 'cursor-none' : ''}`}
          >
          {lesson.type === 'youtube' ? (
            <div className="w-full h-full relative">
              {/* Play-on-Click Lazy Load Thumbnail Placeholder */}
              {!isPlayerTriggered ? (
                <div 
                  onClick={() => setIsPlayerTriggered(true)}
                  className="w-full h-full absolute inset-0 cursor-pointer flex items-center justify-center bg-zinc-900 group/thumb z-20"
                >
                  <img 
                    src={lesson.thumbnailUrl || `https://i.ytimg.com/vi/${lesson.videoId || lessonId}/hqdefault.jpg`} 
                    alt={lesson.title} 
                    className="w-full h-full object-cover opacity-85 group-hover/thumb:scale-[1.01] transition duration-500"
                  />
                  <div className="absolute inset-0 bg-black/35 group-hover/thumb:bg-black/20 transition duration-300" />
                  
                  {/* Glowing Play Circle */}
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-primary text-white border-2 border-white/20 shadow-2xl shadow-primary/45 group-hover/thumb:scale-110 transition duration-300 absolute z-30">
                    <Play size={24} fill="currentColor" className="ml-1" />
                  </div>
                </div>
              ) : (
                /* YouTube IFrame API Target Element */
                <div id="yt-player-iframe" className="w-full h-full absolute inset-0 z-10" />
              )}

              {/* Click overlay for play/pause toggle */}
              {isPlayerTriggered && (
                <div 
                  onClick={handlePlayPause}
                  className={`w-full h-[calc(100%-60px)] absolute inset-x-0 top-0 z-20 bg-transparent ${!isControlsVisible && isPlaying ? 'cursor-none' : 'cursor-pointer'}`}
                />
              )}

              {/* Custom Controls Bar overlay */}
              {isPlayerTriggered && (
                <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/90 to-transparent p-4 flex flex-col gap-3 z-20 transition-opacity duration-300 ${isControlsVisible || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
                  
                  {/* Seek Timeline Progress Bar with Chapter Timestamp Markers */}
                  <div 
                    ref={progressBarRef}
                    onClick={handleProgressBarClick}
                    className="w-full h-2.5 bg-zinc-800/90 rounded-full cursor-pointer relative overflow-visible group/timeline border border-zinc-700/50"
                  >
                    {/* Progress Line Fill */}
                    <div 
                      className="h-full bg-gradient-to-r from-primary via-accent to-yellow-400 rounded-full transition-all duration-75 shadow-lg shadow-primary/30"
                      style={{ width: `${progressPercent}%` }}
                    />

                    {/* Interactive Chapter Timestamp Markers on Progress Bar */}
                    {playerDuration > 0 && lesson.chapters && lesson.chapters.map((ch, idx) => {
                      const leftPct = Math.min(100, Math.max(0, (ch.timestamp / playerDuration) * 100));
                      return (
                        <div 
                          key={idx}
                          style={{ left: `${leftPct}%` }}
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerPlayerSeek(ch.timestamp);
                          }}
                          className="absolute top-1/2 -translate-y-1/2 -ml-1 w-2.5 h-2.5 rounded-full bg-white border-2 border-primary shadow-md hover:scale-150 transition-transform group/marker z-30 cursor-pointer"
                        >
                          {/* Chapter Marker Hover Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/marker:flex flex-col items-center pointer-events-none z-40 whitespace-nowrap">
                            <div className="px-2.5 py-1 rounded-md bg-zinc-950 text-white border border-primary/40 text-[10px] font-bold shadow-xl flex items-center gap-1.5">
                              <span className="text-primary font-mono">⏱️ {ch.formattedTime}</span>
                              <span className="text-zinc-300 font-semibold">{ch.title}</span>
                            </div>
                            <div className="w-1.5 h-1.5 bg-zinc-950 rotate-45 border-r border-b border-primary/40 -mt-1" />
                          </div>
                        </div>
                      );
                    })}
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

                      {/* Quality / Resolution Cycle Button */}
                      <button
                        onClick={handleQualityCycle}
                        className="px-2 py-1 rounded bg-zinc-800 border border-border text-[10px] font-bold text-zinc-300 hover:text-white transition cursor-pointer flex items-center gap-1"
                        title="Change Video Quality / Resolution"
                      >
                        <Sliders size={12} />
                        <span>{QUALITY_OPTIONS.find(q => q.value === qualityLevel)?.label || 'Auto'}</span>
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

        {/* Video Details Header */}
        <div className="px-6 py-4 space-y-3 max-w-7xl w-full mx-auto border-b border-border/50">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{lesson.title}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
            <div>
              <span className="text-zinc-600">Instructor:</span> <span className="text-zinc-300 font-semibold">{course.channelName}</span>
            </div>
            <span className="text-zinc-700">•</span>
            <div>
              <span className="text-zinc-600">Origin:</span> <span className="text-zinc-300 font-semibold">{course.type === 'youtube' ? 'YouTube Public API' : 'Udemy manual tracking'}</span>
            </div>
          </div>

          {/* Active Topic Module Highlight Banner */}
          {(() => {
            const catId = LESSON_TOPIC_MAP[lessonId] || 'cat-1-variables-datatypes';
            const catObj = jsTopicPractice.find(c => c.id === catId);
            if (!catObj) return null;

            return (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-primary/10 border border-primary/25 mt-2">
                <div className="flex items-center gap-3">
                  <CategoryIcon id={catObj.id} size={24} />
                  <div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Topic Practice Category</span>
                    <h4 className="text-xs font-bold text-white tracking-tight">{catObj.topic}</h4>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/practice')}
                  className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow cursor-pointer self-start sm:self-auto"
                >
                  <Target size={13} />
                  <span>Solve Practice Qs →</span>
                </button>
              </div>
            );
          })()}

          {/* Inline Video Description Section */}
          {lesson.description && (
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2 mt-3">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Video Description</span>
              <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {lesson.description}
              </p>
            </div>
          )}
        </div>

        {/* Mobile / Tablet Responsive Mode: Dedicated Study Tools Tabs (Notes, Reading, Info) - Rendered RIGHT AFTER VIDEO */}
        <div className="block lg:hidden px-4 sm:px-6 py-4 border-b border-border/50 bg-zinc-950/60">
          <div className="glass-panel rounded-2xl border border-border overflow-hidden">
            {/* Tab Selector Header */}
            <div className="flex border-b border-border bg-zinc-950 text-xs font-bold uppercase tracking-wider overflow-x-auto">
              {lesson.type === 'youtube' && (
                <>
                  <button
                    onClick={() => setActiveTab('notes')}
                    className={`py-3.5 px-4 border-b-2 transition cursor-pointer flex items-center gap-1.5 flex-1 justify-center ${
                      activeTab === 'notes' ? 'border-primary text-white bg-zinc-900/50' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <FileText size={14} className={activeTab === 'notes' ? 'text-primary' : ''} />
                    <span>Notes ({lessonNotes.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('reading')}
                    className={`py-3.5 px-4 border-b-2 transition cursor-pointer flex items-center gap-1.5 flex-1 justify-center ${
                      activeTab === 'reading' ? 'border-primary text-white bg-zinc-900/50' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <BookOpen size={14} className={activeTab === 'reading' ? 'text-primary' : ''} />
                    <span>Reading</span>
                  </button>
                </>
              )}
            </div>

            {/* Active Tab Body */}
            <div className="p-4 space-y-4 max-h-[450px] overflow-y-auto">
              {activeTab === 'notes' && lesson.type === 'youtube' && (
                <div className="space-y-4">
                  <form onSubmit={handleSaveNote} className="space-y-2">
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Type a timestamped note... (Press Enter to Save)"
                      className="w-full h-[70px] p-3 bg-zinc-900 border border-border rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-primary transition resize-none"
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
                      className="w-full py-2.5 bg-primary disabled:opacity-50 text-white rounded-xl text-xs font-bold hover:bg-primary/95 transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <Plus size={15} />
                      <span>Save Note {ytPlayer && `[${formatSeconds(ytPlayer.getCurrentTime())}]`}</span>
                    </button>
                  </form>

                  <div className="space-y-3 pt-2">
                    {lessonNotes.length === 0 ? (
                      <p className="text-xs text-zinc-500 py-6 text-center">No notes written for this video yet.</p>
                    ) : (
                      lessonNotes.map((note) => (
                        <div key={note.id} className="glass-panel p-3.5 rounded-xl relative group border border-border space-y-2">
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => triggerPlayerSeek(note.timestamp)}
                              className="px-2.5 py-1 text-[10px] font-bold rounded bg-accent/20 text-accent hover:bg-accent/30 border border-accent/30 transition flex items-center gap-1 cursor-pointer"
                            >
                              <Clock size={10} />
                              <span>{formatSeconds(note.timestamp)}</span>
                            </button>

                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1 cursor-pointer"
                              title="Delete note"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <p className="text-xs text-zinc-200 leading-relaxed whitespace-pre-line">{note.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'reading' && lesson.type === 'youtube' && (
                <ReadingTab lessonId={lessonId} />
              )}
            </div>
          </div>
        </div>

        {/* Interactive Timed Chapter Timeline Navigator (For Masterclass Videos like Git) */}
        {lesson.chapters && lesson.chapters.length > 0 && (
          <div className="px-6 py-5 max-w-7xl w-full mx-auto space-y-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-primary" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Interactive Masterclass Chapters ({lesson.chapters.length} Chapters)
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {lesson.chapters.map((ch, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIsPlayerTriggered(true);
                    triggerPlayerSeek(ch.timestamp);
                  }}
                  className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-primary/50 hover:bg-zinc-800/80 transition text-left space-y-1 group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider font-mono">
                      ⏱️ {ch.formattedTime}
                    </span>
                    <Play size={11} className="text-zinc-500 group-hover:text-primary transition" fill="currentColor" />
                  </div>
                  <p className="text-xs font-semibold text-zinc-200 truncate group-hover:text-white transition">
                    {ch.title}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Course Playlist / Syllabus Section (Directly Below Video) */}
        <div className="px-6 py-6 max-w-7xl w-full mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-primary" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Course Syllabus</h3>
            </div>
            <span className="text-xs font-semibold text-zinc-500">
              {courseLessons.filter(item => progressList.some(p => p.id === `${courseId}_${item.id}` && p.completed)).length} / {courseLessons.length} Completed
            </span>
          </div>

          {/* Scrollable Lecture Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
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
                  className={`w-full text-left p-3.5 rounded-xl flex items-center justify-between border transition group cursor-pointer ${
                    isActive 
                      ? 'bg-primary/15 border-primary/50 text-white shadow-md' 
                      : 'bg-zinc-900/60 border-border/60 hover:bg-zinc-800/80 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {isCompleted ? (
                      <CheckCircle2 className="text-accent flex-shrink-0" size={18} fill="currentColor" />
                    ) : (
                      <Circle className="text-zinc-700 group-hover:text-zinc-500 flex-shrink-0" size={18} />
                    )}
                    <div className="min-w-0">
                      <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold block mb-0.5">
                        Lecture {item.index}
                      </span>
                      <span className="text-xs font-semibold truncate block">{item.title}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-medium flex-shrink-0 flex items-center gap-1 ml-2">
                    <Clock size={10} />
                    <span>{item.duration}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Right Sidebar: Dedicated Study Tools Panel (2 Tabs: Notes, Reading) - Compact w-80 */}
      <div className="hidden lg:flex w-72 lg:w-80 bg-zinc-950 border-l border-border flex-col flex-shrink-0 h-full overflow-hidden">
        
        {/* Sidebar Tab Selector Header */}
        <div className="flex border-b border-border bg-zinc-950 text-xs font-bold uppercase tracking-wider flex-shrink-0 overflow-x-auto">
          {lesson.type === 'youtube' && (
            <>
              {/* Notes Tab */}
              <button
                onClick={() => setActiveTab('notes')}
                className={`py-3.5 px-4 border-b-2 transition cursor-pointer flex items-center gap-1.5 flex-1 justify-center ${
                  activeTab === 'notes' ? 'border-primary text-white bg-zinc-900/50' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <FileText size={14} className={activeTab === 'notes' ? 'text-primary' : ''} />
                <span>Notes ({lessonNotes.length})</span>
              </button>

              {/* Reading Tab */}
              <button
                onClick={() => setActiveTab('reading')}
                className={`py-3.5 px-4 border-b-2 transition cursor-pointer flex items-center gap-1.5 flex-1 justify-center ${
                  activeTab === 'reading' ? 'border-primary text-white bg-zinc-900/50' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <BookOpen size={14} className={activeTab === 'reading' ? 'text-primary' : ''} />
                <span>Reading</span>
              </button>
            </>
          )}
        </div>

        {/* Sidebar Active Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* NOTES TAB */}
          {activeTab === 'notes' && lesson.type === 'youtube' && (
            <div className="space-y-4">
              {/* Note Form Input */}
              <form onSubmit={handleSaveNote} className="space-y-2">
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Type a timestamped note... (Press Enter to Save)"
                  className="w-full h-[70px] p-3 bg-zinc-900 border border-border rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-primary transition resize-none"
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
                  className="w-full py-2.5 bg-primary disabled:opacity-50 text-white rounded-xl text-xs font-bold hover:bg-primary/95 transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Plus size={15} />
                  <span>Save Note {ytPlayer && `[${formatSeconds(ytPlayer.getCurrentTime())}]`}</span>
                </button>
              </form>

              {/* Notes Timeline List */}
              <div className="space-y-3 pt-2">
                {lessonNotes.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-6 text-center">No notes written for this video yet.</p>
                ) : (
                  lessonNotes.map((note) => (
                    <div key={note.id} className="glass-panel p-3.5 rounded-xl relative group border border-border space-y-2">
                      <div className="flex items-center justify-between">
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
                      <p className="text-xs text-zinc-200 leading-relaxed whitespace-pre-line">{note.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* READING TAB */}
          {activeTab === 'reading' && lesson.type === 'youtube' && (
            <ReadingTab lessonId={lessonId} />
          )}

          {/* DESCRIPTION TAB */}
          {activeTab === 'desc' && (
            <div className="glass-panel p-4 rounded-xl border border-border space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Video Description</h4>
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
