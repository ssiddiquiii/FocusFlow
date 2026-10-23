export const LESSON_TOPIC_MAP = {
  'yY0bKZNYmJs': 'cat-1-variables-datatypes', '-9knnv97wSc': 'cat-1-variables-datatypes', 'X7hDBhd_L5U': 'cat-1-variables-datatypes', 'N9el4APFtAo': 'cat-1-variables-datatypes', 'giP2uXMlv4c': 'cat-1-variables-datatypes',
  'suMvZWjjKbo': 'cat-2-memory-strings-math', '7gwc-1czolw': 'cat-2-memory-strings-math', 'fozwNnFunlo': 'cat-2-memory-strings-math', '_KqpeDc47Ro': 'cat-2-memory-strings-math', 'tGLCuoumaGY': 'cat-2-memory-strings-math',
  'cejBux2gtEE': 'cat-3-arrays-objects-json', 'm6azhgyCi-k': 'cat-3-arrays-objects-json', 'vVYOHmqQDCU': 'cat-3-arrays-objects-json', '4lb2pXWWXJI': 'cat-3-arrays-objects-json', 'AViTh83k-IE': 'cat-3-arrays-objects-json',
  'Bn56WahG_t0': 'cat-4-functions-scopes-this', 't7ZHPhgdA4U': 'cat-4-functions-scopes-this', 'cHHU0jXfjKY': 'cat-4-functions-scopes-this', 'eWwge2YpHhc': 'cat-4-functions-scopes-this', '9ksqBa8_txM': 'cat-4-functions-scopes-this',
  'GAIbn16Iytc': 'cat-5-execution-callstack-control', 'ByhtOgF6uYM': 'cat-5-execution-callstack-control', '0P_YvC6Gg0c': 'cat-5-execution-callstack-control', 'Y1cpFsXrEgY': 'cat-5-execution-callstack-control', 'w3Q55-l47P0': 'cat-5-execution-callstack-control',
  'M0YImBHQsWU': 'cat-6-hofs-filter-map-reduce-dom', '9MfwYoWKKVE': 'cat-6-hofs-filter-map-reduce-dom', 'DcjNkHtDj8A': 'cat-6-hofs-filter-map-reduce-dom', 'Ab6K57WjWTE': 'cat-6-hofs-filter-map-reduce-dom', 'xAvTgCsCHLs': 'cat-6-hofs-filter-map-reduce-dom',
  'VQlY-X_eeTE': 'cat-7-dom-events-async-basics', 'EGqHVjU-fas': 'cat-7-dom-events-async-basics', '_ALUMTa8BAE': 'cat-7-dom-events-async-basics', 'zgt5oTD3rRc': 'cat-7-dom-events-async-basics', 'efrW5-IYoCU': 'cat-7-dom-events-async-basics',
  'pDPAcYdSse8': 'cat-8-promises-fetch-prototypes', 'NJwRQgsu1Q8': 'cat-8-promises-fetch-prototypes', 'Rive84an6Lc': 'cat-8-promises-fetch-prototypes', 'pN-Qmv4zBcI': 'cat-8-promises-fetch-prototypes', 'uMI5cNeHTOc': 'cat-8-promises-fetch-prototypes',
  '-owpuf4lbyU': 'cat-9-classes-callbind-descriptors', 'u6mVHkMpoMk': 'cat-9-classes-callbind-descriptors', '75dMiOY_4ac': 'cat-9-classes-callbind-descriptors', 'jss2rL9kv6s': 'cat-9-classes-callbind-descriptors', 't6vLhF-iSxQ': 'cat-9-classes-callbind-descriptors',
  'VaH09NXQZ58': 'cat-10-closures-v8-internals', 'z9PINyinqwo': 'cat-10-closures-v8-internals', 'ZRS485LxX0s': 'cat-10-closures-v8-internals',
  'q8EevlEpQ2A': 'cat-git-1-intro', 'git_ch_1': 'cat-git-1-intro', 'git_ch_2': 'cat-git-2-config', 'git_ch_3': 'cat-git-3-staging', 'git_ch_4': 'cat-git-4-commits', 'git_ch_5': 'cat-git-5-branching', 'git_ch_6': 'cat-git-6-remotes', 'git_ch_7': 'cat-git-7-prs-open-source', 'git_ch_8': 'cat-git-8-conflicts-rebase'
};

export const SPEED_OPTIONS = [0.5, 1, 1.25, 1.5, 2];
export const QUALITY_OPTIONS = [
  { label: 'Auto', value: 'auto' }, { label: '4K', value: 'highres' },
  { label: '2K', value: 'hd1440' }, { label: '1080p', value: 'hd1080' },
  { label: '720p', value: 'hd720' }, { label: '480p', value: 'large' },
  { label: '360p', value: 'medium' }
];

export function formatSeconds(totalSeconds) {
  if (isNaN(totalSeconds) || totalSeconds === null) return '0:00';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
