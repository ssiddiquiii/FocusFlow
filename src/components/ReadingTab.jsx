import React from 'react';
import { ExternalLink, BookOpen, Clock, Lightbulb, AlertTriangle, Code, CheckCircle2 } from 'lucide-react';
import jsPracticeMap from '../data/jsPracticeMap.json';

/**
 * ReadingTab Component.
 * Displays Diagnosed In-App Study Articles (Overview, Code Examples, Gotchas)
 * plus curated external documentation & tutorial links (MDN, JavaScript.info, w3resource).
 *
 * @param {object} props
 * @param {string} props.lessonId — Current lesson ID.
 * @returns {React.JSX.Element}
 */
export default function ReadingTab({ lessonId }) {
  const lessonData = jsPracticeMap[lessonId];

  if (!lessonData) {
    return (
      <div className="py-8 text-center space-y-3">
        <span className="text-zinc-600 text-4xl block">📖</span>
        <p className="text-sm text-zinc-500">No reading materials mapped for this lesson yet.</p>
      </div>
    );
  }

  const { conceptLabel, readingMaterials, summaryArticle } = lessonData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-border/50">
        <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center flex-shrink-0 border border-blue-500/20">
          <BookOpen size={18} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">{conceptLabel} — Study Guide</h3>
          <p className="text-[10px] text-zinc-400 mt-0.5">In-app concept breakdown, code cheat sheet & docs</p>
        </div>
      </div>

      {/* 📖 IN-APP DIAGNOSED STUDY ARTICLE / CHEAT SHEET */}
      {summaryArticle && (
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-primary/25 bg-gradient-to-b from-primary/5 via-zinc-950 to-zinc-950 space-y-4">
          
          {/* Article Header */}
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <Lightbulb size={16} />
            <span>Concept Diagnosis & Cheat Sheet</span>
          </div>

          {/* Overview Paragraph */}
          {summaryArticle.overview && (
            <p className="text-xs text-zinc-300 leading-relaxed font-medium">
              {summaryArticle.overview}
            </p>
          )}

          {/* Key Takeaways List */}
          {summaryArticle.keyPoints && summaryArticle.keyPoints.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Key Rules & Syntax:</span>
              <div className="space-y-1.5">
                {summaryArticle.keyPoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                    <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="leading-snug">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Code Snippet Box */}
          {summaryArticle.codeSnippet && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1"><Code size={12} /> Code Example</span>
                <span>JavaScript</span>
              </div>
              <pre className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-emerald-300 overflow-x-auto leading-relaxed shadow-inner">
                <code>{summaryArticle.codeSnippet}</code>
              </pre>
            </div>
          )}

          {/* Pitfalls & Interview Gotchas Alert */}
          {summaryArticle.pitfalls && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[11px]">
                <AlertTriangle size={14} className="text-amber-400 flex-shrink-0" />
                <span>Interview Gotcha / Common Trap:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-200/90 pl-5">
                {summaryArticle.pitfalls}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 🔗 EXTERNAL DOCUMENTATION & TUTORIAL LINKS */}
      {readingMaterials && readingMaterials.length > 0 && (
        <div className="space-y-3">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">External References & Docs:</span>
          
          <div className="space-y-2.5">
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
                  className="group glass-panel rounded-xl p-3.5 border border-border hover:border-blue-500/40 transition duration-200 block space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-xs font-semibold text-white group-hover:text-blue-400 transition leading-snug">
                      {item.title}
                    </h4>
                    <ExternalLink size={13} className="text-zinc-500 group-hover:text-blue-400 transition flex-shrink-0 mt-0.5" />
                  </div>

                  {item.description && (
                    <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {/* Card Footer Badges */}
                  <div className="flex items-center justify-between text-[10px] pt-0.5">
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
      )}
    </div>
  );
}
