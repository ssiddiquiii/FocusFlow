import React from 'react';
import { Clock, Play } from 'lucide-react';

export function ChaptersPanel({ chapters, onSelect }) {
  globalThis.__focusFlowRenderProbe?.('ChaptersPanel');
  if (!chapters?.length) return null;
  return (
    <div className="px-6 py-5 max-w-7xl w-full mx-auto space-y-3 border-b border-border/50">
      <div className="flex items-center gap-2">
        <Clock size={16} className="text-primary" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Interactive Masterclass Chapters ({chapters.length} Chapters)</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
        {chapters.map((chapter, index) => (
          <button key={index} onClick={() => onSelect(chapter.timestamp)} className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-primary/50 hover:bg-zinc-800/80 transition text-left space-y-1 group cursor-pointer">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider font-mono">â±ï¸ {chapter.formattedTime}</span>
              <Play size={11} className="text-zinc-500 group-hover:text-primary transition" fill="currentColor" />
            </div>
            <p className="text-xs font-semibold text-zinc-200 truncate group-hover:text-white transition">{chapter.title}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
