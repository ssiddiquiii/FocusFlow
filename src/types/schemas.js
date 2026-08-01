import { z } from 'zod';
import { createQuestionIdentity } from '../features/practice/practiceIdentity.js';

/**
 * Zod validation schema for a Course.
 */
export const CourseSchema = z.object({
  id: z.string().min(1, 'Course ID is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().default(''),
  thumbnailUrl: z.string().optional().default(''),
  channelName: z.string().optional().default('Chai aur Code'),
  type: z.enum(['youtube', 'udemy']),
  udemyUrl: z.string().optional().default('')
});

/**
 * Zod validation schema for a Lesson (video or lecture).
 */
export const LessonSchema = z.object({
  id: z.string().min(1, 'Lesson ID is required'),
  courseId: z.string().min(1, 'Course ID is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().default(''),
  thumbnailUrl: z.string().optional().default(''),
  duration: z.string().optional().default('0:00'),
  index: z.number().int().min(1),
  type: z.enum(['youtube', 'udemy']),
  chapters: z.array(z.object({
    title: z.string(),
    timestamp: z.number(),
    formattedTime: z.string()
  })).optional()
});

/**
 * Zod validation schema for UserProgress.
 */
export const UserProgressSchema = z.object({
  id: z.string().min(1), // Formatted as "courseId_lessonId"
  courseId: z.string().min(1),
  lessonId: z.string().min(1),
  completed: z.boolean().default(false),
  watchTime: z.number().int().nonnegative().optional(), // in seconds
  currentTime: z.number().int().nonnegative().optional(), // legacy playback field
  lastWatched: z.number().int().positive(), // timestamp in ms
  updatedAt: z.number().int().positive().optional() // timestamp in ms
}).passthrough().transform((progress) => ({
  ...progress,
  watchTime: progress.watchTime ?? progress.currentTime ?? 0
}));

/**
 * Zod validation schema for a Note.
 */
export const NoteSchema = z.object({
  id: z.number().int().positive().optional(), // Dexie auto-increment primary key
  courseId: z.string().min(1),
  lessonId: z.string().min(1),
  timestamp: z.number().int().nonnegative(), // in seconds
  content: z.string().min(1, 'Note content cannot be empty'),
  createdAt: z.number().int().positive(), // timestamp in ms
  updatedAt: z.number().int().positive() // timestamp in ms
});

/**
 * Zod validation schema for PracticeProgress.
 * Tracks whether a user has completed a specific coding practice challenge.
 */
export const PracticeProgressSchema = z.object({
  id: z.string().min(1), // Legacy lesson/question ID or stable Practice question identity
  courseId: z.string().min(1),
  lessonId: z.string().min(1),
  practiceUrl: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? null : val),
    z.string().url().nullable().optional()
  ).default(null),
  identityVersion: z.literal(1).optional(),
  catalogId: z.preprocess(value => value === '' ? null : value, z.string().min(1).nullable().optional()),
  topicId: z.preprocess(value => value === '' ? null : value, z.string().min(1).nullable().optional()),
  questionId: z.preprocess(value => value === '' ? null : value, z.string().min(1).nullable().optional()),
  completed: z.boolean().default(false),
  completedAt: z.number().int().positive().optional() // timestamp in ms
}).passthrough().superRefine((practice, context) => {
  const identityFields = [practice.catalogId, practice.topicId, practice.questionId];
  const hasIdentityMetadata = practice.identityVersion !== undefined || identityFields.some(value => value != null);
  if (!hasIdentityMetadata) return;
  if (practice.identityVersion !== 1 || identityFields.some(value => value == null)) {
    context.addIssue({ code: 'custom', message: 'Stable Practice identity metadata must be complete.' });
    return;
  }
  if (practice.id !== createQuestionIdentity(practice)) {
    context.addIssue({ code: 'custom', path: ['id'], message: 'Practice record ID does not match its stable identity metadata.' });
  }
});

/**
 * Zod validation schema for the JSON backup export/import wrapper.
 */
export const BackupSchema = z.object({
  version: z.union([z.literal(1), z.literal(2)]),
  exportedAt: z.number().int().positive(),
  courses: z.array(CourseSchema),
  lessons: z.array(LessonSchema),
  progress: z.array(UserProgressSchema),
  notes: z.array(NoteSchema),
  practiceProgress: z.array(PracticeProgressSchema).optional().default([])
});

/**
 * Verifies cross-table relationships after structural parsing and before import.
 * Returns the parsed payload so callers cannot accidentally validate one object
 * and write another.
 */
export function parseBackupForImport(rawBackup) {
  const backup = BackupSchema.parse(rawBackup);
  const courseIds = new Set();
  const lessonsById = new Map();

  for (const course of backup.courses) {
    if (courseIds.has(course.id)) {
      throw new Error(`Backup contains duplicate course ID "${course.id}".`);
    }
    courseIds.add(course.id);
  }

  for (const lesson of backup.lessons) {
    if (!courseIds.has(lesson.courseId)) {
      throw new Error(`Lesson "${lesson.id}" references missing course "${lesson.courseId}".`);
    }
    if (lessonsById.has(lesson.id)) {
      throw new Error(`Backup contains duplicate lesson ID "${lesson.id}".`);
    }
    lessonsById.set(lesson.id, lesson);
  }

  const assertLearningReference = (record, recordType) => {
    const lesson = lessonsById.get(record.lessonId);
    if (!courseIds.has(record.courseId)) {
      throw new Error(`${recordType} "${record.id}" references missing course "${record.courseId}".`);
    }
    if (!lesson) {
      throw new Error(`${recordType} "${record.id}" references missing lesson "${record.lessonId}".`);
    }
    if (lesson.courseId !== record.courseId) {
      throw new Error(`${recordType} "${record.id}" has a course/lesson ownership mismatch.`);
    }
  };

  for (const progress of backup.progress) {
    assertLearningReference(progress, 'Progress record');
  }
  for (const note of backup.notes) {
    assertLearningReference(note, 'Note');
  }
  for (const practice of backup.practiceProgress) {
    assertLearningReference(practice, 'Practice record');
  }

  return backup;
}
