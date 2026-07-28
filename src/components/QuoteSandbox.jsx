import React, { useState, useEffect } from 'react';
import { Quote, ChevronLeft, ChevronRight, Terminal } from 'lucide-react';
import developerQuotes from '../data/developerQuotes.json';

/**
 * Modern Minimalist Developer Quotation Sandbox Component
 * Rotates curated developer quotes every 30 seconds with JetBrains Mono / Mona Lisa code typography.
 */
export default function QuoteSandbox() {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 30 second timer (30000ms) with 100ms smooth progress updates
    const intervalMs = 30000;
    const updateFreqMs = 100;
    const increment = (updateFreqMs / intervalMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIndex((prevIdx) => (prevIdx + 1) % developerQuotes.length);
          return 0;
        }
        return prev + increment;
      });
    }, updateFreqMs);

    return () => clearInterval(timer);
  }, [index]);

  const current = developerQuotes[index] || developerQuotes[0];

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % developerQuotes.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + developerQuotes.length) % developerQuotes.length);
    setProgress(0);
  };

  return (
    <div className="p-4 sm:p-5 bg-zinc-950/70 relative overflow-hidden group flex flex-col justify-between h-full space-y-3">
      {/* 30-Second Animated Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-900/80">
        <div 
          className="h-full bg-gradient-to-r from-orange-500 via-primary to-orange-400 transition-all duration-100 ease-linear shadow-sm"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header bar: Developer Mindset tag & Controls */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center justify-center">
            <Terminal size={12} />
          </div>
          <span className="text-[10px] font-mono font-bold text-orange-400 uppercase tracking-widest">
            Developer Mindset
          </span>
        </div>

        {/* Controls & Timer Indicator */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mr-1">
            30s
          </span>
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
            title="Previous Quote"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
            title="Next Quote"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Quote Body (JetBrains Mono / Mona Lisa Code Typography) */}
      <div className="space-y-2">
        <p className="text-xs sm:text-sm font-mono italic text-zinc-100 font-medium leading-relaxed tracking-tight">
          "{current.quote}"
        </p>

        {/* Author Attribution */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="font-bold text-orange-400">— {current.author}</span>
          {current.role && (
            <span className="text-zinc-500 text-[11px] font-mono hidden sm:inline">• {current.role}</span>
          )}
        </div>
      </div>
    </div>
  );
}
