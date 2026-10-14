export function endTime(session) {
  const [hours, minutes] = session.time.split(":").map(Number);
  const end = hours * 60 + minutes + session.duration;
  return `${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`;
}

export function isUpcomingSession(session) {
  const end = new Date(`${session.date}T${session.time}:00`).getTime() + session.duration * 60000;
  return session.status !== "Selesai" && session.status !== "Dibatalkan" && end > Date.now();
}

export function sessionCategory(session) {
  if (session.status === "Dibatalkan") return "cancelled";
  return `${isUpcomingSession(session) ? "upcoming" : "history"}-${session.role === "mentor" ? "mentor" : "mentee"}`;
}

export function sessionStatus(session) {
  if (session.status !== "Selesai" && session.status !== "Dibatalkan" && !isUpcomingSession(session)) return "Terlewat";
  return session.status;
}

export const categoryLabels = {
  "upcoming-mentee": "Belajar mendatang",
  "upcoming-mentor": "Mengajar mendatang",
  "history-mentee": "Riwayat belajar",
  "history-mentor": "Riwayat mengajar",
  cancelled: "Dibatalkan",
};
