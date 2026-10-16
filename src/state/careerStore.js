import { documentStorage } from "./backend";
import { useSyncExternalStore } from "react";
import { careerSkills } from "./careerSkills";

const key = "tutorin-career-v1";
const initial = () => ({ skillAttempts: {}, projects: [], savedJobs: [], portfolio: {
  bio: "", interests: "", visibility: { introduction: true, skills: true, projects: true, certificates: true, learning: true, teaching: false },
} });
const listeners = new Set();
function load() {
  try {
    const saved = JSON.parse(documentStorage.getItem(key));
    const base = initial();
    if (!saved || typeof saved !== "object") return base;
    return { ...base,
      skillAttempts: saved.skillAttempts && typeof saved.skillAttempts === "object" ? saved.skillAttempts : {},
      projects: Array.isArray(saved.projects) ? saved.projects.filter((p) => typeof p?.id === "string" && typeof p.title === "string") : [],
      savedJobs: Array.isArray(saved.savedJobs) ? saved.savedJobs.filter((id) => typeof id === "string") : [],
      portfolio: { ...base.portfolio, bio: typeof saved.portfolio?.bio === "string" ? saved.portfolio.bio : "",
        interests: typeof saved.portfolio?.interests === "string" ? saved.portfolio.interests : "",
        visibility: Object.fromEntries(Object.entries(base.portfolio.visibility).map(([section, value]) =>
          [section, typeof saved.portfolio?.visibility?.[section] === "boolean" ? saved.portfolio.visibility[section] : value])) },
    };
  } catch { return initial(); }
}
let snapshot = load();
const subscribe = (listener) => { listeners.add(listener); return () => listeners.delete(listener); };
const getSnapshot = () => snapshot;
function commit(next) {
  documentStorage.setItem(key, JSON.stringify(next));
  snapshot = next;
  listeners.forEach((listener) => listener());
}
export function useCareerState() { return useSyncExternalStore(subscribe, getSnapshot); }
export function restoreCareerState(state) {
  if (!state || !Array.isArray(state.projects) || !state.portfolio?.visibility || !state.skillAttempts || !Array.isArray(state.savedJobs)) throw new Error("Data akun tidak valid.");
  commit(state);
}
export function saveSkillAttempt(skillId, answers) {
  const definition = careerSkills[skillId];
  if (!definition || !definition.questions.every((question, index) => Number.isInteger(answers[index]) && question.options[answers[index]] !== undefined)) throw new Error("Jawab semua pertanyaan terlebih dahulu.");
  commit({ ...snapshot, skillAttempts: { ...snapshot.skillAttempts, [skillId]: { version: 1, answers, submittedAt: new Date().toISOString() } } });
}
export function savePortfolio(updates) { commit({ ...snapshot, portfolio: { ...snapshot.portfolio, ...updates } }); }
export function saveProject(project) {
  if (!project.title.trim() || !project.description.trim()) throw new Error("Lengkapi judul dan deskripsi proyek.");
  const next = { ...project, title: project.title.trim(), description: project.description.trim(), id: project.id || crypto.randomUUID() };
  commit({ ...snapshot, projects: snapshot.projects.some((item) => item.id === next.id)
    ? snapshot.projects.map((item) => item.id === next.id ? next : item) : [...snapshot.projects, next] });
}
export function deleteProject(id) { commit({ ...snapshot, projects: snapshot.projects.filter((project) => project.id !== id) }); }
export function toggleSavedJob(id) { commit({ ...snapshot, savedJobs: snapshot.savedJobs.includes(id) ? snapshot.savedJobs.filter((item) => item !== id) : [...snapshot.savedJobs, id] }); }
window.addEventListener("storage", (event) => {
  if (event.key === key || event.key === null) { snapshot = load(); listeners.forEach((listener) => listener()); }
});
