export const getWatchedSeconds = progress =>
  Math.max(0, progress?.watchTime ?? progress?.currentTime ?? 0);

export function selectCourseProgressMap(courses, lessons, progressList) {
  const lessonIdsByCourse = new Map();
  for (const lesson of lessons) {
    const lessonIds = lessonIdsByCourse.get(lesson.courseId) || [];
    lessonIds.push(lesson.id);
    lessonIdsByCourse.set(lesson.courseId, lessonIds);
  }

  const completedIds = new Set(
    progressList
      .filter(progress => progress.completed === true)
      .map(progress => `${progress.courseId}_${progress.lessonId}`)
  );

  return Object.fromEntries(courses.map(course => {
    const lessonIds = lessonIdsByCourse.get(course.id) || [];
    if (lessonIds.length === 0) return [course.id, 0];
    const completedCount = lessonIds.filter(
      lessonId => completedIds.has(`${course.id}_${lessonId}`)
    ).length;
    return [course.id, Math.round((completedCount / lessonIds.length) * 100)];
  }));
}

export function selectSortedCourses(courses, progressList) {
  const latestActivityByCourse = new Map();
  for (const progress of progressList) {
    const activityTime = progress.updatedAt ?? progress.lastWatched ?? 0;
    latestActivityByCourse.set(
      progress.courseId,
      Math.max(latestActivityByCourse.get(progress.courseId) || 0, activityTime)
    );
  }

  return [...courses].sort((courseA, courseB) => {
    const activityDifference =
      (latestActivityByCourse.get(courseB.id) || 0) -
      (latestActivityByCourse.get(courseA.id) || 0);
    return activityDifference || courseA.title.localeCompare(courseB.title);
  });
}

export function selectContinueLearningPath(courses, lessons, progressList) {
  const lessonsByCourse = new Map();
  for (const lesson of lessons) {
    const courseLessons = lessonsByCourse.get(lesson.courseId) || [];
    courseLessons.push(lesson);
    lessonsByCourse.set(lesson.courseId, courseLessons);
  }
  for (const courseLessons of lessonsByCourse.values()) {
    courseLessons.sort((a, b) => a.index - b.index || a.id.localeCompare(b.id));
  }

  const sortedProgress = [...progressList].sort((a, b) =>
    (b.lastWatched || 0) - (a.lastWatched || 0) || a.id.localeCompare(b.id)
  );
  const recentIncomplete = sortedProgress.find(
    progress => progress.completed !== true && getWatchedSeconds(progress) > 0
  );
  if (recentIncomplete) {
    return {
      courseId: recentIncomplete.courseId,
      lessonId: recentIncomplete.lessonId
    };
  }

  const mostRecent = sortedProgress[0];
  if (mostRecent) {
    const firstIncomplete = (lessonsByCourse.get(mostRecent.courseId) || []).find(lesson => {
      const progress = progressList.find(item => item.id === `${mostRecent.courseId}_${lesson.id}`);
      return progress?.completed !== true;
    });
    if (firstIncomplete) {
      return { courseId: mostRecent.courseId, lessonId: firstIncomplete.id };
    }
  }

  const firstCourse = [...courses].sort((a, b) => a.title.localeCompare(b.title))[0];
  const firstLesson = firstCourse ? lessonsByCourse.get(firstCourse.id)?.[0] : null;
  return firstCourse && firstLesson
    ? { courseId: firstCourse.id, lessonId: firstLesson.id }
    : null;
}

export function selectDashboardStats(progressList, totalNotes) {
  const totalSeconds = progressList.reduce(
    (total, progress) => total + getWatchedSeconds(progress),
    0
  );
  return {
    totalHours: (totalSeconds / 3600).toFixed(1),
    completedLessons: progressList.filter(progress => progress.completed === true).length,
    totalNotes
  };
}

export function selectCourseDetailModel(courseId, courseLessons, courseProgressList) {
  const orderedLessons = [...courseLessons].sort(
    (a, b) => a.index - b.index || a.id.localeCompare(b.id)
  );
  const progressByLessonId = new Map(
    courseProgressList.map(progress => [progress.lessonId, progress])
  );
  const completedCount = orderedLessons.filter(
    lesson => progressByLessonId.get(lesson.id)?.completed === true
  ).length;
  const courseProgress = orderedLessons.length === 0
    ? 0
    : Math.round((completedCount / orderedLessons.length) * 100);

  const lastProgress = [...courseProgressList]
    .filter(progress => getWatchedSeconds(progress) > 0 && progress.completed !== true)
    .sort((a, b) =>
      (b.lastWatched || 0) - (a.lastWatched || 0) || a.id.localeCompare(b.id)
    )[0];
  const lastWatched = lastProgress
    ? { lessonId: lastProgress.lessonId, watchTime: getWatchedSeconds(lastProgress) }
    : null;

  const resumeLesson = (
    (lastWatched && orderedLessons.find(lesson => lesson.id === lastWatched.lessonId)) ||
    orderedLessons.find(lesson => progressByLessonId.get(lesson.id)?.completed !== true) ||
    orderedLessons[0] ||
    null
  );

  return { courseProgress, lastWatched, resumeLesson, progressByLessonId, courseId };
}
