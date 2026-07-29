import React from 'react';
import { Play } from 'lucide-react';
import { PlayerControls } from './PlayerControls';

export function PlayerSurface({ course, lesson, lessonId, controller, isUdemyCompleted, onUdemyToggle }) {
  return (
    <div className="w-full max-w-7xl mx-auto mt-1 sm:mt-4 px-1 sm:px-6">
      <div ref={controller.playerContainerRef} onMouseMove={controller.handleMouseMove} onMouseLeave={controller.handleMouseLeave} className={`w-full aspect-video min-h-[210px] sm:min-h-[300px] relative bg-[#1E1E1E] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 group/player border border-border ${!controller.isControlsVisible && controller.isPlaying ? 'cursor-none' : ''}`}>
        {lesson.type === 'youtube' ? (
          <div className="w-full h-full relative">
            {!controller.isPlayerTriggered ? (
              <div onClick={() => controller.setIsPlayerTriggered(true)} className="w-full h-full absolute inset-0 cursor-pointer flex items-center justify-center bg-zinc-900 group/thumb z-20">
                <img src={lesson.thumbnailUrl || `https://i.ytimg.com/vi/${lesson.videoId || lessonId}/hqdefault.jpg`} alt={lesson.title} className="w-full h-full object-cover opacity-85 group-hover/thumb:scale-[1.01] transition duration-500" />
                <div className="absolute inset-0 bg-black/35 group-hover/thumb:bg-black/20 transition duration-300" />
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-primary text-white border-2 border-white/20 shadow-2xl shadow-primary/45 group-hover/thumb:scale-110 transition duration-300 absolute z-30"><Play size={24} fill="currentColor" className="ml-1" /></div>
              </div>
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
