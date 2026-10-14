import { useSyncExternalStore } from "react";
import { careerFor, careerRoadmaps } from "../pages/mentee/career/roadmapData";

const key = "tutorin-career-roadmap-v1";
const listeners = new Set();
const practiceKeys = new Set(careerRoadmaps.flatMap((career) => career.milestones
  .filter((stage) => !stage.lessons.length).map((stage) => `${career.id}:${stage.id}`)));
function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    return { target: careerFor(saved?.target).id, practiced: Array.isArray(saved?.practiced)
      ? [...new Set(saved.practiced.filter((id) => practiceKeys.has(id)))] : [] };
  } catch { return { target: "frontend", practiced: [] }; }
}
let snapshot = load();
const getSnapshot = () => snapshot;
const subscribe = (listener) => { listeners.add(listener); return () => listeners.delete(listener); };
function commit(next) {
  localStorage.setItem(key, JSON.stringify(next));
  snapshot = next;
  listeners.forEach((listener) => listener());
}
export function selectCareer(target) { commit({ ...snapshot, target: careerFor(target).id }); }
export function toggleRoadmapPractice(id) {
  if (!practiceKeys.has(id)) return;
  commit({ ...snapshot, practiced: snapshot.practiced.includes(id)
    ? snapshot.practiced.filter((value) => value !== id) : [...snapshot.practiced, id] });
}
export function useRoadmap() { return useSyncExternalStore(subscribe, getSnapshot); }
window.addEventListener("storage", (event) => {
  if (event.key === key || event.key === null) {
    snapshot = load();
    listeners.forEach((listener) => listener());
  }
});
