const { pathToFileURL } = require('node:url');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { validateCareerData } = require('./validation/career');
const load = (file) => import(pathToFileURL(path.resolve(__dirname, '../../', file)).href);
const keys = {
  profile: 'tutorin-profile', activity: 'tutorin-activity-v2', favorites: 'tutorin-favorites',
  enrollments: 'tutorin-course-enrollments-v1', roadmap: 'tutorin-career-roadmap-v1', career: 'tutorin-career-v1',
};
const object = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
function fail(message, status = 400, code) { throw Object.assign(new Error(message), { status, code }); }
async function loadDomain() {
  const [catalog, tutors, seed, zoom, industry, mentors, progress, certificates, skills, assessments, completedDemo, sessionUtils] = await Promise.all([
    load('src/state/courseCatalog.js'), load('src/state/tutors.js'), load('src/state/activitySeed.js'),
    load('src/state/zoomMeeting.js'), load('src/state/industryBooking.js'), load('src/state/careerDemoData.js'),
    load('src/state/mentorProgress.js'), load('src/state/mentorCertificates.js'), load('src/state/careerSkills.js'),
    load('src/pages/mentee/test/testData.js'),
    load('src/state/completedCourseDemo.js'),
    load('src/pages/mentee/sesi/sessionUtils.js'),
  ]);
  const today = () => new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);
  const packages = [
    { id: 'starter', name: 'Starter', credits: 20, bonus: 0, price: 25000 },
    { id: 'routine', name: 'Belajar Rutin', credits: 60, bonus: 0, price: 69000 },
    { id: 'intensive', name: 'Intensif', credits: 120, bonus: 10, price: 129000 },
  ];
  function initialDocuments(name = 'Anna Ratna', email = 'alya.putri@email.com') {
    const [firstName, ...rest] = name.split(' ');
    return {
      [keys.profile]: { firstName, lastName: rest.join(' '), email, phone: '', city: '', birthday: '', username: '', mentorActive: true },
      [keys.activity]: { ...seed.initialActivity(), sessions: zoom.ensureTodayZoomSessions(seed.initialActivity().sessions) },
      [keys.favorites]: [], [keys.enrollments]: { [completedDemo.completedDemoCourseId]: { registered: true, scheduled: true, tutor: 'Maya Santoso' } }, [keys.roadmap]: { target: 'frontend', practiced: [] },
      [keys.career]: { skillAttempts: {}, projects: [], savedJobs: [], portfolio: { bio: '', interests: '', visibility: {
        introduction: true, skills: true, projects: true, certificates: true, learning: true, teaching: false,
      } } },
    };
  }
  function validateDocument(key, value) {
    if (key === keys.profile) return object(value) && ['firstName', 'lastName', 'email', 'phone', 'city', 'birthday', 'username'].every((k) => typeof value[k] === 'string' && value[k].length <= 120) && typeof value.mentorActive === 'boolean';
    if (key === keys.favorites) return Array.isArray(value) && value.length <= 200 && value.every((v) => typeof v === 'string' && v.length <= 120);
    if (key === keys.roadmap) return object(value) && ['frontend', 'design', 'backend', 'data', 'mobile'].includes(value.target) && Array.isArray(value.practiced) && value.practiced.length <= 200 && value.practiced.every((v) => typeof v === 'string' && v.length <= 150);
    if (key === keys.career) return !!validateCareerData({ version: 1, target: 'frontend', state: value });
    if (key === keys.enrollments) return object(value) && Object.entries(value).every(([id, v]) => {
      const course = catalog.courseCatalog.find((c) => c.id === id);
      return course && object(v) && ['registered', 'scheduled'].every((k) => v[k] === undefined || typeof v[k] === 'boolean') &&
        (v.completedLessons === undefined || Array.isArray(v.completedLessons) && v.completedLessons.every((n) => Number.isInteger(n) && n >= 0 && n < course.sessions.length)) &&
        (v.startStep === undefined || Number.isInteger(v.startStep) && v.startStep >= 1 && v.startStep <= course.sessions.length) &&
        ['tutor', 'day', 'shift'].every((k) => v[k] === undefined || typeof v[k] === 'string' && v[k].length < 120);
    });
    if (key.startsWith('tutorin-test-v1:')) {
      const definition = assessments.courses[value?.courseId];
      return key.length < 250 && object(value) && definition && ['pre', 'post'].includes(value.mode) && key.endsWith(`:${value.courseId}:${value.mode}`) &&
        value.version === 1 && object(value.answers) && object(value.cells) && Array.isArray(value.flags) && value.flags.length < 100 &&
        typeof value.submitted === 'boolean' && Number.isFinite(value.deadline) && Number.isInteger(value.current) && value.current >= 0 && value.current < 100 &&
        (value.mode !== 'post' || object(value.puzzle) && Array.isArray(value.puzzle.words));
    }
    return false;
  }
  function book(user, input) {
    const activity = user.documents[keys.activity];
    if (!object(input) || !/^\d{4}-\d{2}-\d{2}$/.test(input.date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.time) || !Number.isFinite(Date.parse(`${input.date}T${input.time}:00+07:00`))) fail('Jadwal tidak valid.');
    if (Date.parse(`${input.date}T${input.time}:00+07:00`) <= Date.now()) fail('Pilih jadwal mendatang.');
    const course = catalog.courseCatalog.find((c) => c.id === input.catalogCourseId || c.title === input.subject);
    const selectedTutor = course?.tutors.find((t) => t.name === input.tutor) || tutors.tutors.find((t) => t.name === input.tutor);
    if (!selectedTutor || (course && !course.tutors.some((t) => t.name === input.tutor))) fail('Tutor tidak tersedia.');
    const credits = selectedTutor.creditsCourse ?? selectedTutor.credits;
    const duration = course ? 120 : 60;
    if (activity.transactions.reduce((sum, tx) => sum + tx.amount, 0) < credits) fail('Kredit belum cukup. Isi kredit terlebih dahulu.', 409, 'INSUFFICIENT_CREDITS');
    const start = Date.parse(`${input.date}T${input.time}:00+07:00`);
    if (activity.sessions.some((s) => !['Dibatalkan', 'Selesai'].includes(s.status) && s.kind !== 'zoom-demo' && start < Date.parse(`${s.date}T${s.time}:00+07:00`) + s.duration * 60000 && Date.parse(`${s.date}T${s.time}:00+07:00`) < start + duration * 60000)) fail('Jadwal bertabrakan dengan sesi lain.', 409);
    if (course && input.startStep !== undefined && (!Number.isInteger(input.startStep) || input.startStep < 1 || input.startStep > course.sessions.length)) fail('Nomor materi tidak valid.');
    const session = { id: randomUUID(), role: 'mentee', tutor: selectedTutor.name, subject: course?.title || selectedTutor.subjects,
      date: input.date, time: input.time, duration, credits, status: 'Menunggu konfirmasi', note: String(input.note || '').slice(0, 1200),
      ...(course ? { catalogCourseId: course.id, courseId: course.courseId, startStep: input.startStep || 1 } : {}) };
    activity.sessions.push(session);
    activity.transactions.unshift({ id: `booking-charge-${session.id}`, title: `Booking - ${session.subject}`, detail: session.tutor, amount: -credits, date: today() });
    if (course) user.documents[keys.enrollments][course.id] = { ...user.documents[keys.enrollments][course.id], registered: true, scheduled: true, tutor: session.tutor, startStep: session.startStep };
    return session;
  }
  return { keys, packages, initialDocuments, validateDocument, book, today, fail,
    courses: catalog.courseCatalog, tutors: tutors.tutors, zoom, industry, mentors, progress, certificates, skills, assessments, completedDemo, sessionUtils };
}
module.exports = { loadDomain, keys, fail, object };
