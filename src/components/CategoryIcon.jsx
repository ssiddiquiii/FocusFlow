import React from 'react';
import { 
  Code2, 
  Cpu, 
  Layers, 
  Boxes, 
  FunctionSquare, 
  Terminal, 
  LayoutGrid, 
  Zap, 
  Globe2, 
  ShieldCheck, 
  Atom,
  GitBranch,
  FolderGit2,
  GitCommit,
  GitPullRequest,
  FileCode2,
  Database
} from 'lucide-react';

/**
 * CategoryIcon Component
 * Renders realistic, vibrant, tech-branded icons for JS & Git topic modules.
 *
 * @param {object} props
 * @param {string} props.id — Category ID.
 * @param {string} [props.className] — Extra Tailwind CSS classes.
 * @param {number} [props.size=20] — Icon size.
 */
export default function CategoryIcon({ id, className = '', size = 20 }) {
  switch (id) {
    // 🟨 JAVASCRIPT CATEGORIES
    case 'cat-1-variables-datatypes':
      return (
        <div className={`p-1.5 rounded-lg bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 flex items-center justify-center ${className}`}>
          <Code2 size={size} />
        </div>
      );

    case 'cat-2-memory-strings-math':
      return (
        <div className={`p-1.5 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center justify-center ${className}`}>
          <Cpu size={size} />
        </div>
      );

    case 'cat-3-arrays-objects-json':
      return (
        <div className={`p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center ${className}`}>
          <Boxes size={size} />
        </div>
      );

    case 'cat-4-functions-scopes-this':
      return (
        <div className={`p-1.5 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center ${className}`}>
          <FunctionSquare size={size} />
        </div>
      );

    case 'cat-5-execution-callstack-control':
      return (
        <div className={`p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center ${className}`}>
          <Terminal size={size} />
        </div>
      );

    case 'cat-6-hofs-filter-map-reduce-dom':
      return (
        <div className={`p-1.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center ${className}`}>
          <LayoutGrid size={size} />
        </div>
      );

    case 'cat-7-dom-events-async-basics':
      return (
        <div className={`p-1.5 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center justify-center ${className}`}>
          <Zap size={size} />
        </div>
      );

    case 'cat-8-promises-fetch-prototypes':
      return (
        <div className={`p-1.5 rounded-lg bg-teal-500/15 text-teal-400 border border-teal-500/30 flex items-center justify-center ${className}`}>
          <Globe2 size={size} />
        </div>
      );

    case 'cat-9-classes-callbind-descriptors':
      return (
        <div className={`p-1.5 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center ${className}`}>
          <ShieldCheck size={size} />
        </div>
      );

    case 'cat-10-closures-v8-internals':
      return (
        <div className={`p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center ${className}`}>
          <Atom size={size} />
        </div>
      );

    // 🐙 GIT & GITHUB CATEGORIES
    case 'cat-git-1-intro':
      return (
        <div className={`p-1.5 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center justify-center ${className}`}>
          <GitBranch size={size} />
        </div>
      );

    case 'cat-git-2-config':
      return (
        <div className={`p-1.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center ${className}`}>
          <FileCode2 size={size} />
        </div>
      );

    case 'cat-git-3-staging':
      return (
        <div className={`p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center ${className}`}>
          <Layers size={size} />
        </div>
      );

    case 'cat-git-4-commits':
      return (
        <div className={`p-1.5 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center justify-center ${className}`}>
          <GitCommit size={size} />
        </div>
      );

    case 'cat-git-5-branching':
      return (
        <div className={`p-1.5 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center ${className}`}>
          <GitBranch size={size} />
        </div>
      );

    case 'cat-git-6-remotes':
      return (
        <div className={`p-1.5 rounded-lg bg-slate-500/15 text-white border border-slate-500/30 flex items-center justify-center ${className}`}>
          <FolderGit2 size={size} />
        </div>
      );

    case 'cat-git-7-prs-open-source':
      return (
        <div className={`p-1.5 rounded-lg bg-pink-500/15 text-pink-400 border border-pink-500/30 flex items-center justify-center ${className}`}>
          <GitPullRequest size={size} />
        </div>
      );

    case 'cat-git-8-conflicts-rebase':
      return (
        <div className={`p-1.5 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 flex items-center justify-center ${className}`}>
          <Database size={size} />
        </div>
      );

    default:
      return (
        <div className={`p-1.5 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center justify-center ${className}`}>
          <Code2 size={size} />
        </div>
      );
  }
}
