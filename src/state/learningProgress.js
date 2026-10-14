import { milestoneSkills } from "./careerSkills.js";

export function sessionsForCourse(course, sessions) {
  return sessions.filter((session) => session.role !== "mentor" && session.kind !== "industry-mentorship" &&
    (session.catalogCourseId ? session.catalogCourseId === course.id : session.subject === course.title));
}

export function courseLearningProgress(course, sessions, enrollment = {}) {
  const activity = sessionsForCourse(course, sessions);
  const completedSessions = activity.filter((session) => session.status === "Selesai");
  const validLesson = (index) => Number.isInteger(index) && index >= 0 && index < course.sessions.length;
  const sessionLessons = [...new Set(completedSessions
    .map((session) => session.startStep - 1).filter(validLesson))];
  const practicedLessons = [...new Set((Array.isArray(enrollment.completedLessons) ? enrollment.completedLessons : []).filter(validLesson))];
  const completedLessons = [...new Set([...sessionLessons, ...practicedLessons])].sort((a, b) => a - b);
  return {
    activity, completedSessions, sessionLessons, practicedLessons, completedLessons,
    percent: Math.round(completedLessons.length / course.sessions.length * 100),
    // A legacy session without a lesson number is activity, not proof of an entire course.
    unassignedSessions: completedSessions.filter((session) => !validLesson(session.startStep - 1)).length,
  };
}

export function roadmapProgress(career, catalog, sessions, enrollments, practiced = [], masteredSkills = []) {
  const milestones = career.milestones.map((milestone) => {
    const course = catalog.find((item) => item.id === milestone.courseId);
    const learning = courseLearningProgress(course, sessions, enrollments[course.id]);
    const competencies = milestoneSkills[career.id]?.[milestone.id] || [];
    const assessed = competencies.length > 0 && competencies.every((id) => masteredSkills.includes(id));
    const tracked = milestone.lessons.length
      ? milestone.lessons.filter((index) => learning.completedLessons.includes(index)).length
      : practiced.includes(`${career.id}:${milestone.id}`) ? 1 : 0;
    const total = milestone.lessons.length || 1;
    const done = assessed ? total : tracked;
    return { ...milestone, course, learning, done, total, assessed, completed: done === total };
  });
  const nextIndex = milestones.findIndex((milestone) => !milestone.completed);
  const stages = milestones.map((milestone, index) => ({
    ...milestone,
    status: milestone.completed ? "completed" : index === nextIndex ? "ongoing" : "locked",
  }));
  const completed = stages.filter((stage) => stage.completed).length;
  return { stages, completed, percent: Math.round(completed / stages.length * 100), next: stages[nextIndex] || null };
}
