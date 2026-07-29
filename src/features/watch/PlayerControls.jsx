import React from 'react';
import { Gauge, Maximize, Pause, Play, Sliders, Type, Volume2, VolumeX } from 'lucide-react';
import { formatSeconds, QUALITY_OPTIONS } from './watchConstants';

export function PlayerControls({ controller, chapters }) {
  const progressPercent = controller.playerDuration > 0 ? (controller.playerCurrentTime / controller.playerDuration) * 100 : 0;
  return (
    <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/90 to-transparent p-4 flex flex-col gap-3 z-20 transition-opacity duration-300 ${controller.isControlsVisible || !controller.isPlaying ? 'opacity-100' : 'opacity-0'}`}>
      <div ref={controller.progressBarRef} onClick={controller.handleProgressBarClick} className="w-full h-2.5 bg-zinc-800/90 rounded-full cursor-pointer relative overflow-visible group/timeline border border-zinc-700/50">
        <div className="h-full bg-gradient-to-r from-primary via-accent to-yellow-400 rounded-full transition-all duration-75 shadow-lg shadow-primary/30" style={{ width: `${progressPercent}%` }} />
        {controller.playerDuration > 0 && chapters?.map((chapter, index) => {
          const left = Math.min(100, Math.max(0, (chapter.timestamp / controller.playerDuration) * 100));
          return (
            <div key={index} style={{ left: `${left}%` }} onClick={event => { event.stopPropagation(); controller.triggerPlayerSeek(chapter.timestamp); }} className="absolute top-1/2 -translate-y-1/2 -ml-1 w-2.5 h-2.5 rounded-full bg-white border-2 border-primary shadow-md hover:scale-150 transition-transform group/marker z-30 cursor-pointer">
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/marker:flex flex-col items-center pointer-events-none z-40 whitespace-nowrap"><div className="px-2.5 py-1 rounded-md bg-zinc-950 text-white border border-primary/40 text-[10px] font-bold shadow-xl flex items-center gap-1.5"><span className="text-primary font-mono">â±ï¸ {chapter.formattedTime}</span><span className="text-zinc-300 font-semibold">{chapter.title}</span></div><div className="w-1.5 h-1.5 bg-zinc-950 rotate-45 border-r border-b border-primary/40 -mt-1" /></div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between text-white text-xs">
        <div className="flex items-center gap-4">
          <button onClick={controller.handlePlayPause} className="p-1 text-zinc-300 hover:text-white transition cursor-pointer">{controller.isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}</button>
          <button onClick={controller.handleMuteToggle} className="p-1 text-zinc-300 hover:text-white transition cursor-pointer">{controller.playerMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}</button>
          <button onClick={controller.handleSpeedCycle} className="px-2 py-1 rounded bg-zinc-800 border border-border text-[10px] font-bold text-zinc-300 hover:text-white transition cursor-pointer flex items-center gap-1" title="Change Playback Speed"><Gauge size={12} /><span>{controller.playbackSpeed === 1 ? 'Normal' : `${controller.playbackSpeed}x`}</span></button>
          <button onClick={controller.handleQualityCycle} className="px-2 py-1 rounded bg-zinc-800 border border-border text-[10px] font-bold text-zinc-300 hover:text-white transition cursor-pointer flex items-center gap-1" title="Change Video Quality / Resolution"><Sliders size={12} /><span>{QUALITY_OPTIONS.find(option => option.value === controller.qualityLevel)?.label || 'Auto'}</span></button>
          <span className="font-semibold text-zinc-400 select-none">{formatSeconds(controller.playerCurrentTime)} / {formatSeconds(controller.playerDuration)}</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={controller.handleCCToggle} className={`p-1.5 transition cursor-pointer rounded flex items-center gap-1 ${controller.captionsEnabled ? 'text-white bg-primary/20 border-b-2 border-primary' : 'text-zinc-400 hover:text-white'}`} title="Toggle Captions (CC)"><Type size={16} /></button>
          <button onClick={controller.handleFullscreenToggle} className="p-1 text-zinc-300 hover:text-white transition cursor-pointer"><Maximize size={16} /></button>
        </div>
      </div>
    </div>
  );
}
