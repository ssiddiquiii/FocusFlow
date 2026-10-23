import React from 'react';
import { Play } from 'lucide-react';
import { PlayerControls } from './PlayerControls';

export function PlayerSurface({ course, lesson, lessonId, controller, isUdemyCompleted, onUdemyToggle }) {
  return (
    <div className="mx-auto mt-1 w-full max-w-7xl px-1 sm:mt-4 sm:px-6">
      <div data-testid="watch-player" ref={controller.playerContainerRef} onMouseMove={controller.handleMouseMove} onMouseLeave={controller.handleMouseLeave} className={`group/player relative aspect-video w-full flex-shrink-0 overflow-hidden rounded-lg border border-border bg-[#1E1E1E] shadow-2xl sm:rounded-2xl ${!controller.isControlsVisible && controller.isPlaying ? 'cursor-none' : ''}`}>
        {lesson.type === 'youtube' ? (
          <div className="w-full h-full relative">
            {!controller.isPlayerTriggered ? (
              <button type="button" aria-label={`Play ${lesson.title}`} onClick={() => controller.setIsPlayerTriggered(true)} className="group/thumb absolute inset-0 z-20 flex h-full w-full cursor-pointer items-center justify-center bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset">
                <img src={lesson.thumbnailUrl || `https://i.ytimg.com/vi/${lesson.videoId || lessonId}/hqdefault.jpg`} alt={lesson.title} className="w-full h-full object-cover opacity-85 group-hover/thumb:scale-[1.01] transition duration-500" />
                <div className="absolute inset-0 bg-black/35 group-hover/thumb:bg-black/20 transition duration-300" />
                <span className="absolute z-30 flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/20 bg-primary text-white shadow-2xl shadow-primary/45 transition duration-300 group-hover/thumb:scale-110 sm:h-16 sm:w-16"><Play size={24} fill="currentColor" className="ml-1" /></span>
              </button>
            ) : <div id="yt-player-iframe" className="w-full h-full absolute inset-0 z-10" />}
            {controller.isPlayerTriggered && <div onClick={controller.handlePlayPause} className={`w-full h-[calc(100%-60px)] absolute inset-x-0 top-0 z-20 bg-transparent ${!controller.isControlsVisible && controller.isPlaying ? 'cursor-none' : 'cursor-pointer'}`} />}
            {controller.isPlayerTriggered && <PlayerControls controller={controller} chapters={lesson.chapters} />}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center space-y-6 h-full justify-center">
            <span className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded bg-accent/20 text-accent border border-accent/30">Udemy Cohort</span>
            <h3 className="text-2xl font-bold text-white leading-snug">{lesson.title}</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">This course is manually tracked. Visit Udemy.com to watch the video, then mark it complete below.</p>
            <a href={course.udemyUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-zinc-900 border border-border text-white hover:bg-zinc-800 transition font-medium">Open Course on Udemy</a>
            <button onClick={onUdemyToggle} className={`w-full py-4 rounded-xl font-bold transition duration-200 active:scale-98 ${isUdemyCompleted ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-primary text-white hover:bg-primary/95 shadow-lg shadow-primary/20'}`}>{isUdemyCompleted ? 'âœ“ Completed (Unmark)' : 'Mark as Completed'}</button>
          </div>
        )}
      </div>
    </div>
  );
}
