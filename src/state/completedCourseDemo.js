import { courseCatalog } from './courseCatalog.js';

export const completedDemoCourseId = 'data-course';
export function withCompletedDemoCourse(activity, now = Date.now()) {
  if (activity.completedDemoCourseVersion) return activity;
  const course = courseCatalog.find((item) => item.id === completedDemoCourseId);
  const completedAt = new Date(now - 86400000 + 7 * 3600000).toISOString().slice(0, 10);
  const sessions = activity.sessions.map((session) => session.id === 'session-4'
    ? { ...session, role: 'mentee', date: completedAt, catalogCourseId: course.id, courseId: 'speaking', startStep: course.sessions.length } : session);
  for (let index = 0; index < course.sessions.length; index++) {
    if (sessions.some((session) => session.role === 'mentee' && session.catalogCourseId === course.id && session.startStep === index + 1 && session.status === 'Selesai')) continue;
    sessions.push({ id: `demo-completed-speaking-${index + 1}`, role: 'mentee', subject: course.title,
      tutor: 'Maya Santoso', catalogCourseId: course.id, courseId: 'speaking', startStep: index + 1,
      date: new Date(now - (course.sessions.length - index) * 86400000 + 7 * 3600000).toISOString().slice(0, 10),
      time: '08:00', duration: 120, credits: 0, status: 'Selesai',
      note: 'Riwayat materi dari course contoh yang sudah selesai. Biaya course tercatat satu kali di riwayat kredit.' });
  }
  return { ...activity, sessions, completedDemoCourseVersion: 1, courseCompletions: {
    ...activity.courseCompletions,
    [course.id]: { courseId: course.id, completedAt, tutor: 'Maya Santoso', score: 92, isDemo: true,
      summary: 'Selamat, kamu sudah menyelesaikan seluruh materi Public Speaking for Work dan presentasi akhir dengan baik!',
      strengths: ['Struktur presentasi jelas dan mudah diikuti.', 'Contoh dan storytelling relevan dengan audiens.', 'Lebih percaya diri saat menyampaikan ide dan menjawab pertanyaan.'],
      improvement: 'Latih jeda antar poin dan variasi intonasi agar pesan utama lebih kuat.',
      nextStep: 'Rekam presentasi 5 menit, evaluasi tempo bicara, lalu praktikkan di diskusi atau presentasi berikutnya.' },
  } };
}
