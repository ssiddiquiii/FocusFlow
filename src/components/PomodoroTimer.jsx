import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flame, Coffee, Brain, X, Volume2, VolumeX, Edit3, Check, ShieldAlert, Sparkles } from 'lucide-react';
import { useUIStore } from '../hooks/useUIStore';

const STORAGE_KEYS = {
  END_TIME: 'focusflow_pomo_end_time',
  MODE: 'focusflow_pomo_mode',
  RUNNING: 'focusflow_pomo_running',
  REMAINING: 'focusflow_pomo_remaining',
  SESSIONS: 'focusflow_pomo_sessions',
  CUSTOM_FOCUS: 'focusflow_pomo_custom_focus',
  CUSTOM_BREAK: 'focusflow_pomo_custom_break'
};

/**
 * Enhanced Strict Pomodoro Focus System.
 * - Timestamp-based persistence across page reloads & background tabs.
 * - Full-screen "Rest Lock Screen" during break sessions to protect eye health & focus.
 * - Customizable minutes for Focus & Break.
 * - Auto-pauses active YouTube player during break lock.
 */
export default function PomodoroTimer() {
  const { setIsPlaying } = useUIStore();

  // Load custom durations or defaults (in minutes)
  const [focusMins, setFocusMins] = useState(() => parseInt(localStorage.getItem(STORAGE_KEYS.CUSTOM_FOCUS) || '25', 10));
  const [breakMins, setBreakMins] = useState(() => parseInt(localStorage.getItem(STORAGE_KEYS.CUSTOM_BREAK) || '5', 10));

  const [mode, setMode] = useState(() => localStorage.getItem(STORAGE_KEYS.MODE) || 'focus'); // 'focus' | 'break'
  const [isRunning, setIsRunning] = useState(() => localStorage.getItem(STORAGE_KEYS.RUNNING) === 'true');
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sessionsCompleted, setSessionsCompleted] = useState(() => {
    return parseInt(localStorage.getItem(STORAGE_KEYS.SESSIONS) || '0', 10);
  });

  // Calculate remaining seconds
  const [timeLeft, setTimeLeft] = useState(() => {
    const isRun = localStorage.getItem(STORAGE_KEYS.RUNNING) === 'true';
    if (isRun) {
      const endTime = parseInt(localStorage.getItem(STORAGE_KEYS.END_TIME) || '0', 10);
      const diff = Math.ceil((endTime - Date.now()) / 1000);
      return diff > 0 ? diff : 0;
    }
    const rem = parseInt(localStorage.getItem(STORAGE_KEYS.REMAINING) || '0', 10);
    return rem > 0 ? rem : (mode === 'focus' ? focusMins * 60 : breakMins * 60);
  });

  const [strictLockActive, setStrictLockActive] = useState(false);

  // Sync to timestamp-based accurate interval
  useEffect(() => {
    let timer = null;

    if (isRunning) {
      // Set end timestamp if not present
      let endTime = parseInt(localStorage.getItem(STORAGE_KEYS.END_TIME) || '0', 10);
      if (!endTime || endTime < Date.now()) {
        endTime = Date.now() + timeLeft * 1000;
        localStorage.setItem(STORAGE_KEYS.END_TIME, endTime.toString());
      }

      timer = setInterval(() => {
        const remaining = Math.ceil((endTime - Date.now()) / 1000);
        if (remaining <= 0) {
          clearInterval(timer);
          handleSessionComplete();
        } else {
          setTimeLeft(remaining);
          localStorage.setItem(STORAGE_KEYS.REMAINING, remaining.toString());
        }
      }, 500); // Check twice per second for sub-second precision
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, mode, focusMins, breakMins]);

  // Handle Session Completion
  const handleSessionComplete = () => {
    setIsRunning(false);
    localStorage.setItem(STORAGE_KEYS.RUNNING, 'false');
    localStorage.removeItem(STORAGE_KEYS.END_TIME);

    // Sound chime alert
    if (soundEnabled) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3); // G5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      } catch (e) {}
    }

    if (mode === 'focus') {
      const nextCount = sessionsCompleted + 1;
      setSessionsCompleted(nextCount);
      localStorage.setItem(STORAGE_KEYS.SESSIONS, nextCount.toString());

      // Auto-pause any active video
      setIsPlaying(false);

      // Trigger Rest Break & Fullscreen Lock
      setMode('break');
      localStorage.setItem(STORAGE_KEYS.MODE, 'break');
      const breakSecs = breakMins * 60;
      setTimeLeft(breakSecs);
      localStorage.setItem(STORAGE_KEYS.REMAINING, breakSecs.toString());
      setStrictLockActive(true);
    } else {
      // Break over -> Switch to Focus
      setStrictLockActive(false);
      setMode('focus');
      localStorage.setItem(STORAGE_KEYS.MODE, 'focus');
      const focusSecs = focusMins * 60;
      setTimeLeft(focusSecs);
      localStorage.setItem(STORAGE_KEYS.REMAINING, focusSecs.toString());
    }
  };

  // Actions
  const toggleStartPause = () => {
    if (isRunning) {
      // Pause
      setIsRunning(false);
      localStorage.setItem(STORAGE_KEYS.RUNNING, 'false');
      localStorage.removeItem(STORAGE_KEYS.END_TIME);
      localStorage.setItem(STORAGE_KEYS.REMAINING, timeLeft.toString());
    } else {
      // Start
      const targetTime = Date.now() + timeLeft * 1000;
      localStorage.setItem(STORAGE_KEYS.END_TIME, targetTime.toString());
      localStorage.setItem(STORAGE_KEYS.RUNNING, 'true');
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    localStorage.setItem(STORAGE_KEYS.RUNNING, 'false');
    localStorage.removeItem(STORAGE_KEYS.END_TIME);
    const secs = mode === 'focus' ? focusMins * 60 : breakMins * 60;
    setTimeLeft(secs);
    localStorage.setItem(STORAGE_KEYS.REMAINING, secs.toString());
  };

  const saveCustomDurations = () => {
    const f = Math.max(1, Math.min(120, focusMins));
    const b = Math.max(1, Math.min(60, breakMins));
    setFocusMins(f);
    setBreakMins(b);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FOCUS, f.toString());
    localStorage.setItem(STORAGE_KEYS.CUSTOM_BREAK, b.toString());
    setIsEditing(false);
    handleReset();
  };

  // Format MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalModeDuration = (mode === 'focus' ? focusMins : breakMins) * 60;
  const progressPercent = ((totalModeDuration - timeLeft) / totalModeDuration) * 100;

  return (
    <>
      {/* 🔴 FULLSCREEN REST TIME STRICT LOCK OVERLAY */}
      {strictLockActive && (
        <div className="fixed inset-0 z-[100] bg-zinc-950/98 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in fade-in duration-300">
          <div className="w-24 h-24 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center animate-bounce shadow-2xl shadow-emerald-500/20">
            <Coffee size={44} />
          </div>

          <div className="space-y-3 max-w-lg">
            <span className="px-3 py-1 text-xs font-extrabold uppercase tracking-widest rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              ☕ Rest & Recovery Mode Active
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Time to Take a Mental Rest Break!
            </h1>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Great focus session completed! Stand up, stretch your back, rest your eyes from the screen, and drink some water.
            </p>
          </div>

          {/* Large Countdown Ring */}
          <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 space-y-2">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">Rest Time Remaining</span>
            <div className="text-5xl sm:text-6xl font-extrabold font-mono text-emerald-400 tracking-wider">
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Emergency Unlock */}
          <button
            onClick={() => setStrictLockActive(false)}
            className="px-6 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700 text-xs font-bold transition cursor-pointer"
          >
            Emergency Skip Rest Lock 🔓
          </button>
        </div>
      )}

      {/* ⏳ FLOATING POMODORO WIDGET (Positioned cleanly towards the right corner) */}
      <div className="fixed bottom-4 right-3 sm:right-4 z-50">
        {!isExpanded ? (
          /* Collapsed Pill Button */
          <button
            onClick={() => setIsExpanded(true)}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full font-bold text-xs shadow-2xl border backdrop-blur-md transition-all duration-300 hover:scale-105 cursor-pointer ${
              isRunning
                ? mode === 'focus'
                  ? 'bg-primary/20 border-primary/50 text-white animate-pulse'
                  : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 animate-pulse'
                : 'bg-zinc-900/90 border-border text-zinc-300 hover:text-white'
            }`}
          >
            <Flame size={16} className={mode === 'focus' ? 'text-primary' : 'text-emerald-400'} />
            <span className="font-mono text-sm">{formatTime(timeLeft)}</span>
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
              ({mode === 'focus' ? 'Focus' : 'Break'})
            </span>
            {sessionsCompleted > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px]">
                🔥 {sessionsCompleted}
              </span>
            )}
          </button>
        ) : (
          /* Expanded Floating Panel */
          <div className="w-80 glass-panel rounded-2xl p-5 border border-primary/30 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 bg-zinc-950/95 backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame size={18} className="text-primary" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Focus & Rest Timer</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-zinc-500 hover:text-primary transition p-1 cursor-pointer"
                  title="Customize Durations"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="text-zinc-500 hover:text-zinc-300 transition p-1 cursor-pointer"
                  title={soundEnabled ? 'Chime Sound Enabled' : 'Sound Muted'}
                >
                  {soundEnabled ? <Volume2 size={14} className="text-primary" /> : <VolumeX size={14} />}
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-zinc-500 hover:text-white transition p-1 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Custom Duration Editor */}
            {isEditing ? (
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3 animate-in fade-in duration-150">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">Set Custom Minutes:</span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Focus (min):</label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={focusMins}
                      onChange={(e) => setFocusMins(parseInt(e.target.value, 10) || 1)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-white font-bold focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Break (min):</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={breakMins}
                      onChange={(e) => setBreakMins(parseInt(e.target.value, 10) || 1)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-white font-bold focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <button
                  onClick={saveCustomDurations}
                  className="w-full py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Check size={14} />
                  <span>Save Custom Times</span>
                </button>
              </div>
            ) : (
              /* Mode Selector Tabs */
              <div className="grid grid-cols-2 gap-1 bg-zinc-900 p-1 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                <button
                  onClick={() => {
                    setMode('focus');
                    localStorage.setItem(STORAGE_KEYS.MODE, 'focus');
                    setIsRunning(false);
                    setTimeLeft(focusMins * 60);
                  }}
                  className={`py-1.5 rounded-lg transition cursor-pointer text-center ${
                    mode === 'focus' ? 'bg-primary text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Focus ({focusMins}m)
                </button>
                <button
                  onClick={() => {
                    setMode('break');
                    localStorage.setItem(STORAGE_KEYS.MODE, 'break');
                    setIsRunning(false);
                    setTimeLeft(breakMins * 60);
                  }}
                  className={`py-1.5 rounded-lg transition cursor-pointer text-center ${
                    mode === 'break' ? 'bg-emerald-600 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Break ({breakMins}m)
                </button>
              </div>
            )}

            {/* Countdown Clock Display */}
            <div className="text-center py-2 space-y-2">
              <div className="text-4xl font-extrabold font-mono text-white tracking-wider">
                {formatTime(timeLeft)}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    mode === 'focus' ? 'bg-gradient-to-r from-primary to-accent' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={toggleStartPause}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs transition duration-200 active:scale-95 flex items-center gap-2 cursor-pointer shadow-lg ${
                  isRunning
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                    : 'bg-primary text-white hover:bg-primary/90 shadow-primary/30'
                }`}
              >
                {isRunning ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
              </button>

              <button
                onClick={handleReset}
                className="p-2.5 rounded-xl bg-zinc-900 border border-border text-zinc-400 hover:text-white transition cursor-pointer"
                title="Reset Timer"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            {/* Lock Screen Manual Trigger */}
            <button
              onClick={() => {
                setStrictLockActive(true);
                setIsPlaying(false);
              }}
              className="w-full py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShieldAlert size={14} />
              <span>Lock Screen for Rest Break Now 🔒</span>
            </button>

            {/* Sessions Counter Badge */}
            <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="flex items-center gap-1 font-semibold">
                <Flame size={13} className="text-amber-400" />
                <span>Today's Sessions:</span>
              </span>
              <span className="font-extrabold text-white">{sessionsCompleted} Cycles Completed</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
