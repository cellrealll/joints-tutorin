const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID, randomBytes } = require('node:crypto');
const { loadDomain, fail, object } = require('./domain');
const { validateCareerData } = require('./validation/career');
const route = (fn) => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);

async function createApp(storage, options = {}) {
  const d = await loadDomain();
  const k = d.keys;
  await storage.transaction((db) => {
    for (const user of Object.values(db.users)) {
      if (!user.documents[k.activity].completedDemoCourseVersion) {
        user.documents[k.activity] = d.completedDemo.withCompletedDemoCourse(user.documents[k.activity]);
        const id = d.completedDemo.completedDemoCourseId;
        user.documents[k.enrollments][id] = { ...user.documents[k.enrollments][id], registered: true, scheduled: true, tutor: 'Maya Santoso' };
      }
      if (user.name === 'Alya Putri') user.name = 'Anna Ratna';
      const profile = user.documents?.[k.profile];
      if (profile?.firstName === 'Alya' && profile.lastName === 'Putri') {
        profile.firstName = 'Anna'; profile.lastName = 'Ratna';
      }
    }
  });
  if (!storage.read().secret) await storage.transaction((db) => { db.secret = randomBytes(48).toString('hex'); });
  const secret = options.secret || process.env.JWT_SECRET || storage.read().secret;
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map((v) => v.trim()) }));
  app.use(express.json({ limit: '8mb' }));
  app.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  app.get('/api/health', (_req, res) => res.json({ status: 'ok', storage: 'file', paymentMode: 'demo' }));
  const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, guest: u.guest });
  const session = (u) => ({ token: jwt.sign({ id: u.id }, secret, { expiresIn: '7d', algorithm: 'HS256' }), user: publicUser(u) });
  const auth = (req, _res, next) => {
    try {
      const match = /^Bearer (\S+)$/.exec(req.get('Authorization') || '');
      if (!match) fail('Masuk ke akun terlebih dahulu.', 401);
      const payload = jwt.verify(match[1], secret, { algorithms: ['HS256'] });
      if (!storage.read().users[payload.id]) fail('Sesi akun tidak ditemukan.', 401);
      req.userId = payload.id; next();
    } catch { next(Object.assign(new Error('Sesi akun berakhir. Masuk kembali.'), { status: 401 })); }
  };
  const attempts = new Map();
  app.use('/api/auth', (req, _res, next) => {
    const now = Date.now();
    for (const [key, entry] of attempts) if (entry.until <= now) attempts.delete(key);
    const entry = attempts.get(req.ip) || { count: 0, until: now + 60000 };
    if (++entry.count > 30) return next(Object.assign(new Error('Terlalu banyak percobaan. Coba lagi sebentar.'), { status: 429 }));
    attempts.set(req.ip, entry); next();
  });
  app.post('/api/auth/guest', route(async (_req, res) => {
    const u = { id: randomUUID(), name: 'Anna Ratna', email: '', guest: true, documents: d.initialDocuments() };
    await storage.transaction((db) => { db.users[u.id] = u; });
    res.status(201).json(session(u));
  }));
  app.post('/api/auth/register', route(async (req, res) => {
    const { name, email, password } = req.body || {};
    if (typeof name !== 'string' || !name.trim() || name.length > 120 || typeof email !== 'string' || email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password) > 72) fail('Isi nama, email valid, dan password minimal 8 karakter (maks. 72 byte).');
    const passwordHash = await bcrypt.hash(password, 12);
    const u = await storage.transaction((db) => {
      const normalized = email.trim().toLowerCase();
      if (Object.values(db.users).some((user) => !user.guest && user.email === normalized)) fail('Email sudah terdaftar.', 409);
      const user = { id: randomUUID(), name: name.trim(), email: normalized, passwordHash, guest: false, documents: d.initialDocuments(name.trim(), normalized) };
      db.users[user.id] = user; return user;
    });
    res.status(201).json(session(u));
  }));
  app.post('/api/auth/login', route(async (req, res) => {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string' || Buffer.byteLength(password) > 72) fail('Email atau password tidak sesuai.', 401);
    const u = Object.values(storage.read().users).find((user) => !user.guest && user.email === email.trim().toLowerCase());
    if (!u || !await bcrypt.compare(password, u.passwordHash)) fail('Email atau password tidak sesuai.', 401);
    res.json(session(u));
  }));
  app.get('/api/auth/me', auth, (req, res) => res.json(publicUser(storage.read().users[req.userId])));
  app.get('/api/courses', (_req, res) => res.json(d.courses));
  app.get('/api/courses/:id', (req, res, next) => {
    const course = d.courses.find((c) => c.id === req.params.id);
    if (!course) return next(Object.assign(new Error('Course tidak ditemukan.'), { status: 404 }));
    res.json(course);
  });
  app.get('/api/tutors', (_req, res) => res.json([...d.tutors, ...d.courses.flatMap((c) => c.tutors)].map((t) => ({ ...t, credits: t.credits ?? t.creditsCourse }))));
  app.get('/api/shop/packages', (_req, res) => res.json({ mode: 'demo', packages: d.packages }));
  app.get('/api/industry-mentors', (_req, res) => res.json(d.mentors.demoIndustryMentors.map(({ photo: _photo, ...m }) => ({ ...m, slots: d.mentors.industrySlots(m) }))));
  app.get('/api/opportunities', (_req, res) => res.json(d.mentors.demoOpportunities || []));
  app.use('/api', auth);
  const documents = (req) => storage.read().users[req.userId].documents;
  app.get('/api/workspace', route(async (req, res) => {
    const docs = await storage.transaction((db) => {
      const docs = db.users[req.userId].documents;
      docs[k.activity].sessions = d.zoom.ensureTodayZoomSessions(docs[k.activity].sessions); return docs;
    });
    res.json({ documents: docs });
  }));
  app.put('/api/documents/:key', route(async (req, res) => {
    if (!d.validateDocument(req.params.key, req.body)) fail('Data tidak valid.');
    await storage.transaction((db) => { db.users[req.userId].documents[req.params.key] = req.body; });
    res.json({ saved: true });
  }));
  for (const [url, key] of [['profile', k.profile], ['favorites', k.favorites], ['enrollments', k.enrollments], ['sessions', k.activity]]) {
    app.get(`/api/${url}`, (req, res) => res.json(url === 'sessions' ? documents(req)[key].sessions : documents(req)[key]));
  }
  app.get('/api/credits', (req, res) => { const transactions = documents(req)[k.activity].transactions; res.json({ balance: transactions.reduce((sum, t) => sum + t.amount, 0), transactions }); });
  app.get('/api/mentor/progress', (req, res) => res.json(d.progress.getMentorProgress(documents(req)[k.activity])));
  app.get('/api/mentor/certificates', (req, res) => res.json(d.certificates.mentorCertificates(documents(req)[k.activity].sessions)));
  app.get('/api/roadmap', (req, res) => res.json(documents(req)[k.roadmap]));
  app.get('/api/career/skills', (req, res) => res.json(documents(req)[k.career].skillAttempts));
  app.get('/api/career/portfolio', (req, res) => res.json(documents(req)[k.career]));
  app.get('/api/assessments', (req, res) => res.json(Object.fromEntries(Object.entries(documents(req)).filter(([key]) => key.startsWith('tutorin-test-v1:')).map(([key, attempt]) => [key, { attempt, result: attempt.submitted ? d.assessments.gradeTest(attempt.courseId, attempt.mode, attempt) : null }]))));
  const mutate = (fn) => route(async (req, res) => {
    const result = await storage.transaction((db) => { const u = db.users[req.userId]; const value = fn(u, req); return { value, documents: u.documents }; });
    res.json(result);
  });
  app.post('/api/sessions', mutate((u, req) => d.book(u, req.body)));
  app.post('/api/sessions/industry', mutate((u, req) => {
    if (!object(req.body)) fail('Booking tidak valid.');
    const id = randomUUID();
    try { u.documents[k.activity] = d.industry.prepareIndustryBooking(u.documents[k.activity], req.body, id); }
    catch (error) { throw Object.assign(error, { status: 400, ...(/kredit.*belum cukup/i.test(error.message) ? { code: 'INSUFFICIENT_CREDITS' } : {}) }); }
    return u.documents[k.activity].sessions.find((s) => s.id === id);
  }));
  app.post('/api/sessions/:id/cancel', mutate((u, req) => {
    const a = u.documents[k.activity], s = a.sessions.find((s) => s.id === req.params.id);
    if (!s) fail('Sesi tidak ditemukan.', 404);
    if (s.status === 'Dibatalkan') return s;
    if (s.status !== 'Menunggu konfirmasi') fail('Sesi ini tidak dapat dibatalkan.', 409);
    if (s.kind === 'industry-mentorship') u.documents[k.activity] = d.industry.cancelIndustryBooking(a, s.id);
    else {
      s.status = 'Dibatalkan';
      const charge = a.transactions.find((tx) => tx.id === `booking-charge-${s.id}`);
      if (charge && !a.transactions.some((tx) => tx.id === `booking-refund-${s.id}`)) a.transactions.unshift({ id: `booking-refund-${s.id}`, title: 'Refund booking', detail: s.subject, amount: -charge.amount, date: d.today() });
    }
    return s;
  }));
  app.put('/api/sessions/:id/zoom', mutate((u, req) => {
    const a = u.documents[k.activity], s = a.sessions.find((s) => s.id === req.params.id);
    if (!s) fail('Sesi tidak ditemukan.', 404);
    if (s.role !== 'mentor' || !u.documents[k.profile].mentorActive) fail('Hanya mentor sesi ini yang dapat mengatur Zoom.', 403);
    if (s.status !== 'Dikonfirmasi') fail('Sesi belum dikonfirmasi.', 409);
    const zoomUrl = d.zoom.normalizeZoomInvite(req.body?.zoomUrl);
    if (!zoomUrl) fail('Link undangan Zoom tidak valid.');
    const startedAt = s.zoomUrl === zoomUrl ? s.startedAt || null : null;
    a.sessions = a.sessions.map((item) => item.id === s.id || s.meetingKey && item.meetingKey === s.meetingKey ? { ...item, zoomUrl, startedAt } : item);
    return { zoomUrl };
  }));
  app.post('/api/sessions/:id/start', mutate((u, req) => {
    const a = u.documents[k.activity], s = a.sessions.find((session) => session.id === req.params.id);
    if (!s) fail('Sesi tidak ditemukan.', 404);
    if (s.role !== 'mentor' || !u.documents[k.profile].mentorActive) fail('Hanya mentor sesi ini yang dapat memulai sesi.', 403);
    if (!d.sessionUtils.canJoinSession(s)) fail('Sesi hanya dapat dimulai sesuai jadwal.', 409);
    if (!d.zoom.normalizeZoomInvite(s.zoomUrl)) fail('Tambahkan link Zoom sebelum memulai sesi.', 409);
    const startedAt = s.startedAt || new Date().toISOString();
    a.sessions = a.sessions.map((item) => item.id === s.id || s.meetingKey && item.meetingKey === s.meetingKey ? { ...item, startedAt } : item);
    return { startedAt };
  }));
  app.post('/api/shop/demo-purchases', mutate((u, req) => {
    const input = req.body, pack = d.packages.find((p) => p.id === input?.packageId);
    if (!pack || typeof input.id !== 'string' || !/^[a-zA-Z0-9-]{8,100}$/.test(input.id) || !['QRIS', 'Virtual Account', 'E-Wallet'].includes(input.method)) fail('Paket atau metode pembayaran tidak valid.');
    const a = u.documents[k.activity], existing = a.transactions.find((tx) => tx.id === input.id);
    if (existing) return existing;
    const tx = { id: input.id, title: `Pembelian kredit - ${pack.name}`, detail: `Simulasi ${input.method}`, amount: pack.credits + pack.bonus, date: d.today() };
    a.transactions.unshift(tx); return tx;
  }));
  app.post('/api/mentor/missions/:id/claim', mutate((u, req) => {
    if (!u.documents[k.profile].mentorActive) fail('Aktifkan peran mentor terlebih dahulu.', 403);
    const a = u.documents[k.activity], m = d.progress.getMentorProgress(a).missions.find((m) => m.id === req.params.id);
    if (!m || m.value < m.target) fail('Misi belum selesai.', 409);
    if (m.claimed) return false;
    a.transactions.unshift({ id: m.claimId, title: `Hadiah misi mentor - ${m.title}`, detail: 'Misi mingguan selesai', amount: m.reward, date: d.today() }); return true;
  }));
  app.get('/api/career/profile', (req, res) => res.json({ data: { version: 1, target: documents(req)[k.roadmap].target, state: documents(req)[k.career] } }));
  app.put('/api/career/profile', mutate((u, req) => {
    const data = validateCareerData(req.body);
    if (!data) fail('Career profile tidak valid.');
    u.documents[k.career] = data.state; u.documents[k.roadmap].target = data.target; return { saved: true };
  }));
  app.use((_req, res) => res.status(404).json({ message: 'Endpoint tidak ditemukan.' }));
  app.use((error, _req, res, _next) => {
    const status = error.status || (error.type === 'entity.too.large' ? 413 : 500);
    if (status >= 500 && !options.quiet) console.error('API error:', error.message);
    res.status(status).json({ message: status >= 500 ? 'Server belum dapat memproses permintaan. Coba kembali.' : error.message, ...(error.code && status < 500 ? { code: error.code } : {}) });
  });
  return app;
}
module.exports = { createApp };
