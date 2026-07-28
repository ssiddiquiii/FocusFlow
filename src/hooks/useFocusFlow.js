import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/FocusFlowDB';
import { useMemo } from 'react';

/**
 * Custom Production-Grade React Hook for FocusFlow core operations.
 * Handles reactive database queries, learning statistics, and
 * "Continue Learning" route detection.
 */
export function useFocusFlow() {
  // Reactive queries using Dexie useLiveQuery hook
  const courses = useLiveQuery(() => db.courses.toArray()) || [];
  const lessons = useLiveQuery(() => db.lessons.toArray()) || [];
  const progressList = useLiveQuery(() => db.progress.toArray()) || [];
  const notes = useLiveQuery(() => db.notes.toArray()) || [];
  const practiceProgressList = useLiveQuery(() => db.practiceProgress.toArray()) || [];

  /**
   * Fetches the progress value for a single course dynamically.
   * @param {string} courseId The course identifier.
   * @returns {Promise<number>} Percentage completed (0 - 100).
   */
  async function getCourseProgress(courseId) {
    const courseLessons = await db.lessons.where('courseId').equals(courseId).toArray();
    if (courseLessons.length === 0) return 0;

    const lessonIds = courseLessons.map(l => l.id);
    const completedCount = await db.progress
      .where('lessonId')
      .anyOf(lessonIds)
      .and(p => p.completed === true)
      .count();

    return Math.round((completedCount / courseLessons.length) * 100);
  }

  /**
   * Generates overall learning metrics for the Dashboard header stats.
   * @returns {object} Calculated stats (totalHours, completedLessons, totalNotes).
   */
  const stats = useMemo(() => {
    // Total notes written
    const totalNotes = notes.length;

    // Completed lessons count
    const completedLessons = progressList.filter(p => p.completed).length;

    // Total watch time calculated in hours
    const totalSeconds = progressList.reduce((acc, p) => acc + (p.watchTime || 0), 0);
    const totalHours = (totalSeconds / 3600).toFixed(1);

    return {
      totalHours,
      completedLessons,
      totalNotes
    };
  }, [notes, progressList]);

  /**
   * Business Rule: "Continue Learning"
   * latest in-progress lesson → first not-started lesson in most recently opened incomplete course → first course in catalog order.
   * @returns {Promise<{courseId: string, lessonId: string} | null>} Target path payload.
   */
  async function getContinueLearningPath() {
    try {
      // 1. Check for the most recently watched in-progress lesson
      let recentProgress = null;
      try {
        recentProgress = await db.progress
          .orderBy('lastWatched')
          .reverse()
          .filter(p => !p.completed)
          .first();
      } catch (err) {
        // Memory fallback if lastWatched index is building
        const allProgress = await db.progress.toArray();
        const inProgress = allProgress.filter(p => !p.completed && p.lastWatched);
        inProgress.sort((a, b) => (b.lastWatched || 0) - (a.lastWatched || 0));
        recentProgress = inProgress[0] || null;
      }

      if (recentProgress) {
        return { courseId: recentProgress.courseId, lessonId: recentProgress.lessonId };
      }

      // 2. Find the most recently opened incomplete course
      let recentWatchedAny = null;
      try {
        recentWatchedAny = await db.progress
          .orderBy('lastWatched')
          .reverse()
          .first();
      } catch (err) {
        const allProgress = await db.progress.toArray();
        allProgress.sort((a, b) => (b.lastWatched || 0) - (a.lastWatched || 0));
        recentWatchedAny = allProgress[0] || null;
      }

      if (recentWatchedAny) {
        const courseLessons = await db.lessons
          .where('courseId')
          .equals(recentWatchedAny.courseId)
          .sortBy('index');

        for (const lesson of courseLessons) {
          const prog = await db.progress.get(`${recentWatchedAny.courseId}_${lesson.id}`);
          if (!prog || !prog.completed) {
            return { courseId: recentWatchedAny.courseId, lessonId: lesson.id };
          }
        }
      }
    } catch (globalErr) {
      console.warn('Fallback continue learning path used due to DB indexing:', globalErr);
    }

    // 3. Fallback: First lesson of the first course in catalog
    const firstCourse = await db.courses.orderBy('title').first();
    if (firstCourse) {
      const firstLesson = await db.lessons
        .where('courseId')
        .equals(firstCourse.id)
        .sortBy('index');
      if (firstLesson.length > 0) {
        return { courseId: firstCourse.id, lessonId: firstLesson[0].id };
      }
    }

    return null;
  }

  /**
   * Finds the most recently watched lesson for a specific course.
   * Used to enable YouTube-style per-catalog "resume" tracking.
   * @param {string} courseId Course ID.
   * @returns {Promise<{lessonId: string} | null>}
   */
  async function getLastWatchedLesson(courseId) {
    const lastProgress = await db.progress
      .where('courseId')
      .equals(courseId)
      .filter(p => (p.watchTime || 0) > 0)
      .sortBy('lastWatched');

    if (lastProgress && lastProgress.length > 0) {
      // Most recent is last after sortBy
      const last = lastProgress[lastProgress.length - 1];
      if (!last.completed) {
        return { lessonId: last.lessonId, watchTime: last.watchTime };
      }
      // If completed, find first incomplete instead
    }
    return null;
  }

  return {
    courses,
    lessons,
    progressList,
    notes,
    practiceProgressList,
    stats,
    getCourseProgress,
    getContinueLearningPath,
    getLastWatchedLesson
  };
}
