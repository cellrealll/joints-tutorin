function certificateId(subject, firstSessionId) {
  const value = `${subject}:${firstSessionId}`;
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `TIN-M-${(hash >>> 0).toString(36).toUpperCase().padStart(7, "0")}`;
}

function localDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function mentorCertificates(sessions, today = localDateKey(new Date())) {
  const groups = new Map();
  for (const session of sessions) {
    if (session.role !== "mentor" || session.status !== "Selesai" || session.date > today || !session.subject?.trim()) continue;
    const subject = session.subject.trim();
    const group = groups.get(subject) || [];
    group.push(session);
    groups.set(subject, group);
  }

  return [...groups].map(([subject, evidence]) => {
    const sorted = [...evidence].sort((a, b) => `${a.date} ${a.time || ""}`.localeCompare(`${b.date} ${b.time || ""}`));
    const minutes = sorted.reduce((total, session) => total + (Number(session.duration) || 0), 0);
    return {
      id: certificateId(subject, sorted[0].id),
      subject,
      sessions: sorted.length,
      minutes,
      issuedAt: sorted.at(-1).date,
      evidence: sorted,
    };
  }).sort((a, b) => b.issuedAt.localeCompare(a.issuedAt) || a.subject.localeCompare(b.subject));
}

export function formatTeachingTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours} jam ${remainder} menit` : `${hours} jam`;
}
