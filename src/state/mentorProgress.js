export const mentorLevels = [
  { name: "Starter Mentor", threshold: 0, icon: "solar:shield-check-bold", description: "Mulai perjalanan sebagai mentor." },
  { name: "Active Mentor", threshold: 200, icon: "fluent:hat-graduation-12-filled", description: "Mengajar secara aktif dan konsisten." },
  { name: "Trusted Mentor", threshold: 500, icon: "solar:star-bold", description: "Dapatkan kepercayaan lebih banyak mentee." },
  { name: "Mentor Inspiratif", threshold: 1000, icon: "solar:users-group-rounded-bold", description: "Bagikan pengalaman dan jadi inspirasi." },
  { name: "Mentor Pro", threshold: 2000, icon: "solar:crown-bold", description: "Jadi mentor unggulan di Tutor.in." },
];
function key(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function getMentorProgress(state, now = new Date()) {
  const start = new Date(now);
  start.setDate(start.getDate() - (start.getDay() + 6) % 7);
  const week = key(start);
  const today = key(now);
  const completed = state.sessions.filter((session) => session.role === "mentor" && session.status === "Selesai" && session.date <= today);
  const weekly = completed.filter((session) => session.date >= week);
  // Historical teaching credits for the demo account are separate from its wallet.
  const credits = 304 + completed.reduce((sum, session) => sum + (Number(session.credits) || 0), 0);
  const currentIndex = mentorLevels.findLastIndex((level) => credits >= level.threshold);
  const next = mentorLevels[currentIndex + 1];
  const reviews = (state.mentorReviews ?? []).filter((review) => review.date >= week && review.date <= today);
  const missions = [
    { id: "sessions", title: "Selesaikan 2 sesi", description: "Temani mentee belajar sampai selesai.", value: weekly.length, target: 2, reward: 3, icon: "solar:clipboard-list-bold", color: "blue" },
    { id: "reviews", title: "Dapatkan 10 ulasan baru", description: "Bantu mentee memahami materi dengan baik.", value: reviews.length, target: 10, reward: 2, icon: "solar:star-bold", color: "orange" },
    { id: "credits", title: "Kumpulkan 20 kredit", description: "Kredit dari sesi mengajar minggu ini.", value: weekly.reduce((sum, session) => sum + (Number(session.credits) || 0), 0), target: 20, reward: 3, icon: "bx:coin-stack", color: "gold" },
  ].map((mission) => ({ ...mission, claimId: `mentor-mission-${week}-${mission.id}`, claimed: state.transactions.some((item) => item.id === `mentor-mission-${week}-${mission.id}`) }));
  return { credits, currentIndex, next, week, missions };
}
