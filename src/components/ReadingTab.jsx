import React from 'react';
import { ExternalLink, BookOpen, Clock, Tag } from 'lucide-react';
import jsPracticeMap from '../data/jsPracticeMap.json';

/**
 * ReadingTab Component.
 * Renders hand-picked documentation, tutorials, and article links (MDN, JavaScript.info, w3resource)
 * for a given lesson's concept.
 *
 * @param {object} props
 * @param {string} props.lessonId — Current lesson ID.
 * @returns {React.JSX.Element}
 */
export default function ReadingTab({ lessonId }) {
  const lessonData = jsPracticeMap[lessonId];

  if (!lessonData || !lessonData.readingMaterials || lessonData.readingMaterials.length === 0) {
    return (
      <div className="py-8 text-center space-y-3">
        <span className="text-zinc-600 text-4xl block">📖</span>
        <p className="text-sm text-zinc-500">No reading materials mapped for this lesson yet.</p>
        <p className="text-xs text-zinc-600">Documentation & article links are added per concept topic.</p>
      </div>
    );
  }

  const { conceptLabel, readingMaterials } = lessonData;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-border/50">
        <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center flex-shrink-0">
          <BookOpen size={18} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Reading: {conceptLabel}</h3>
          <p className="text-[10px] text-zinc-500 mt-0.5">Recommended docs & articles for deeper understanding</p>
        </div>
      </div>

      {/* Reading Cards */}
      <div className="space-y-3">
        {readingMaterials.map((item, index) => {
          const isMDN = item.source?.toLowerCase().includes('mdn');
          const isJSInfo = item.source?.toLowerCase().includes('javascript.info');

          const badgeStyle = isMDN
            ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
            : isJSInfo
            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
            : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';

          return (
            <a
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group glass-panel rounded-xl p-4 border border-border hover:border-blue-500/40 transition duration-200 block space-y-2.5"
            >
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition leading-snug">
                  {item.title}
                </h4>
                <ExternalLink size={14} className="text-zinc-500 group-hover:text-blue-400 transition flex-shrink-0 mt-0.5" />
              </div>

              {item.description && (
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              )}

              {/* Card Footer Badges */}
              <div className="flex items-center justify-between text-[10px] pt-1">
                <span className={`px-2 py-0.5 font-bold uppercase tracking-wider rounded-md border ${badgeStyle}`}>
                  {item.source || 'Doc'}
                </span>
                {item.readTime && (
                  <span className="text-zinc-500 font-medium flex items-center gap-1">
                    <Clock size={10} />
                    <span>{item.readTime}</span>
                  </span>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
