import Dexie from 'dexie';
import { CourseSchema, LessonSchema, BackupSchema, parseBackupForImport } from '../types/schemas';

const loadSeedData = async () => (await import('./seedData.json')).default;

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
   * Seeds defaults only for a genuinely new, completely empty database.
   * Existing or partially populated databases are never repaired or overwritten.
   * @returns {Promise<void>}
   */
  async seedIfEmpty() {
    const seedData = await loadSeedData();
    return this.transaction(
      'rw',
      [this.courses, this.lessons, this.progress, this.notes, this.practiceProgress],
      async () => {
        const counts = await Promise.all([
          this.courses.count(),
          this.lessons.count(),
          this.progress.count(),
          this.notes.count(),
          this.practiceProgress.count()
        ]);

        if (counts.some(count => count > 0)) {
          return false;
        }

        const courses = seedData.courses.map(course => CourseSchema.parse(course));
        const lessons = seedData.lessons.map(lesson => LessonSchema.parse(lesson));
        await this.courses.bulkAdd(courses);
        await this.lessons.bulkAdd(lessons);
        return true;
      }
    );
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
    const seedData = await loadSeedData();
    await this.transaction('rw', [this.courses, this.lessons, this.progress, this.notes, this.practiceProgress], async () => {
      await this.courses.clear();
      await this.lessons.clear();
      await this.progress.clear();
      await this.notes.clear();
      await this.practiceProgress.clear();
      await this.courses.bulkAdd(seedData.courses.map(course => CourseSchema.parse(course)));
      await this.lessons.bulkAdd(seedData.lessons.map(lesson => LessonSchema.parse(lesson)));
    });
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
    const validatedBackup = parseBackupForImport(rawBackup);

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
