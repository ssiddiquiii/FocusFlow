import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command, BookOpen, Target, Settings, Terminal, Sparkles, X, FileText, ArrowRight } from 'lucide-react';
import jsTopicPractice from '../data/jsTopicPractice.json';

/**
 * Command Palette & Global Search Modal (Ctrl + K or ?)
 * Allows power learners to jump to pages, search 100+ interview questions, and see shortcuts.
 */
export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Flatten all questions for global search
  const allQuestions = jsTopicPractice.flatMap(mod => 
    mod.questions.map(q => ({ ...q, topic: mod.topic }))
  );

  const filteredQuestions = query.trim() === '' 
    ? [] 
    : allQuestions.filter(q => 
        q.title.toLowerCase().includes(query.toLowerCase()) || 
        q.question.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6);

  const handleSelectRoute = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 animate-in fade-in duration-150">
      <div 
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden space-y-0 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/80 bg-zinc-900/60">
          <Search size={18} className="text-zinc-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, page, or search 140+ interview questions... (Press Esc to close)"
            className="w-full bg-transparent text-white text-sm font-medium focus:outline-none placeholder:text-zinc-500"
            autoFocus
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results Container */}
        <div className="p-3 max-h-96 overflow-y-auto space-y-4">
          {/* Global Search Matches */}
          {filteredQuestions.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest px-2">Interview Questions Found</span>
              {filteredQuestions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => handleSelectRoute('/practice')}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-zinc-900/90 border border-transparent hover:border-zinc-800 transition flex items-center justify-between group cursor-pointer"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <h5 className="text-xs font-bold text-white group-hover:text-primary transition truncate">{q.title}</h5>
                    <p className="text-[10px] text-zinc-400 truncate mt-0.5">{q.topic}</p>
                  </div>
                  <ArrowRight size={14} className="text-zinc-600 group-hover:text-primary flex-shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Quick Navigation Commands */}
          {query.trim() === '' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2">Quick Navigation</span>
                <button
                  onClick={() => handleSelectRoute('/')}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-zinc-900 border border-transparent hover:border-border transition flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen size={16} className="text-primary" />
                    <span className="text-xs font-bold text-white">Dashboard & Masterclasses</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">Alt + D</span>
                </button>

                <button
                  onClick={() => handleSelectRoute('/practice')}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-zinc-900 border border-transparent hover:border-border transition flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <Target size={16} className="text-accent" />
                    <span className="text-xs font-bold text-white">Practice Hub (140+ Questions)</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">Alt + P</span>
                </button>

                <button
                  onClick={() => handleSelectRoute('/settings')}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-zinc-900 border border-transparent hover:border-border transition flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <Settings size={16} className="text-zinc-400" />
                    <span className="text-xs font-bold text-white">Settings & Data Backup</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">Alt + S</span>
                </button>
              </div>

              {/* Keyboard Shortcuts Cheat Sheet */}
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-border/50 space-y-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">⌨️ Power Learner Shortcuts</span>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
                  <div><kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono">Ctrl + K</kbd> Command Palette</div>
                  <div><kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono">Space</kbd> Play / Pause Video</div>
                  <div><kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono">Esc</kbd> Close Modals</div>
                  <div><kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono">Alt + P</kbd> Practice Qs</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
