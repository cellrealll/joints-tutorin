export const zoomDemoMeetingKey = "tutorin-today-zoom";

export function normalizeZoomInvite(value) {
  try {
    const url = new URL(String(value || "").trim());
    if (url.protocol !== "https:" || url.username || url.password || !/(^|\.)zoom\.us$/i.test(url.hostname) || !/^\/(j\/\d+|my\/[a-z\d._-]+)\/?$/i.test(url.pathname)) return null;
    return url.href;
  } catch { return null; }
}

export function todayZoomSchedule(now = Date.now()) {
  const wib = new Date(now + 7 * 3600000);
  const date = wib.toISOString().slice(0, 10);
  const currentMinute = wib.getUTCHours() * 60 + wib.getUTCMinutes();
  const startMinute = Math.max(0, currentMinute - 1);
  return { date, time: `${String(Math.floor(startMinute / 60)).padStart(2, "0")}:${String(startMinute % 60).padStart(2, "0")}`,
    duration: Math.min(120, 1440 - startMinute) };
}

export function ensureTodayZoomSessions(sessions, now = Date.now()) {
  const schedule = todayZoomSchedule(now);
  const existing = sessions.find((session) => session.meetingKey === zoomDemoMeetingKey);
  const stillOpen = existing?.date === schedule.date &&
    Date.parse(`${existing.date}T${existing.time}:00+07:00`) + existing.duration * 60000 > now;
  const activeSchedule = stillOpen ? { date: existing.date, time: existing.time, duration: existing.duration } : schedule;
  const zoomUrl = stillOpen ? normalizeZoomInvite(existing.zoomUrl) || "" : "";
  const shared = { meetingKey: zoomDemoMeetingKey, kind: "zoom-demo", subject: "Sesi Zoom hari ini", status: "Dikonfirmasi",
    credits: 0, ...activeSchedule, zoomUrl };
  const examples = [
    { id: "zoom-today-mentee", role: "mentee", tutor: "Mentor Tutor.in", ...shared },
    { id: "zoom-today-mentor", role: "mentor", learner: "Mentee Tutor.in", ...shared },
  ];
  return [...examples, ...sessions.filter((session) => session.meetingKey !== zoomDemoMeetingKey && !examples.some((example) => example.id === session.id))];
}
