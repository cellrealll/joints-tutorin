import { useSyncExternalStore } from "react";
import { getMentorProgress } from "./mentorProgress";
import { demoOpeningCredits, migrateDemoCredits } from "./creditLedger";
import { prepareIndustryBooking, cancelIndustryBooking } from "./industryBooking";

const storageKey = "tutorin-activity-v2";
const listeners = new Set();
export function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function relativeDate(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return dateKey(date);
}
const seedTransactions = [
  { id: "tx-9", title: "Course - UI/UX Product Design", detail: "Dengan Alya Rahmani", amount: -72, date: relativeDate(-1) },
  { id: "tx-8", title: "Mengajar - Public Speaking for Work", detail: "Course bersama Nadia", amount: 58, date: relativeDate(-2) },
  { id: "tx-7", title: "Course - Frontend Web Development", detail: "Dengan Rafi Ahmad", amount: -82, date: relativeDate(-3) },
  { id: "tx-6", title: "Course - Backend API Engineering", detail: "Dengan Bima Ardi", amount: -96, date: relativeDate(-4) },
  { id: "tx-5", title: "Mengajar - UI/UX Product Design", detail: "Dua jadwal bersama Raka", amount: 64, date: relativeDate(-5) },
  { id: "tx-4", title: "Course - Public Speaking for Work", detail: "Dengan Maya Santoso", amount: -58, date: relativeDate(-6) },
  { id: "tx-3", title: "Bonus belajar", detail: "Target belajar tercapai", amount: 10, date: relativeDate(-8) },
  { id: "tx-2", title: "Sesi belajar - Sejarah", detail: "Dengan Citra Mandira", amount: -10, date: relativeDate(-9) },
  { id: "tx-1", title: "Saldo awal", detail: "Kredit belajar Tutor.in", amount: demoOpeningCredits, date: relativeDate(-14) },
];
const seedSessions = [
  { id: "session-1", subject: "Frontend Web Development", tutor: "Rafi Ahmad", date: relativeDate(0), time: "10:00", duration: 120, credits: 82, status: "Dikonfirmasi", courseId: "programming" },
  { id: "session-2", subject: "UI/UX Product Design", tutor: "Alya Rahmani", date: relativeDate(1), time: "13:00", duration: 120, credits: 72, status: "Dikonfirmasi", courseId: "programming" },
  { id: "session-3", subject: "Backend API Engineering", tutor: "Bima Ardi", date: relativeDate(1), time: "15:00", duration: 120, credits: 96, status: "Dikonfirmasi", courseId: "programming" },
  { id: "session-4", subject: "Public Speaking for Work", tutor: "Maya Santoso", date: relativeDate(-1), time: "08:00", duration: 120, credits: 58, status: "Selesai", courseId: "programming" },
  { id: "session-5", subject: "Frontend Web Development", tutor: "Rafi Ahmad", date: relativeDate(-3), time: "10:00", duration: 120, credits: 82, status: "Selesai", courseId: "programming" },
  { id: "session-6", subject: "UI/UX Product Design", tutor: "Alya Rahmani", date: relativeDate(-4), time: "13:00", duration: 120, credits: 72, status: "Selesai", courseId: "programming" },
];

const teachingSessions = [
  { id: "teaching-1", role: "mentor", subject: "Public Speaking for Work", learner: "Nadia Putri", date: relativeDate(0), time: "15:00", duration: 120, credits: 58, status: "Dikonfirmasi", courseId: "programming" },
  { id: "teaching-2", role: "mentor", subject: "UI/UX Product Design", learner: "Raka Aditya", date: relativeDate(1), time: "13:00", duration: 120, credits: 64, status: "Dikonfirmasi", courseId: "programming" },
  { id: "teaching-3", role: "mentor", subject: "Public Speaking for Work", learner: "Nadia Putri", date: relativeDate(-2), time: "15:00", duration: 120, credits: 58, status: "Selesai", courseId: "programming" },
  { id: "teaching-4", role: "mentor", subject: "UI/UX Product Design", learner: "Raka Aditya", date: relativeDate(-5), time: "13:00", duration: 120, credits: 64, status: "Selesai", courseId: "programming" },
];

