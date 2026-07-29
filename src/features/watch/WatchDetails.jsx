import React from 'react';
import { Target } from 'lucide-react';
import CategoryIcon from '../../components/CategoryIcon';
import jsTopicPractice from '../../data/jsTopicPractice.json';
import { LESSON_TOPIC_MAP } from './watchConstants';

export function WatchDetails({ course, lesson, lessonId, onOpenPractice }) {
  const categoryId = LESSON_TOPIC_MAP[lessonId] || 'cat-1-variables-datatypes';
  const category = jsTopicPractice.find(candidate => candidate.id === categoryId);
  return (
    <div className="px-6 py-4 space-y-3 max-w-7xl w-full mx-auto border-b border-border/50">
      <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{lesson.title}</h1>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
        <div><span className="text-zinc-600">Instructor:</span> <span className="text-zinc-300 font-semibold">{course.channelName}</span></div>
        <span className="text-zinc-700">â€¢</span>
        <div><span className="text-zinc-600">Origin:</span> <span className="text-zinc-300 font-semibold">{course.type === 'youtube' ? 'YouTube Public API' : 'Udemy manual tracking'}</span></div>
      </div>
      {category && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-primary/10 border border-primary/25 mt-2">
          <div className="flex items-center gap-3"><CategoryIcon id={category.id} size={24} /><div><span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Topic Practice Category</span><h4 className="text-xs font-bold text-white tracking-tight">{category.topic}</h4></div></div>
          <button onClick={onOpenPractice} className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow cursor-pointer self-start sm:self-auto"><Target size={13} /><span>Solve Practice Qs â†’</span></button>
        </div>
      )}
      {lesson.description && <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2 mt-3"><span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Video Description</span><p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">{lesson.description}</p></div>}
    </div>
  );
}
