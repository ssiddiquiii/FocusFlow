import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/FocusFlowDB';
import { useState, useEffect, useMemo } from 'react';

/**
 * Custom Production-Grade React Hook for FocusFlow core operations.
 * Handles reactive database queries, seeder execution, learning statistics,
 * backup transactions, and "Continue Learning" route detection.
 */
export function useFocusFlow() {
  const [isInitializing, setIsInitializing] = useState(true);

  // Automatically trigger database seeding on initial hook mount
  useEffect(() => {
    async function initDb() {
      try {
        await db.seedIfEmpty();
      } catch (err) {
        console.error('Error during database seeding:', err);
      } finally {
        setIsInitializing(false);
      }
    }
    initDb();
  }, []);

  // Reactive queries using Dexie useLiveQuery hook
  const courses = useLiveQuery(() => db.courses.toArray()) || [];
  const lessons = useLiveQuery(() => db.lessons.toArray()) || [];
  const progressList = useLiveQuery(() => db.progress.toArray()) || [];
  const notes = useLiveQuery(() => db.notes.toArray()) || [];

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
    // 1. Check for the most recently watched in-progress lesson
    const recentProgress = await db.progress
      .orderBy('lastWatched')
      .reverse()
      .filter(p => !p.completed)
      .first();

    if (recentProgress) {
      return { courseId: recentProgress.courseId, lessonId: recentProgress.lessonId };
    }

    // 2. Find the most recently opened incomplete course
    const recentWatchedAny = await db.progress
      .orderBy('lastWatched')
      .reverse()
      .first();

    if (recentWatchedAny) {
      // Find the first uncompleted/not-started lesson in this course
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

    // 3. Fallback: return the very first lesson of the first course in database catalog order
    const firstCourse = await db.courses.first();
    if (firstCourse) {
      const firstLesson = await db.lessons
        .where('courseId')
        .equals(firstCourse.id)
        .sortBy('index')
        .then(list => list[0]);
        
      if (firstLesson) {
        return { courseId: firstCourse.id, lessonId: firstLesson.id };
      }
    }

    return null;
  }

  /**
   * Saves or updates a video playback progress index.
   * @param {string} courseId Course ID.
   * @param {string} lessonId Lesson ID.
   * @param {number} seconds Current watch position seconds.
   * @param {boolean} completed Mark completed flag.
   */
  async function saveProgress(courseId, lessonId, seconds, completed = false) {
    const progressId = `${courseId}_${lessonId}`;
    const now = Date.now();

    await db.progress.put({
      id: progressId,
      courseId,
      lessonId,
      completed,
      watchTime: Math.round(seconds),
      lastWatched: now,
      updatedAt: now
    });
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

  /**
   * Ingests a new course dynamically (either fetched via YouTube API or seeded).
   * @param {object} course Course model object.
   * @param {Array<object>} lessonsList Lessons list array.
   */
  async function importCourse(course, lessonsList) {
    await db.transaction('rw', [db.courses, db.lessons], async () => {
      await db.courses.put(course);
      await db.lessons.bulkPut(lessonsList);
    });
  }

  /**
   * Deletes a course and all associated lessons, progress, and timestamped notes from Dexie IndexedDB.
   * @param {string} courseId Course ID.
   */
  async function deleteCourse(courseId) {
    await db.transaction('rw', [db.courses, db.lessons, db.progress, db.notes], async () => {
      await db.courses.delete(courseId);
      await db.lessons.where('courseId').equals(courseId).delete();
      await db.progress.where('courseId').equals(courseId).delete();
      await db.notes.where('courseId').equals(courseId).delete();
    });
  }

  return {
    courses,
    lessons,
    progressList,
    notes,
    stats,
    isInitializing,
    getCourseProgress,
    getContinueLearningPath,
    getLastWatchedLesson,
    saveProgress,
    importCourse,
    deleteCourse,
    clearProgressAndNotes: () => db.clearProgressAndNotes(),
    resetDatabase: () => db.resetDatabase(),
    exportBackup: () => db.exportBackup(),
    importBackup: (backup) => db.importBackup(backup)
  };
}
