export function endTime(session) {
  const [hours, minutes] = session.time.split(":").map(Number);
  const end = hours * 60 + minutes + session.duration;
  return `${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`;
}

export function sessionStart(session) {
  return new Date(`${session.date}T${session.time}:00+07:00`).getTime();
}

export function isUpcomingSession(session) {
  const end = sessionStart(session) + session.duration * 60000;
  return session.status !== "Selesai" && session.status !== "Dibatalkan" && end > Date.now();
}

export function compareSessionSchedule(a, b) {
  return sessionStart(a) - sessionStart(b) || a.id.localeCompare(b.id);
}

export function canJoinSession(session, now = Date.now()) {
  const start = sessionStart(session);
  return session.status === "Dikonfirmasi" && now >= start - 10 * 60000 && now < start + session.duration * 60000;
}

export function sessionCategory(session) {
  if (session.status === "Dibatalkan") return "cancelled";
  return `${isUpcomingSession(session) ? "upcoming" : "history"}-${session.role === "mentor" ? "mentor" : "mentee"}`;
}

export function sessionStatus(session, now = Date.now()) {
  const start = sessionStart(session);
  if (session.status === "Dikonfirmasi" && now >= start && now < start + session.duration * 60000) return session.role === "mentee" && !session.startedAt ? "Menunggu mentor" : "Sedang sesi";
  if (session.status !== "Selesai" && session.status !== "Dibatalkan" && now >= start + session.duration * 60000) return "Terlewat";
  return session.status;
}

export const categoryLabels = {
  "upcoming-mentee": "Belajar mendatang",
  "upcoming-mentor": "Mengajar mendatang",
  "history-mentee": "Riwayat belajar",
  "history-mentor": "Riwayat mengajar",
  cancelled: "Dibatalkan",
};
