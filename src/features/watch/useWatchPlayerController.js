import { useEffect, useRef, useState } from 'react';
import { useUIStore } from '../../hooks/useUIStore';
import { saveProgress } from '../../services/dataCommands';
import { getWatchedSeconds } from '../../utils/selectors';
import { QUALITY_OPTIONS, SPEED_OPTIONS } from './watchConstants';

export function useWatchPlayerController({ courseId, lessonId, lesson, progressList }) {
  const playerContainerRef = useRef(null);
  const progressBarRef = useRef(null);
  const mouseTimerRef = useRef(null);
  const { isPlaying, seekRequestTime, setActiveLessonId, setIsPlaying, triggerPlayerSeek } = useUIStore();
  const [ytPlayer, setYtPlayer] = useState(null);
  const [isPlayerTriggered, setIsPlayerTriggered] = useState(false);
  const [playerCurrentTime, setPlayerCurrentTime] = useState(0);
  const [playerDuration, setPlayerDuration] = useState(0);
  const [playerMuted, setPlayerMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [qualityLevel, setQualityLevel] = useState('auto');
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);

  useEffect(() => {
    if (lessonId) {
      setActiveLessonId(lessonId);
      setPlayerCurrentTime(0);
      setPlayerDuration(0);
      setIsPlayerTriggered(false);
      setPlaybackSpeed(1);
    }
  }, [lessonId]);

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

  useEffect(() => {
    if (!lesson || lesson.type !== 'youtube' || !isPlayerTriggered) return;

    let playerInstance = null;
    let progressTimer = null;
    let uiSyncTimer = null;
    let captionTimeout1 = null;
    let captionTimeout2 = null;
    const currentProgress = progressList.find(p => p.id === `${courseId}_${lessonId}`);
    const resumeSeconds = currentProgress && !currentProgress.completed
      ? Math.max(0, getWatchedSeconds(currentProgress) - 2)
      : 0;

    const forceCaptionsOff = (player) => {
      try {
        if (player && typeof player.unloadModule === 'function') {
          player.unloadModule('captions');
          player.unloadModule('cc');
          player.setOption('captions', 'track', {});
          player.setOption('captions', 'reload', true);
        }
      } catch {}
      setCaptionsEnabled(false);
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
          const time = player.getCurrentTime();
          const duration = player.getDuration();
          if (duration > 0) setPlayerDuration(duration);
          const step = Math.floor(time * 4);
          if (step !== lastStep) {
            lastStep = step;
            setPlayerCurrentTime(time);
          }
        }
      }, 200);
    };

    const onPlayerStateChange = (event) => {
      const state = event.data;
      if (state === window.YT.PlayerState.PLAYING) {
        setIsPlaying(true);
        startProgressTracking(event.target);
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

    const onPlayerReady = (event) => {
      const player = event.target;
      setYtPlayer(player);
      setPlayerDuration(player.getDuration());
      setPlayerMuted(player.isMuted());
      player.setPlaybackRate(playbackSpeed);
      forceCaptionsOff(player);
      captionTimeout1 = setTimeout(() => forceCaptionsOff(player), 500);
      captionTimeout2 = setTimeout(() => forceCaptionsOff(player), 1500);
      const startSec = resumeSeconds > 0 ? resumeSeconds : (lesson.startTimestamp || 0);
      player.seekTo(startSec, true);
      player.playVideo();
    };

    const targetVideoId = lesson.videoId || lessonId;
    const startSec = resumeSeconds > 0 ? resumeSeconds : (lesson.startTimestamp || 0);
    const initializePlayer = () => {
      if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
        ytPlayer.loadVideoById({ videoId: targetVideoId, startSeconds: startSec });
        ytPlayer.playVideo();
        return;
      }
      playerInstance = new window.YT.Player('yt-player-iframe', {
        height: '100%', width: '100%', videoId: targetVideoId,
        playerVars: { start: startSec, rel: 0, iv_load_policy: 3, modestbranding: 1, controls: 0, disablekb: 1, fs: 0, autoplay: 1, cc_load_policy: 0 },
        events: { onReady: onPlayerReady, onStateChange: onPlayerStateChange }
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
        try { playerInstance.destroy(); } catch {}
      }
      setYtPlayer(null);
      setIsPlaying(false);
    };
  }, [lessonId, courseId, isPlayerTriggered]);

  useEffect(() => () => {
    if (mouseTimerRef.current) clearTimeout(mouseTimerRef.current);
  }, []);

  useEffect(() => {
    if (!isPlayerTriggered) return;
    const handleKeyDown = (event) => {
      const tag = event.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || event.target.isContentEditable || event.target.closest('button, a, summary, [role="slider"]')) return;
      switch (event.key) {
        case ' ': case 'k': case 'K':
          event.preventDefault();
          if (ytPlayer) {
            if (isPlaying) ytPlayer.pauseVideo();
            else ytPlayer.playVideo();
          }
          break;
        case 'ArrowLeft': case 'j': case 'J': {
          event.preventDefault();
          if (ytPlayer) {
            const time = Math.max(0, ytPlayer.getCurrentTime() - 5);
            ytPlayer.seekTo(time, true);
            setPlayerCurrentTime(time);
          }
          break;
        }
        case 'ArrowRight': case 'l': case 'L': {
          event.preventDefault();
          if (ytPlayer) {
            const time = Math.min(playerDuration, ytPlayer.getCurrentTime() + 5);
            ytPlayer.seekTo(time, true);
            setPlayerCurrentTime(time);
          }
          break;
        }
        case 'm': case 'M':
          event.preventDefault();
          if (ytPlayer) {
            if (playerMuted) { ytPlayer.unMute(); setPlayerMuted(false); }
            else { ytPlayer.mute(); setPlayerMuted(true); }
          }
          break;
        case 'f': case 'F':
          event.preventDefault();
          if (playerContainerRef.current) {
            if (document.fullscreenElement) document.exitFullscreen();
            else playerContainerRef.current.requestFullscreen();
          }
          break;
        case 'c': case 'C':
          event.preventDefault();
          if (ytPlayer) {
            if (captionsEnabled) { ytPlayer.unloadModule('captions'); setCaptionsEnabled(false); }
            else { ytPlayer.loadModule('captions'); setCaptionsEnabled(true); }
          }
          break;
        default: break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [ytPlayer, isPlaying, playerMuted, playerDuration, captionsEnabled, isPlayerTriggered]);

  const handlePlayPause = () => {
    if (!ytPlayer) return;
    try {
      const state = typeof ytPlayer.getPlayerState === 'function' ? ytPlayer.getPlayerState() : -1;
      if (state === 1 || isPlaying) { ytPlayer.pauseVideo(); setIsPlaying(false); }
      else { ytPlayer.playVideo(); setIsPlaying(true); }
    } catch { setIsPlaying(previous => !previous); }
  };
  const handleMuteToggle = () => {
    if (!ytPlayer) return;
    if (playerMuted) { ytPlayer.unMute(); setPlayerMuted(false); }
    else { ytPlayer.mute(); setPlayerMuted(true); }
  };
  const handleSpeedCycle = () => {
    if (!ytPlayer) return;
    const nextSpeed = SPEED_OPTIONS[(SPEED_OPTIONS.indexOf(playbackSpeed) + 1) % SPEED_OPTIONS.length];
    ytPlayer.setPlaybackRate(nextSpeed);
    setPlaybackSpeed(nextSpeed);
  };
  const handleQualityCycle = () => {
    if (!ytPlayer) return;
    const currentIndex = QUALITY_OPTIONS.findIndex(option => option.value === qualityLevel);
    const nextQuality = QUALITY_OPTIONS[(currentIndex + 1) % QUALITY_OPTIONS.length];
    try { ytPlayer.setPlaybackQuality(nextQuality.value); } catch {}
    setQualityLevel(nextQuality.value);
  };
  const handleFullscreenToggle = () => {
    const container = playerContainerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) container.requestFullscreen().catch(error => console.error('Fullscreen Error:', error));
    else document.exitFullscreen();
  };
  const handleCCToggle = () => {
    if (!ytPlayer) return;
    if (captionsEnabled) { ytPlayer.unloadModule('captions'); setCaptionsEnabled(false); }
    else { ytPlayer.loadModule('captions'); setCaptionsEnabled(true); }
  };
  const handleMouseMove = () => {
    setIsControlsVisible(true);
    if (mouseTimerRef.current) clearTimeout(mouseTimerRef.current);
    mouseTimerRef.current = setTimeout(() => { if (isPlaying) setIsControlsVisible(false); }, 800);
  };
  const handleMouseLeave = () => {
    if (mouseTimerRef.current) clearTimeout(mouseTimerRef.current);
    if (isPlaying) setIsControlsVisible(false);
  };
  const handleProgressBarClick = (event) => {
    if (!ytPlayer || !progressBarRef.current || playerDuration === 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const seekSeconds = ((event.clientX - rect.left) / rect.width) * playerDuration;
    ytPlayer.seekTo(seekSeconds, true);
    setPlayerCurrentTime(seekSeconds);
  };

  return {
    playerContainerRef, progressBarRef, ytPlayer, isPlayerTriggered, setIsPlayerTriggered,
    playerCurrentTime, playerDuration, playerMuted, playbackSpeed, qualityLevel,
    captionsEnabled, isControlsVisible, isPlaying, triggerPlayerSeek,
    handlePlayPause, handleMuteToggle, handleSpeedCycle, handleQualityCycle,
    handleFullscreenToggle, handleCCToggle, handleMouseMove, handleMouseLeave,
    handleProgressBarClick
  };
}
