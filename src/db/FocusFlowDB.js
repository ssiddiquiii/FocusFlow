import Dexie from 'dexie';
import seedData from './seedData.json';
import { CourseSchema, LessonSchema, UserProgressSchema, NoteSchema, PracticeProgressSchema, BackupSchema } from '../types/schemas';

/**
 * FocusFlow Local-First Browser Database
 * Manages IndexedDB tables using Dexie wrapper.
 */
class FocusFlowDB extends Dexie {
  constructor() {
    super('FocusFlowDB');
    
    // Define database tables and index keys
    this.version(1).stores({
      courses: 'id, title, type',
      lessons: 'id, courseId, index, type',
      progress: 'id, courseId, lessonId, completed',
      notes: '++id, courseId, lessonId, timestamp'
    });

    // Version 2: Add practice progress tracking table
    this.version(2).stores({
      courses: 'id, title, type',
      lessons: 'id, courseId, index, type',
      progress: 'id, courseId, lessonId, completed',
      notes: '++id, courseId, lessonId, timestamp',
      practiceProgress: 'id, courseId, lessonId, completed'
    });

    // Version 3: Add lastWatched index to progress table & compound [courseId+lessonId] to notes
    this.version(3).stores({
      courses: 'id, title, type',
      lessons: 'id, courseId, index, type',
      progress: 'id, courseId, lessonId, completed, lastWatched',
      notes: '++id, courseId, lessonId, [courseId+lessonId], timestamp',
      practiceProgress: 'id, courseId, lessonId, completed'
    });

    this.courses = this.table('courses');
    this.lessons = this.table('lessons');
    this.progress = this.table('progress');
    this.notes = this.table('notes');
    this.practiceProgress = this.table('practiceProgress');
  }

  /**
   * Seeds the database with pre-populated course metadata if empty.
   * Runs inside a Dexie transaction to ensure database integrity.
   * @returns {Promise<void>}
   */
  async seedIfEmpty() {
    // Auto-migration: Clean up unneeded courses (React, Backend, Computer Network, Legacy Udemy)
    const coursesToRemove = ['udemy-agentic-ai', 'PLu71SKxNbfoDqgPchmvIsL4hTnJIrtige', 'PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW', 'PLd1s-PEC5Pio'];
    await this.transaction('rw', [this.courses, this.lessons], async () => {
      for (const id of coursesToRemove) {
        const exists = await this.courses.get(id);
        if (exists) {
          await this.courses.delete(id);
          await this.lessons.where('courseId').equals(id).delete();
        }
      }
    });

    // Auto-migration: Ensure Git & GitHub Masterclass is seeded & updated to single masterclass video
    const gitCourseId = 'git-github-masterclass-q8EevlEpQ2A';
    const gitSeedCourse = seedData.courses.find(c => c.id === gitCourseId);
    const gitSeedLessons = seedData.lessons.filter(l => l.courseId === gitCourseId);
    if (gitSeedCourse) {
      await this.transaction('rw', [this.courses, this.lessons], async () => {
        await this.courses.put(CourseSchema.parse(gitSeedCourse));
        // Remove legacy multi-chapter lessons and insert 1 single masterclass video
        await this.lessons.where('courseId').equals(gitCourseId).delete();
        await this.lessons.bulkPut(gitSeedLessons.map(l => LessonSchema.parse(l)));
      });
    }

    const courseCount = await this.courses.count();
    if (courseCount > 0) {
      return;
    }

    console.log('Seeding FocusFlow database with default courses...');
    
    await this.transaction('rw', [this.courses, this.lessons], async () => {
      // Validate and insert courses
      const validatedCourses = seedData.courses.map(c => CourseSchema.parse(c));
      await this.courses.bulkPut(validatedCourses);

      // Validate and insert lessons
      const validatedLessons = seedData.lessons.map(l => LessonSchema.parse(l));
      await this.lessons.bulkPut(validatedLessons);
    });
    
    console.log('Seeding completed successfully.');
  }

  /**
   * Clears user watch progress and timestamped notes while preserving all course catalogs and imported courses.
   * @returns {Promise<void>}
   */
  async clearProgressAndNotes() {
    await this.transaction('rw', [this.progress, this.notes, this.practiceProgress], async () => {
      await this.progress.clear();
      await this.notes.clear();
      await this.practiceProgress.clear();
    });
  }

  /**
   * Resets all progress, notes, and restores default courses (Full Factory Reset).
   * @returns {Promise<void>}
   */
  async resetDatabase() {
    await this.transaction('rw', [this.courses, this.lessons, this.progress, this.notes, this.practiceProgress], async () => {
      await this.courses.clear();
      await this.lessons.clear();
      await this.progress.clear();
      await this.notes.clear();
      await this.practiceProgress.clear();
    });
    await this.seedIfEmpty();
  }

  /**
   * Exports all database tables as a validated JSON backup structure.
   * @returns {Promise<object>} The backup payload.
   */
  async exportBackup() {
    const courses = await this.courses.toArray();
    const lessons = await this.lessons.toArray();
    const progress = await this.progress.toArray();
    const notes = await this.notes.toArray();
    const practiceProgress = await this.practiceProgress.toArray();

    const backupPayload = {
      version: 2,
      exportedAt: Date.now(),
      courses,
      lessons,
      progress,
      notes,
      practiceProgress
    };

    // Validate structure via Zod before returning
    return BackupSchema.parse(backupPayload);
  }

  /**
   * Imports and restores a backup JSON structure after strict validation.
   * @param {object} rawBackup The raw backup object to restore.
   * @returns {Promise<void>}
   */
  async importBackup(rawBackup) {
    // Validate backup structure via Zod
    const validatedBackup = BackupSchema.parse(rawBackup);

    await this.transaction('rw', [this.courses, this.lessons, this.progress, this.notes, this.practiceProgress], async () => {
      // Clear current data
      await this.courses.clear();
      await this.lessons.clear();
      await this.progress.clear();
      await this.notes.clear();
      await this.practiceProgress.clear();

      // Ingest backed-up records
      await this.courses.bulkPut(validatedBackup.courses);
      await this.lessons.bulkPut(validatedBackup.lessons);
      await this.progress.bulkPut(validatedBackup.progress);
      await this.notes.bulkPut(validatedBackup.notes);
      if (validatedBackup.practiceProgress) {
        await this.practiceProgress.bulkPut(validatedBackup.practiceProgress);
      }
    });
  }
}

// Instantiate and export a single global database instance
export const db = new FocusFlowDB();
