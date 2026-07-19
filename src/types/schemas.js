import { z } from 'zod';

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
  type: z.enum(['youtube', 'udemy'])
});

/**
 * Zod validation schema for UserProgress.
 */
export const UserProgressSchema = z.object({
  id: z.string().min(1), // Formatted as "courseId_lessonId"
  courseId: z.string().min(1),
  lessonId: z.string().min(1),
  completed: z.boolean().default(false),
  watchTime: z.number().int().nonnegative().default(0), // in seconds
  lastWatched: z.number().int().positive() // timestamp in ms
});

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
 * Zod validation schema for the JSON backup export/import wrapper.
 */
export const BackupSchema = z.object({
  version: z.number().int().positive(),
  exportedAt: z.number().int().positive(),
  courses: z.array(CourseSchema),
  lessons: z.array(LessonSchema),
  progress: z.array(UserProgressSchema),
  notes: z.array(NoteSchema)
});
