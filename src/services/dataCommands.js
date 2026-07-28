import { db } from '../db/FocusFlowDB';
import { CourseSchema, LessonSchema } from '../types/schemas';

export async function saveProgress(courseId, lessonId, seconds, completed = false) {
  const progressId = `${courseId}_${lessonId}`;
  const now = Date.now();

  await db.transaction('rw', db.progress, async () => {
    const existing = await db.progress.get(progressId);
    await db.progress.put({
      ...existing,
      id: progressId,
      courseId,
      lessonId,
      completed: completed || existing?.completed === true,
      watchTime: Math.max(0, Math.round(seconds)),
      lastWatched: now,
      updatedAt: now
    });
  });
}

export async function setLessonCompletion(courseId, lessonId, completed, seconds = 0) {
  const progressId = `${courseId}_${lessonId}`;
  const now = Date.now();

  await db.transaction('rw', db.progress, async () => {
    const existing = await db.progress.get(progressId);
    await db.progress.put({
      ...existing,
      id: progressId,
      courseId,
      lessonId,
      completed,
      watchTime: Math.max(0, Math.round(seconds)),
      lastWatched: now,
      updatedAt: now
    });
  });
}

export async function importCourse(courseInput, lessonsInput) {
  const course = CourseSchema.parse(courseInput);
  const lessons = lessonsInput.map(lesson => LessonSchema.parse(lesson));

  if (lessons.some(lesson => lesson.courseId !== course.id)) {
    throw new Error('Every imported lesson must belong to the imported course.');
  }

  await db.transaction('rw', [db.courses, db.lessons], async () => {
    const existingLessons = await db.lessons.bulkGet(lessons.map(lesson => lesson.id));
    const collision = existingLessons.find(
      lesson => lesson && lesson.courseId !== course.id
    );
    if (collision) {
      throw new Error(
        `Cannot import this playlist because lesson "${collision.id}" already belongs to another course.`
      );
    }

    await db.courses.put(course);
    await db.lessons.bulkPut(lessons);
  });
}

export async function deleteCourse(courseId) {
  await db.transaction('rw', [db.courses, db.lessons, db.progress, db.notes, db.practiceProgress], async () => {
    await db.courses.delete(courseId);
    await db.lessons.where('courseId').equals(courseId).delete();
    await db.progress.where('courseId').equals(courseId).delete();
    await db.notes.where('courseId').equals(courseId).delete();
    await db.practiceProgress.where('courseId').equals(courseId).delete();
  });
}

export async function togglePractice(courseId, lessonId, practiceIndex, practiceUrl, completed) {
  const id = `${lessonId}_${practiceIndex}`;
  if (completed) {
    await db.practiceProgress.put({
      id,
      courseId,
      lessonId,
      practiceUrl,
      completed: true,
      completedAt: Date.now()
    });
  } else {
    await db.practiceProgress.delete(id);
  }
}

export async function createNote({ courseId, lessonId, timestamp, content }) {
  const now = Date.now();
  return db.notes.add({
    courseId,
    lessonId,
    timestamp,
    content,
    createdAt: now,
    updatedAt: now
  });
}

export function deleteNote(noteId) {
  return db.notes.delete(noteId);
}

export const exportBackup = () => db.exportBackup();
export const importBackup = backup => db.importBackup(backup);
export const clearProgressAndNotes = () => db.clearProgressAndNotes();
export const resetDatabase = () => db.resetDatabase();
