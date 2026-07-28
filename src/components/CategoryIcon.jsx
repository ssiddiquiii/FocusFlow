import React from 'react';
import { FlaticonJS, FlaticonGit } from './FlaticonIcons';

/**
 * CategoryIcon Component
 * Renders authentic SimpleIcons / Devicon SVG logos for JavaScript & Git modules with clean number indicators.
 *
 * @param {object} props
 * @param {string} props.id — Category ID.
 * @param {string} [props.className] — Extra Tailwind CSS classes.
 * @param {number} [props.size=18] — Icon size.
 */
export default function CategoryIcon({ id, className = '', size = 18 }) {
  const isGit = id?.includes('git');

  const numberMap = {
    'cat-1-variables-datatypes': '01',
    'cat-2-memory-strings-math': '02',
    'cat-3-arrays-objects-json': '03',
    'cat-4-functions-scopes-this': '04',
    'cat-5-execution-callstack-control': '05',
    'cat-6-hofs-filter-map-reduce-dom': '06',
    'cat-7-dom-events-async-basics': '07',
    'cat-8-promises-fetch-prototypes': '08',
    'cat-9-classes-callbind-descriptors': '09',
    'cat-10-closures-v8-internals': '10',

    'cat-git-1-intro': '01',
    'cat-git-2-config': '02',
    'cat-git-3-staging': '03',
    'cat-git-4-commits': '04',
    'cat-git-5-branching': '05',
    'cat-git-6-remotes': '06',
    'cat-git-7-prs-open-source': '07',
    'cat-git-8-conflicts-rebase': '08'
  };

  const num = numberMap[id] || '01';

  if (isGit) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <FlaticonGit size={size} />
        <span className="font-mono text-xs font-bold text-orange-400">#{num}</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <FlaticonJS size={size} />
      <span className="font-mono text-xs font-bold text-yellow-400">#{num}</span>
    </div>
  );
}
