import { documentStorage } from "./backend";
import { useSyncExternalStore } from "react";

const key = "tutorin-course-enrollments-v1";
const listeners = new Set();
function load() {
  try {
    const saved = JSON.parse(documentStorage.getItem(key));
    return saved && typeof saved === "object" && !Array.isArray(saved)
      ? Object.fromEntries(Object.entries(saved).filter(([, value]) => value && typeof value === "object" && !Array.isArray(value))) : {};
  } catch { return {}; }
}
let snapshot = load();
const getSnapshot = () => snapshot;
const subscribe = (listener) => { listeners.add(listener); return () => listeners.delete(listener); };
export function saveEnrollments(value) {
  documentStorage.setItem(key, JSON.stringify(value));
  snapshot = value;
  listeners.forEach((listener) => listener());
}
export function updateEnrollment(courseId, updates) {
  saveEnrollments({ ...snapshot, [courseId]: { ...snapshot[courseId], ...updates } });
}
export function useEnrollments() { return useSyncExternalStore(subscribe, getSnapshot); }
window.addEventListener("storage", (event) => {
  if (event.key === key || event.key === null) {
    snapshot = load();
    listeners.forEach((listener) => listener());
  }
});
