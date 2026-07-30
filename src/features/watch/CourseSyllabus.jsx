import React from 'react';
import { BookOpen, CheckCircle2, Circle, Clock } from 'lucide-react';

export function CourseSyllabus({ courseId, lessonId, lessons, progressList, onNavigate }) {
  globalThis.__focusFlowRenderProbe?.('CourseSyllabus');
  const completedCount = lessons.filter(item => progressList.some(progress => progress.id === `${courseId}_${item.id}` && progress.completed)).length;
  return (
    <div className="px-6 py-6 max-w-7xl w-full mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><BookOpen size={18} className="text-primary" /><h3 className="text-sm font-bold text-white uppercase tracking-wider">Course Syllabus</h3></div>
        <span className="text-xs font-semibold text-zinc-500">{completedCount} / {lessons.length} Completed</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
        {lessons.map(item => {
          const progress = progressList.find(candidate => candidate.id === `${courseId}_${item.id}`);
          const isCompleted = progress ? progress.completed : false;
          const isActive = item.id === lessonId;
          return (
            <button key={item.id} onClick={() => { if (!isActive) onNavigate(item.id); }} className={`w-full text-left p-3.5 rounded-xl flex items-center justify-between border transition group cursor-pointer ${isActive ? 'bg-primary/15 border-primary/50 text-white shadow-md' : 'bg-zinc-900/60 border-border/60 hover:bg-zinc-800/80 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'}`}>
              <div className="flex items-center gap-3 min-w-0">
                {isCompleted ? <CheckCircle2 className="text-accent flex-shrink-0" size={18} fill="currentColor" /> : <Circle className="text-zinc-700 group-hover:text-zinc-500 flex-shrink-0" size={18} />}
                <div className="min-w-0"><span className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold block mb-0.5">Lecture {item.index}</span><span className="text-xs font-semibold truncate block">{item.title}</span></div>
              </div>
              <span className="text-[10px] text-zinc-500 font-medium flex-shrink-0 flex items-center gap-1 ml-2"><Clock size={10} /><span>{item.duration}</span></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
