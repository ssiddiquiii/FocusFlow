import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/FocusFlowDB';
import {
  selectContinueLearningPath,
  selectCourseProgressMap,
  selectDashboardStats,
  selectSortedCourses
} from '../utils/selectors';

const EMPTY_LIST = Object.freeze([]);

export function useDashboardData() {
  const courses = useLiveQuery(() => db.courses.toArray()) ?? EMPTY_LIST;
  const lessons = useLiveQuery(() => db.lessons.toArray()) ?? EMPTY_LIST;
  const progressList = useLiveQuery(() => db.progress.toArray()) ?? EMPTY_LIST;
  const practiceProgressList =
    useLiveQuery(() => db.practiceProgress.toArray()) ?? EMPTY_LIST;
  const totalNotes = useLiveQuery(() => db.notes.count()) ?? 0;

  const courseProgressMap = useMemo(
    () => selectCourseProgressMap(courses, lessons, progressList),
    [courses, lessons, progressList]
  );
  const continuePath = useMemo(
    () => selectContinueLearningPath(courses, lessons, progressList),
    [courses, lessons, progressList]
  );
  const sortedCourses = useMemo(
    () => selectSortedCourses(courses, progressList),
    [courses, progressList]
  );
  const stats = useMemo(
    () => selectDashboardStats(progressList, totalNotes),
    [progressList, totalNotes]
  );

  return {
    progressList,
    practiceProgressList,
    courseProgressMap,
    continuePath,
    sortedCourses,
    stats
  };
}
