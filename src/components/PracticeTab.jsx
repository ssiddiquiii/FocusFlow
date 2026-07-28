import React, { useState, useRef, useEffect } from 'react';
import { ExternalLink, CheckCircle2, Circle, Lightbulb, ChevronDown, ChevronUp, Target, Filter, Check } from 'lucide-react';
import jsTopicPractice from '../data/jsTopicPractice.json';
import CategoryIcon from './CategoryIcon';
import { JsLogo, GitLogo } from './BrandLogos';

/**
 * Mapping lesson concepts to topic practice module IDs.
 */
const LESSON_TOPIC_MAP = {
  // Batch 1 (Videos 4-8): Variables & Datatypes
  'yY0bKZNYmJs': 'cat-1-variables-datatypes',
  '-9knnv97wSc': 'cat-1-variables-datatypes',
  'X7hDBhd_L5U': 'cat-1-variables-datatypes',
  'N9el4APFtAo': 'cat-1-variables-datatypes',
  'giP2uXMlv4c': 'cat-1-variables-datatypes',

  // Batch 2 (Videos 9-13): Memory, Strings, Math & Dates
  'suMvZWjjKbo': 'cat-2-memory-strings-math',
  '7gwc-1czolw': 'cat-2-memory-strings-math',
  'fozwNnFunlo': 'cat-2-memory-strings-math',
  '_KqpeDc47Ro': 'cat-2-memory-strings-math',
  'tGLCuoumaGY': 'cat-2-memory-strings-math',

  // Batch 3 (Videos 14-18): Arrays, Objects, Destructuring & JSON
  'cejBux2gtEE': 'cat-3-arrays-objects-json',
  'm6azhgyCi-k': 'cat-3-arrays-objects-json',
  'vVYOHmqQDCU': 'cat-3-arrays-objects-json',
  '4lb2pXWWXJI': 'cat-3-arrays-objects-json',
  'AViTh83k-IE': 'cat-3-arrays-objects-json',

  // Batch 4 (Videos 19-23): Functions, Scopes & this
  'Bn56WahG_t0': 'cat-4-functions-scopes-this',
  't7ZHPhgdA4U': 'cat-4-functions-scopes-this',
  'cHHU0jXfjKY': 'cat-4-functions-scopes-this',
  'eWwge2YpHhc': 'cat-4-functions-scopes-this',
  '9ksqBa8_txM': 'cat-4-functions-scopes-this',

  // Batch 5 (Videos 24-28): IIFE, Execution Context & Control Flow
  'GAIbn16Iytc': 'cat-5-execution-callstack-control',
  'ByhtOgF6uYM': 'cat-5-execution-callstack-control',
  '0P_YvC6Gg0c': 'cat-5-execution-callstack-control',
  'Y1cpFsXrEgY': 'cat-5-execution-callstack-control',
  'w3Q55-l47P0': 'cat-5-execution-callstack-control',

  // Batch 6 (Videos 29-33): Higher Order Loops, Map/Filter/Reduce & DOM Intro
  'M0YImBHQsWU': 'cat-6-hofs-filter-map-reduce-dom',
  '9MfwYoWKKVE': 'cat-6-hofs-filter-map-reduce-dom',
  'DcjNkHtDj8A': 'cat-6-hofs-filter-map-reduce-dom',
  'Ab6K57WjWTE': 'cat-6-hofs-filter-map-reduce-dom',
  'xAvTgCsCHLs': 'cat-6-hofs-filter-map-reduce-dom',

  // Batch 7 (Videos 34-38): DOM Events & Async Basics
  'VQlY-X_eeTE': 'cat-7-dom-events-async-basics',
  'EGqHVjU-fas': 'cat-7-dom-events-async-basics',
  '_ALUMTa8BAE': 'cat-7-dom-events-async-basics',
  'zgt5oTD3rRc': 'cat-7-dom-events-async-basics',
  'efrW5-IYoCU': 'cat-7-dom-events-async-basics',

  // Batch 8 (Videos 39-43): Promises, Fetch & Prototypes
  'pDPAcYdSse8': 'cat-8-promises-fetch-prototypes',
  'NJwRQgsu1Q8': 'cat-8-promises-fetch-prototypes',
  'Rive84an6Lc': 'cat-8-promises-fetch-prototypes',
  'pN-Qmv4zBcI': 'cat-8-promises-fetch-prototypes',
  'uMI5cNeHTOc': 'cat-8-promises-fetch-prototypes',

  // Batch 9 (Videos 44-48): Classes, Call/Bind & Descriptors
  '-owpuf4lbyU': 'cat-9-classes-callbind-descriptors',
  'u6mVHkMpoMk': 'cat-9-classes-callbind-descriptors',
  '75dMiOY_4ac': 'cat-9-classes-callbind-descriptors',
  'jss2rL9kv6s': 'cat-9-classes-callbind-descriptors',
  't6vLhF-iSxQ': 'cat-9-classes-callbind-descriptors',

  // Batch 10 (Videos 49-51): Closures & V8 Internals
  'VaH09NXQZ58': 'cat-10-closures-v8-internals',
  'z9PINyinqwo': 'cat-10-closures-v8-internals',
  'ZRS485LxX0s': 'cat-10-closures-v8-internals',

  // Git & GitHub Masterclass (Hitesh Choudhary Chai aur Git)
  'q8EevlEpQ2A': 'cat-git-1-intro',
  'git_ch_1': 'cat-git-1-intro',
  'git_ch_2': 'cat-git-2-config',
  'git_ch_3': 'cat-git-3-staging',
  'git_ch_4': 'cat-git-4-commits',
  'git_ch_5': 'cat-git-5-branching',
  'git_ch_6': 'cat-git-6-remotes',
  'git_ch_7': 'cat-git-7-prs-open-source',
  'git_ch_8': 'cat-git-8-conflicts-rebase'
};