function migrateSessionRoles(state) {
  const sessions = state.sessions.map((session) => ({ ...session, role: session.role === "mentor" ? "mentor" : "mentee" }));
  if (!state.sessionRolesVersion) {
    teachingSessions.forEach((session) => {
      if (!sessions.some((existing) => existing.id === session.id)) sessions.push(session);
    });
  }
  return migrateDemoCredits({ ...state, sessions, sessionRolesVersion: 1 });
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && Array.isArray(saved.transactions) && Array.isArray(saved.sessions) &&
      saved.transactions.every((item) => item && typeof item.id === "string" && Number.isFinite(item.amount) && typeof item.date === "string") &&
      saved.sessions.every((item) => item && typeof item.id === "string" && typeof item.date === "string" && typeof item.status === "string")) return migrateSessionRoles(saved);
  } catch { /* Fall back to demo data when stored data cannot be read. */ }
  let bookings = [];
  try {
    const saved = JSON.parse(localStorage.getItem("tutorin-booking-requests"));
    if (Array.isArray(saved)) bookings = saved.filter((item) => item?.date && item?.time && item?.tutor && item?.subject)
      .map((item, index) => ({ ...item, id: `imported-${index}`, duration: 60, status: "Menunggu konfirmasi" }));
  } catch { /* Older bookings are optional. */ }
  return migrateSessionRoles({ transactions: seedTransactions, sessions: [...seedSessions, ...bookings] });
}
let snapshot = load();
function subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); }
function getSnapshot() { return snapshot; }
function commit(next) {
  localStorage.setItem(storageKey, JSON.stringify(next));
  snapshot = next;
  listeners.forEach((listener) => listener());
}
window.addEventListener("storage", (event) => {
  if (event.key === storageKey) { snapshot = load(); listeners.forEach((listener) => listener()); }
});
export function useTutorData() {
  const state = useSyncExternalStore(subscribe, getSnapshot);
  return { ...state, balance: state.transactions.reduce((sum, item) => sum + item.amount, 0) };
}
export function addBooking(booking) {
  commit({ ...snapshot, sessions: [...snapshot.sessions, { ...booking, role: "mentee", id: crypto.randomUUID(), duration: 60, status: "Menunggu konfirmasi" }] });
}
export function cancelSession(id) {
  if (snapshot.sessions.find((session) => session.id === id)?.kind === "industry-mentorship") {
    const next = cancelIndustryBooking(snapshot, id);
    if (next !== snapshot) commit(next);
    return;
  }
  commit({ ...snapshot, sessions: snapshot.sessions.map((session) => session.id === id && session.status === "Menunggu konfirmasi"
    ? { ...session, status: "Dibatalkan" } : session) });
}
export function bookIndustryMentorship(input) {
  const id = crypto.randomUUID();
  commit(prepareIndustryBooking(snapshot, input, id));
  return snapshot.sessions.find((session) => session.id === id);
}
export function completeDemoPurchase(order) {
  if (snapshot.transactions.some((item) => item.id === order.id)) return;
  commit({ ...snapshot, transactions: [{ id: order.id, title: `Pembelian kredit - ${order.name}`, detail: `Simulasi ${order.method}`,
    amount: order.credits + order.bonus, date: dateKey(new Date()) }, ...snapshot.transactions] });
}
export function formatDate(value, options = {}) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", ...options }).format(new Date(`${value}T00:00:00`));
}
export function claimMentorMission(id) {
  const mission = getMentorProgress(snapshot).missions.find((item) => item.id === id);
  if (!mission || mission.claimed || mission.value < mission.target) return false;
  commit({ ...snapshot, transactions: [{ id: mission.claimId, title: `Hadiah misi mentor - ${mission.title}`,
    detail: "Misi mingguan selesai", amount: mission.reward, date: dateKey(new Date()) }, ...snapshot.transactions] });
  return true;
}
