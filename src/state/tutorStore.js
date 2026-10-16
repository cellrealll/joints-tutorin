import { backendAction, documentStorage } from "./backend";
import { useSyncExternalStore } from "react";
import { migrateDemoCredits } from "./creditLedger";
import { ensureTodayZoomSessions } from "./zoomMeeting";

const storageKey = "tutorin-activity-v2";
const listeners = new Set();
export { dateKey } from "./activitySeed.js";
import { seedTransactions, seedSessions, teachingSessions } from "./activitySeed.js";

function migrateSessionRoles(state) {
  const sessions = state.sessions.map((session) => ({ ...session, role: session.role === "mentor" ? "mentor" : "mentee" }));
  if (!state.sessionRolesVersion) {
    teachingSessions.forEach((session) => {
      if (!sessions.some((existing) => existing.id === session.id)) sessions.push(session);
    });
  }
  return migrateDemoCredits({ ...state, sessions: ensureTodayZoomSessions(sessions), sessionRolesVersion: 1 });
}

function load() {
  try {
    const saved = JSON.parse(documentStorage.getItem(storageKey));
    if (saved && Array.isArray(saved.transactions) && Array.isArray(saved.sessions) &&
      saved.transactions.every((item) => item && typeof item.id === "string" && Number.isFinite(item.amount) && typeof item.date === "string") &&
      saved.sessions.every((item) => item && typeof item.id === "string" && typeof item.date === "string" && typeof item.status === "string")) return migrateSessionRoles(saved);
  } catch { /* Fall back to demo data when stored data cannot be read. */ }
  let bookings = [];
  try {
    const saved = JSON.parse(documentStorage.getItem("tutorin-booking-requests"));
    if (Array.isArray(saved)) bookings = saved.filter((item) => item?.date && item?.time && item?.tutor && item?.subject)
      .map((item, index) => ({ ...item, id: `imported-${index}`, duration: 60, status: "Menunggu konfirmasi" }));
  } catch { /* Older bookings are optional. */ }
  return migrateSessionRoles({ transactions: seedTransactions, sessions: [...seedSessions, ...bookings] });
}
let snapshot = load();
function subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); }
function getSnapshot() { return snapshot; }
window.addEventListener("storage", (event) => {
  if (event.key === storageKey) { snapshot = load(); listeners.forEach((listener) => listener()); }
});
export function useTutorData() {
  const state = useSyncExternalStore(subscribe, getSnapshot);
  return { ...state, balance: state.transactions.reduce((sum, item) => sum + item.amount, 0) };
}
export function getTutorBalance() { return snapshot.transactions.reduce((sum, item) => sum + item.amount, 0); }
export function addBooking(booking) { return backendAction("/sessions", booking); }
export function cancelSession(id) { return backendAction(`/sessions/${encodeURIComponent(id)}/cancel`); }
export function saveSessionZoomLink(id, zoomUrl) { return backendAction(`/sessions/${encodeURIComponent(id)}/zoom`, { zoomUrl }, "PUT"); }
export function startSession(id) { return backendAction(`/sessions/${encodeURIComponent(id)}/start`); }
export function bookIndustryMentorship(input) { return backendAction("/sessions/industry", input); }
export function completeDemoPurchase(order) {
  return backendAction("/shop/demo-purchases", { id: order.id, packageId: order.packageId, method: order.method });
}
export function formatDate(value, options = {}) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", ...options }).format(new Date(`${value}T00:00:00`));
}
export function claimMentorMission(id) { return backendAction(`/mentor/missions/${encodeURIComponent(id)}/claim`); }
