import { documentStorage } from "../../../state/backend";
import { gradeTest } from "./testData";

const listeners = new Set();
export const assessmentKey = (sessionId, courseId, mode) => `tutorin-test-v1:${sessionId}:${courseId}:${mode}`;
export function readAssessment(key) {
  try { return documentStorage.getItem(key); } catch { return null; }
}
export function subscribeAssessments(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function saveAssessment(key, attempt) {
  documentStorage.setItem(key, JSON.stringify(attempt));
  listeners.forEach((listener) => listener());
}
window.addEventListener("storage", (event) => {
  if (event.key === null || event.key.startsWith("tutorin-test-v1:")) listeners.forEach((listener) => listener());
});
export function assessmentResult(raw, courseId, mode) {
  try {
    const attempt = JSON.parse(raw);
    if (!attempt?.submitted || attempt.version !== 1 || attempt.courseId !== courseId || attempt.mode !== mode) return null;
    return gradeTest(courseId, mode, attempt);
  } catch { return null; }
}
