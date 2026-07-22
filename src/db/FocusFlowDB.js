import Dexie from 'dexie';
import seedData from './seedData.json';
import { CourseSchema, LessonSchema, UserProgressSchema, NoteSchema, BackupSchema } from '../types/schemas';

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

    this.courses = this.table('courses');
    this.lessons = this.table('lessons');
    this.progress = this.table('progress');
    this.notes = this.table('notes');
  }

  /**
   * Seeds the database with pre-populated course metadata if empty.
   * Runs inside a Dexie transaction to ensure database integrity.
   * @returns {Promise<void>}
   */
  async seedIfEmpty() {
    const courseCount = await this.courses.count();
    if (courseCount > 0) {
      console.log('Database already seeded. Skipping.');
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
    await this.transaction('rw', [this.progress, this.notes], async () => {
      await this.progress.clear();
      await this.notes.clear();
    });
  }

  /**
   * Resets all progress, notes, and restores default courses (Full Factory Reset).
   * @returns {Promise<void>}
   */
  async resetDatabase() {
    await this.transaction('rw', [this.courses, this.lessons, this.progress, this.notes], async () => {
      await this.courses.clear();
      await this.lessons.clear();
      await this.progress.clear();
      await this.notes.clear();
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

    const backupPayload = {
      version: 1,
      exportedAt: Date.now(),
      courses,
      lessons,
      progress,
      notes
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

    await this.transaction('rw', [this.courses, this.lessons, this.progress, this.notes], async () => {
      // Clear current data
      await this.courses.clear();
      await this.lessons.clear();
      await this.progress.clear();
      await this.notes.clear();

      // Ingest backed-up records
      await this.courses.bulkPut(validatedBackup.courses);
      await this.lessons.bulkPut(validatedBackup.lessons);
      await this.progress.bulkPut(validatedBackup.progress);
      await this.notes.bulkPut(validatedBackup.notes);
    });
  }
}

// Instantiate and export a single global database instance
export const db = new FocusFlowDB();
