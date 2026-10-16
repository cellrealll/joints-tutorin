import { demoOpeningCredits } from "./creditLedger.js";
import { withCompletedDemoCourse } from "./completedCourseDemo.js";
export function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function relativeDate(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return dateKey(date);
}
export const seedTransactions = [
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
export const seedSessions = [
  { id: "session-1", subject: "Frontend Web Development", tutor: "Rafi Ahmad", date: relativeDate(0), time: "10:00", duration: 120, credits: 82, status: "Dikonfirmasi", courseId: "programming" },
  { id: "session-2", subject: "UI/UX Product Design", tutor: "Alya Rahmani", date: relativeDate(1), time: "13:00", duration: 120, credits: 72, status: "Dikonfirmasi", courseId: "programming" },
  { id: "session-3", subject: "Backend API Engineering", tutor: "Bima Ardi", date: relativeDate(1), time: "15:00", duration: 120, credits: 96, status: "Dikonfirmasi", courseId: "programming" },
  { id: "session-4", subject: "Public Speaking for Work", tutor: "Maya Santoso", date: relativeDate(-1), time: "08:00", duration: 120, credits: 58, status: "Selesai", courseId: "programming" },
  { id: "session-5", subject: "Frontend Web Development", tutor: "Rafi Ahmad", date: relativeDate(-3), time: "10:00", duration: 120, credits: 82, status: "Selesai", courseId: "programming" },
  { id: "session-6", subject: "UI/UX Product Design", tutor: "Alya Rahmani", date: relativeDate(-4), time: "13:00", duration: 120, credits: 72, status: "Selesai", courseId: "programming" },
];

export const teachingSessions = [
  { id: "teaching-1", role: "mentor", subject: "Public Speaking for Work", learner: "Nadia Putri", date: relativeDate(0), time: "15:00", duration: 120, credits: 58, status: "Dikonfirmasi", courseId: "programming" },
  { id: "teaching-2", role: "mentor", subject: "UI/UX Product Design", learner: "Raka Aditya", date: relativeDate(1), time: "13:00", duration: 120, credits: 64, status: "Dikonfirmasi", courseId: "programming" },
  { id: "teaching-3", role: "mentor", subject: "Public Speaking for Work", learner: "Nadia Putri", date: relativeDate(-2), time: "15:00", duration: 120, credits: 58, status: "Selesai", courseId: "programming" },
  { id: "teaching-4", role: "mentor", subject: "UI/UX Product Design", learner: "Raka Aditya", date: relativeDate(-5), time: "13:00", duration: 120, credits: 64, status: "Selesai", courseId: "programming" },
];

export function initialActivity() { return withCompletedDemoCourse({ transactions: structuredClone(seedTransactions), sessions: structuredClone([...seedSessions, ...teachingSessions]), sessionRolesVersion: 1, creditLedgerVersion: 1 }); }
