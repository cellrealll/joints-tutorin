import { demoIndustryMentors, industrySlots } from "./careerDemoData.js";

export function prepareIndustryBooking(state, input, id, now = Date.now()) {
  const mentor = demoIndustryMentors.find((item) => item.id === input.mentorId);
  if (!mentor || !mentor.categories.includes(input.category)) throw new Error("Pilih mentor dan kategori yang tersedia.");
  const slot = industrySlots(mentor, now).find((item) => item.id === input.slotId);
  if (!slot) throw new Error("Jadwal sudah tidak tersedia. Pilih jadwal mendatang.");
  const balance = state.transactions.reduce((sum, item) => sum + item.amount, 0);
  if (balance < mentor.credits) throw new Error("Kredit belum cukup. Isi kredit terlebih dahulu.");
  const start = Date.parse(`${slot.date}T${slot.time}:00+07:00`);
  const conflict = state.sessions.some((session) => {
    if (["Selesai", "Dibatalkan"].includes(session.status)) return false;
    const existing = Date.parse(`${session.date}T${session.time}:00+07:00`);
    return start < existing + session.duration * 60000 && existing < start + 60 * 60000;
  });
  if (conflict) throw new Error("Jadwal bertabrakan dengan sesi yang sudah kamu pilih.");
  const session = { id, kind: "industry-mentorship", role: "mentee", isDemo: true, mentorId: mentor.id, tutor: mentor.name,
    mentorTitle: mentor.title, mentorCompany: mentor.company, subject: `Industry Mentorship / ${input.category}`, category: input.category,
    date: slot.date, time: slot.time, duration: 60, credits: mentor.credits, status: "Menunggu konfirmasi", note: String(input.note || "").slice(0, 1200) };
  return { ...state, sessions: [...state.sessions, session], transactions: [{ id: `industry-charge-${id}`, title: `Mentorship demo - ${input.category}`,
    detail: `${mentor.name} / booking simulasi`, amount: -mentor.credits, date: new Date(now + 7 * 3600000).toISOString().slice(0, 10) }, ...state.transactions] };
}
export function cancelIndustryBooking(state, id, now = Date.now()) {
  const session = state.sessions.find((item) => item.id === id);
  if (session?.kind !== "industry-mentorship" || session.status !== "Menunggu konfirmasi") return state;
  const charge = state.transactions.find((item) => item.id === `industry-charge-${id}`);
  const refundId = `industry-refund-${id}`;
  const refund = charge && charge.amount < 0 && !state.transactions.some((item) => item.id === refundId)
    ? [{ id: refundId, title: "Refund mentorship demo", detail: session.subject, amount: -charge.amount, date: new Date(now + 7 * 3600000).toISOString().slice(0, 10) }] : [];
  return { ...state, sessions: state.sessions.map((item) => item.id === id ? { ...item, status: "Dibatalkan" } : item), transactions: [...refund, ...state.transactions] };
}