const DIFFICULTY_BADGES = {
  'easy': { label: 'Easy', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  'medium': { label: 'Medium', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  'hard': { label: 'Interview Challenge', color: 'bg-red-500/15 text-red-400 border-red-500/30' }
};

/**
 * Custom Popover Select Component
 * Replaces native browser HTML <select> with a modern, glassmorphism theme popover menu.
 */
function CustomSelect({ options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOpt = options.find(o => o.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative flex-1 min-w-0 ${isOpen ? 'z-50' : 'z-10'}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-zinc-900/90 border border-border/80 hover:border-primary/50 text-white text-xs font-semibold rounded-xl px-3.5 py-2.5 flex items-center justify-between transition cursor-pointer shadow-sm text-left gap-2 min-w-0"
      >
        <span className="truncate flex-1 min-w-0">{selectedOpt?.label}</span>
        <ChevronDown size={14} className={`text-zinc-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-zinc-900 border border-zinc-700 shadow-2xl rounded-xl p-1.5 space-y-0.5 z-50 max-h-64 overflow-y-auto">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between transition cursor-pointer ${
                  isSelected
                    ? 'bg-primary/20 text-white font-bold border border-primary/30'
                    : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                }`}
              >
                <span className="truncate flex-1 pr-2">{opt.label}</span>
                {isSelected && <Check size={14} className="text-primary flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * PracticeTab Component.
 * Displays 8-10 topic-specific, interview-focused coding practice questions per module,
 * with completion tracking, difficulty filtering, and expandable solution cheat sheets.
 *
 * @param {object} props
 * @param {string} props.courseId — Current course ID.
 * @param {string} props.lessonId — Current lesson ID.
 * @param {Array} props.practiceProgressList — Reactive Dexie practiceProgress records.
 * @param {Function} props.togglePractice — Toggle completion function.
 * @returns {React.JSX.Element}
 */
export default function PracticeTab({ courseId, lessonId, practiceProgressList, togglePractice }) {
  // Separate modules by Course Track
  const jsModules = jsTopicPractice.filter(t => !t.id.startsWith('cat-git'));
  const gitModules = jsTopicPractice.filter(t => t.id.startsWith('cat-git'));

  // Detect default catalog based on lesson/course
  const defaultTopicId = LESSON_TOPIC_MAP[lessonId] || 'cat-1-variables-datatypes';
  const initialCatalog = defaultTopicId.startsWith('cat-git') || courseId === 'git-github-masterclass-q8EevlEpQ2A' ? 'git' : 'js';

  const [activeCatalog, setActiveCatalog] = useState(initialCatalog);
  const [selectedTopicId, setSelectedTopicId] = useState(defaultTopicId);
  const [expandedSolutionId, setExpandedSolutionId] = useState(null);
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  // Flashcard Mode States
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'flashcard'
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Active module list based on selected catalog
  const activeModules = activeCatalog === 'git' ? gitModules : jsModules;

  // Fallback to first module in active catalog if current selection belongs to other catalog
  const currentModule = activeModules.find(t => t.id === selectedTopicId) || activeModules[0];

  const filteredQuestions = currentModule.questions.filter(q => 
    filterDifficulty === 'all' ? true : q.difficulty === filterDifficulty
  );

  const completedCount = currentModule.questions.filter(q =>
    practiceProgressList.some(p => p.id === `${lessonId}_${q.id}` && p.completed)
  ).length;

  const toggleSolution = (id) => {
    setExpandedSolutionId(expandedSolutionId === id ? null : id);
  };

  const handleCatalogSwitch = (catalogKey) => {
    setActiveCatalog(catalogKey);
    const targetList = catalogKey === 'git' ? gitModules : jsModules;
    setSelectedTopicId(targetList[0].id);
  };

  return (
    <div className="space-y-5">
      {/* Track Catalog Switcher Tabs */}
      <div className="flex flex-col sm:flex-row rounded-xl bg-zinc-900/90 p-1 border border-border text-xs font-bold gap-1 sm:gap-0">
        <button
          onClick={() => handleCatalogSwitch('js')}
          className={`flex-1 py-2.5 px-3 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer ${
            activeCatalog === 'js'
              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shadow'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <JsLogo size={18} />
          <span className="truncate">JavaScript Mastery (100 Qs)</span>
        </button>
        <button
          onClick={() => handleCatalogSwitch('git')}
          className={`flex-1 py-2.5 px-3 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer ${
            activeCatalog === 'git'
              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <GitLogo size={18} />
          <span className="truncate">Git & GitHub Mastery (40 Qs)</span>
        </button>
      </div>

      {/* Topic Module Selector Header */}
      <div className="space-y-3 pb-3 border-b border-border/50 min-w-0 w-full relative">
        <div className="flex items-start sm:items-center justify-between gap-2.5 min-w-0 w-full">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="px-2 py-0.5 rounded bg-zinc-800/90 border border-zinc-700/60 text-zinc-300 font-mono font-bold text-[10px] sm:text-[11px] flex-shrink-0">
              Module {(activeModules.findIndex(m => m.id === currentModule.id) + 1).toString().padStart(2, '0')}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight leading-snug break-words">{currentModule.topic}</h3>
              <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">{currentModule.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] sm:text-xs font-bold text-primary flex-shrink-0">
            <span>{completedCount}/{currentModule.questions.length} Solved</span>
          </div>
        </div>

        {/* Dropdown to Switch Topics within active catalog */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center min-w-0 w-full">
          <CustomSelect
            options={activeModules.map((mod, idx) => ({
              value: mod.id,
              label: `Module ${(idx + 1).toString().padStart(2, '0')}: ${mod.topic} (${mod.questions.length} Qs)`
            }))}
            value={currentModule.id}
            onChange={(val) => setSelectedTopicId(val)}
          />

          {/* Difficulty Filter & View Mode Switcher */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-36">
              <CustomSelect
                options={[
                  { value: 'all', label: 'All Difficulty' },
                  { value: 'easy', label: 'Easy' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'hard', label: 'Interview' }
                ]}
                value={filterDifficulty}
                onChange={(val) => setFilterDifficulty(val)}
              />
            </div>

            {/* View Mode Toggle Button */}
            <div className="flex p-0.5 rounded-xl bg-zinc-900 border border-border">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'list' ? 'bg-primary text-white shadow' : 'text-zinc-400 hover:text-white'
                }`}
                title="List View"
              >
                📋 List
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('flashcard');
                  setFlashcardIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-2.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'flashcard' ? 'bg-primary text-white shadow' : 'text-zinc-400 hover:text-white'
                }`}
                title="Flashcards Mode"
              >
                🎴 Flashcard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Render Questions: List Mode vs Flashcard Mode */}
      {viewMode === 'flashcard' && filteredQuestions.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400 px-1">
            <span>Card {flashcardIndex + 1} of {filteredQuestions.length}</span>
            <span>Click card to flip 💡</span>
          </div>

          {/* 3D Interactive Flashcard */}
          {(() => {
            const q = filteredQuestions[flashcardIndex] || filteredQuestions[0];
            const isCompleted = practiceProgressList.some(p => p.id === `${lessonId}_${q.id}` && p.completed);
            const diffBadge = DIFFICULTY_BADGES[q.difficulty] || DIFFICULTY_BADGES['easy'];

            return (
              <div 
                onClick={() => setIsFlipped(!isFlipped)}
                className={`glass-panel p-6 sm:p-8 rounded-2xl border transition duration-300 min-h-[220px] flex flex-col justify-between cursor-pointer shadow-xl ${
                  isFlipped 
                    ? 'bg-zinc-900/95 border-primary/40 shadow-primary/10' 
                    : 'bg-zinc-950/90 border-border hover:border-primary/30'
                }`}
              >
                {!isFlipped ? (
                  /* Front Side */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${diffBadge.color}`}>
                        {diffBadge.label}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">Tap to Flip 🔄</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white leading-snug">{q.title}</h3>
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">{q.question}</p>
                  </div>
                ) : (
                  /* Back Side (Solution Code) */
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-emerald-400">💡 Solution & Code Explanation</span>
                      <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">Tap to Flip Front 🔄</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap overflow-x-auto">
                      {q.solution}
                    </div>
                    {q.link && (
                      <a
                        href={q.link}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 text-xs text-accent font-bold hover:underline"
                      >
                        <ExternalLink size={13} />
                        <span>Read Official Spec & Exercises →</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Card Controls */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/50">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePractice(courseId, lessonId, q.id, q.link || '', !isCompleted);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isCompleted 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                    <span>{isCompleted ? 'Mastered' : 'Mark as Solved'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={flashcardIndex === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFlashcardIndex(prev => Math.max(0, prev - 1));
                        setIsFlipped(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-white disabled:opacity-40 cursor-pointer"
                    >
                      ← Prev
                    </button>
                    <button
                      type="button"
                      disabled={flashcardIndex === filteredQuestions.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFlashcardIndex(prev => Math.min(filteredQuestions.length - 1, prev + 1));
                        setIsFlipped(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-xs font-bold text-white disabled:opacity-40 cursor-pointer"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      ) : null}

      {/* Question Cards List (When viewMode === 'list') */}
      {viewMode === 'list' && (
        <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <p className="text-xs text-zinc-500 py-6 text-center">No questions matching selected difficulty filter.</p>
        ) : (
          filteredQuestions.map((q) => {
            const isCompleted = practiceProgressList.some(
              p => p.id === `${lessonId}_${q.id}` && p.completed
            );
            const isSolutionOpen = expandedSolutionId === q.id;
            const diffBadge = DIFFICULTY_BADGES[q.difficulty] || DIFFICULTY_BADGES['easy'];

            return (
              <div
                key={q.id}
                className={`group glass-panel rounded-xl p-3.5 sm:p-4 border transition duration-200 space-y-2.5 min-w-0 w-full overflow-hidden ${
                  isCompleted
                    ? 'border-emerald-500/25 bg-emerald-500/5'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                {/* Header Row */}
                <div className="flex items-start gap-2.5 min-w-0 w-full">
                  {/* Completion Checkbox */}
                  <button
                    onClick={() => togglePractice(courseId, lessonId, q.id, q.link || '', !isCompleted)}
                    className="mt-0.5 flex-shrink-0 cursor-pointer transition hover:scale-110"
                    title={isCompleted ? 'Mark as incomplete' : 'Mark as solved'}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={18} className="text-emerald-400" fill="currentColor" />
                    ) : (
                      <Circle size={18} className="text-zinc-700 group-hover:text-zinc-500" />
                    )}
                  </button>

                  {/* Title & Difficulty Badge */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-white leading-snug break-words flex-1 min-w-0">
                        {q.title}
                      </h4>
                      <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded uppercase flex-shrink-0 ${diffBadge.color}`}>
                        {diffBadge.label}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-zinc-400 mt-1 leading-relaxed break-words font-sans">
                      {q.question}
                    </p>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-between pt-1 border-t border-zinc-900 text-[11px]">
                  {/* Toggle Solution Button */}
                  <button
                    onClick={() => toggleSolution(q.id)}
                    className="flex items-center gap-1.5 text-primary hover:text-primary-hover font-semibold transition cursor-pointer"
                  >
                    <Lightbulb size={13} />
                    <span>{isSolutionOpen ? 'Hide Solution' : 'View Code Solution'}</span>
                    {isSolutionOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>

                  {/* External Reference Link */}
                  {q.link && (
                    <a
                      href={q.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-500 hover:text-zinc-300 transition flex items-center gap-1 font-medium"
                      title="Open reference guide"
                    >
                      <span>Doc</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>

                {/* Expandable Solution Box */}
                {isSolutionOpen && (
                  <div className="p-3 rounded-xl bg-zinc-950 border border-primary/20 space-y-2 text-xs animate-in fade-in duration-200">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px] uppercase tracking-wider">
                      <CheckCircle2 size={12} />
                      <span>Official Solution / Answer:</span>
                    </div>
                    <div className="font-mono text-[11px] text-zinc-200 leading-relaxed bg-zinc-900/80 p-3 rounded-lg border border-zinc-800/80 overflow-x-auto whitespace-pre-wrap">
                      {q.solution}
                    </div>
                  </div>
                )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
