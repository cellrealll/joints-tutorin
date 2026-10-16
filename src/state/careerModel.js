import { careerSkills, careerRequirements, lessonCompetencies } from "./careerSkills.js";
import { courseLearningProgress } from "./learningProgress.js";

export function assessedLevel(skillId, attempt) {
  const definition = careerSkills[skillId];
  if (!definition || attempt?.version !== 1 || !attempt.submittedAt || !attempt.answers ||
    !definition.questions.every((question, index) => Number.isInteger(attempt.answers[index]) && question.options[attempt.answers[index]] !== undefined)) return 0;
  const correct = definition.questions.filter((question, index) => question.correct === attempt.answers[index]).length;
  return correct === 3 ? 3 : correct === 2 ? 2 : 1;
}
export function buildSkillProfile(attempts, catalog, sessions, enrollments, legacyResults = []) {
  return Object.fromEntries(Object.entries(careerSkills).map(([id, skill]) => {
    const assessed = assessedLevel(id, attempts[id]);
    // The introductory questions in these banks measure logic, not HTML, CSS, or React.
    const legacyLogic = id === "logic" ? legacyResults.filter((result) => ["programming", "frontend", "backend"].includes(result.bank))
      .reduce((best, result) => Math.max(best, result.logicLevel || 0), 0) : 0;
    const course = catalog.find((item) => item.id === skill.courseId);
    const learning = courseLearningProgress(course, sessions, enrollments[course.id]);
    const practiced = skill.lessons.length && skill.lessons.every((index) => learning.completedLessons.includes(index));
    const level = Math.max(assessed, legacyLogic, practiced ? 1 : 0);
    return [id, { ...skill, id, level, assessed: Math.max(assessed, legacyLogic), practiced: !!practiced,
      source: assessed || legacyLogic ? "Assessment" : practiced ? "Catatan belajar" : "Belum dinilai" }];
  }));
}
export function skillAnalysis(careerId, profile) {
  const requirements = careerRequirements[careerId] || careerRequirements.frontend;
  const skills = Object.entries(requirements).map(([id, target]) => ({ ...profile[id], target, gap: Math.max(0, target - profile[id].level) }));
  const earned = skills.reduce((sum, skill) => sum + Math.min(skill.level, skill.target), 0);
  const possible = skills.reduce((sum, skill) => sum + skill.target, 0);
  return { skills, readiness: Math.round(earned / possible * 100), gaps: skills.filter((skill) => skill.gap > 0).sort((a, b) => b.gap - a.gap) };
}
export function hasMastery(id, profile, seen = new Set()) {
  if (seen.has(id) || !profile[id] || profile[id].assessed < 3) return false;
  const next = new Set([...seen, id]);
  return careerSkills[id].prerequisites.every((dependency) => hasMastery(dependency, profile, next));
}
export function recommendedCourseStart(courseId, profile) {
  const modules = lessonCompetencies[courseId] || [];
  let skipped = 0;
  for (const skills of modules) {
    if (!skills.length || !skills.every((id) => hasMastery(id, profile))) break;
    skipped++;
  }
  return Math.min(skipped + 1, modules.length || 1);
}
export function matchOpportunity(job, profile) {
  const matched = job.skills.filter((id) => profile[id]?.level >= (job.levels?.[id] || 2));
  return { matched, missing: job.skills.filter((id) => !matched.includes(id)), percent: job.skills.length ? Math.round(matched.length / job.skills.length * 100) : 0 };
}
export function safeURL(value) {
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) ? url.href : ""; } catch { return ""; }
}
