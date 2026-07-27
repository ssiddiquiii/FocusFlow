import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flame, Coffee, Brain, Bell, X, Volume2, VolumeX } from 'lucide-react';

const TIMER_MODES = {
  focus: { label: 'Focus', duration: 25 * 60, icon: Brain, color: 'text-primary border-primary bg-primary/10' },
  shortBreak: { label: 'Short Break', duration: 5 * 60, icon: Coffee, color: 'text-emerald-400 border-emerald-500 bg-emerald-500/10' },
  longBreak: { label: 'Long Break', duration: 15 * 60, icon: Coffee, color: 'text-blue-400 border-blue-500 bg-blue-500/10' }
};

/**
 * PomodoroTimer Component.
 * Features 25-min focus intervals, short/long breaks, session counter,
 * audio chime alert, and a collapsible widget UI.
 */
export default function PomodoroTimer() {
  const [mode, setMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(TIMER_MODES.focus.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(() => {
    return parseInt(localStorage.getItem('focusflow_pomodoro_sessions') || '0', 10);
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const audioRef = useRef(null);

  // Mode change handler
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setTimeLeft(TIMER_MODES[newMode].duration);
    setIsRunning(false);
  };

  // Timer interval effect
  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      
      // Play alert chime if sound enabled
      if (soundEnabled) {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
          osc.start();
          osc.stop(ctx.currentTime + 0.8);
        } catch (e) {
          // AudioContext fallback
        }
      }

      if (mode === 'focus') {
        const nextSessions = sessionsCompleted + 1;
        setSessionsCompleted(nextSessions);
        localStorage.setItem('focusflow_pomodoro_sessions', nextSessions.toString());
        // Switch to short break automatically
        handleModeChange('shortBreak');
      } else {
        handleModeChange('focus');
      }
    }

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode, soundEnabled, sessionsCompleted]);

  // Format MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentConfig = TIMER_MODES[mode];
  const progressPercent = ((currentConfig.duration - timeLeft) / currentConfig.duration) * 100;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Collapsed Pill Button */}
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full font-bold text-xs shadow-2xl border backdrop-blur-md transition-all duration-300 hover:scale-105 cursor-pointer ${
            isRunning
              ? 'bg-primary/20 border-primary/50 text-white animate-pulse'
              : 'bg-zinc-900/90 border-border text-zinc-300 hover:text-white'
          }`}
        >
          <Flame size={16} className={isRunning ? 'text-primary' : 'text-amber-400'} />
          <span className="font-mono">{formatTime(timeLeft)}</span>
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider">({currentConfig.label})</span>
          {sessionsCompleted > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px]">
              🔥 {sessionsCompleted}
            </span>
          )}
        </button>
      ) : (
        /* Expanded Floating Pomodoro Widget */
        <div className="w-80 glass-panel rounded-2xl p-5 border border-primary/30 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 bg-zinc-950/95 backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame size={18} className="text-primary" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Pomodoro Timer</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-zinc-500 hover:text-zinc-300 transition p-1 cursor-pointer"
                title={soundEnabled ? 'Sound Enabled' : 'Sound Muted'}
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

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-xl text-[10px] font-bold uppercase tracking-wider">
            {Object.keys(TIMER_MODES).map((mKey) => (
              <button
                key={mKey}
                onClick={() => handleModeChange(mKey)}
                className={`py-1.5 rounded-lg transition cursor-pointer text-center ${
                  mode === mKey ? 'bg-primary text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {TIMER_MODES[mKey].label}
              </button>
            ))}
          </div>

          {/* Countdown Clock Display */}
          <div className="text-center py-3 space-y-2">
            <div className="text-4xl font-extrabold font-mono text-white tracking-wider">
              {formatTime(timeLeft)}
            </div>

            {/* Mini Progress Bar */}
            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
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
              onClick={() => {
                setIsRunning(false);
                setTimeLeft(currentConfig.duration);
              }}
              className="p-2.5 rounded-xl bg-zinc-900 border border-border text-zinc-400 hover:text-white transition cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Sessions Counter Badge */}
          <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-400">
            <span className="flex items-center gap-1 font-semibold">
              <Flame size={13} className="text-amber-400" />
              <span>Today's Sessions:</span>
            </span>
            <span className="font-extrabold text-white">{sessionsCompleted} Focus Cycles</span>
          </div>
        </div>
      )}
    </div>
  );
}
