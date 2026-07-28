import React, { useState, useEffect } from 'react';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import developerQuotes from '../data/developerQuotes.json';

/**
 * Modern Minimalist Developer Quotation Sandbox Component
 * Rotates curated developer quotes every 30 seconds with a clean top progress bar.
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
    <div className="p-3 sm:p-3.5 bg-zinc-950/60 relative overflow-hidden group">
      {/* 30-Second Animated Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-zinc-900">
        <div 
          className="h-full bg-gradient-to-r from-orange-500 via-primary to-orange-500 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        {/* Quote Content */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-6 h-6 rounded-lg bg-orange-500/10 border border-orange-500/25 text-orange-400 flex items-center justify-center flex-shrink-0">
            <Quote size={12} />
          </div>
          <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
            <p className="text-xs font-medium text-zinc-200 italic truncate">
              "{current.quote}"
            </p>
            <div className="flex items-center gap-1 text-[10px] sm:text-xs flex-shrink-0">
              <span className="font-bold text-orange-400">— {current.author}</span>
              <span className="text-zinc-500 hidden md:inline">• {current.role}</span>
            </div>
          </div>
        </div>

        {/* Controls & Timer Indicator */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="hidden md:inline-flex text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest mr-1">
            30s
          </span>
          <button
            onClick={handlePrev}
            className="p-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
            title="Previous Quote"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            onClick={handleNext}
            className="p-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
            title="Next Quote"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
