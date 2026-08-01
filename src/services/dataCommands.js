import { db } from '../db/FocusFlowDB';
import { CourseSchema, LessonSchema } from '../types/schemas';
import { practiceCatalog } from '../features/practice/practiceCatalog';
import { classifyPracticeRecord, createQuestionIdentity } from '../features/practice/practiceIdentity';

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

export async function togglePractice(courseId, lessonId, question, completedOrUrl, legacyCompleted) {
  if (typeof question === 'string') {
    const legacyId = `${lessonId}_${question}`;
    if (legacyCompleted) {
      await db.practiceProgress.put({
        id: legacyId,
        courseId,
        lessonId,
        practiceUrl: completedOrUrl || null,
        completed: true,
        completedAt: Date.now()
      });
    } else {
      await db.practiceProgress.delete(legacyId);
    }
    return;
  }

  const completed = completedOrUrl;
  const descriptor = {
    catalogId: question.catalogId,
    topicId: question.topicId,
    questionId: question.questionId
  };
  const id = createQuestionIdentity(descriptor);
  if (!practiceCatalog.identities.has(id)) throw new Error('Practice question is not in the validated catalog.');

  await db.transaction('rw', db.practiceProgress, async () => {
    const existing = await db.practiceProgress.get(id);
    await db.practiceProgress.put({
      ...existing,
      id,
      courseId,
      lessonId,
      practiceUrl: question.practiceUrl || null,
      identityVersion: 1,
      ...descriptor,
      completed,
      ...(completed ? { completedAt: existing?.completedAt ?? Date.now() } : {})
    });

    if (!completed) {
      const records = await db.practiceProgress.toArray();
      const legacyMatches = records.filter(record => {
        const result = classifyPracticeRecord(record, practiceCatalog);
        return result.status === 'legacy-unambiguous' && result.identity === id;
      });
      await Promise.all(legacyMatches.map(record => db.practiceProgress.update(record.id, { completed: false })));
    }
  });
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

export async function updateNote(noteId, content) {
  const now = Date.now();
  return db.transaction('rw', db.notes, async () => {
    const existing = await db.notes.get(noteId);
    if (!existing) throw new Error('The note no longer exists.');
    await db.notes.put({
      ...existing,
      content,
      updatedAt: now
    });
  });
}

export function deleteNote(noteId) {
  return db.notes.delete(noteId);
}

export const exportNotes = () => db.notes.toArray();
export const exportBackup = () => db.exportBackup();
export const importBackup = backup => db.importBackup(backup);
export const clearProgressAndNotes = () => db.clearProgressAndNotes();
export const resetDatabase = () => db.resetDatabase();
