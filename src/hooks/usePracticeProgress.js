import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/FocusFlowDB';

const EMPTY_LIST = Object.freeze([]);

export function usePracticeProgress() {
  return useLiveQuery(() => db.practiceProgress.toArray()) ?? EMPTY_LIST;
}
