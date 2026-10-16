const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { createApp } = require('../src/app');
const { openStorage } = require('../src/storage');
const { keys } = require('../src/domain');

test('HTTP integration: all page data, authentication, wallet, isolation and persistence', async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'tutorin-api-test-'));
  const filename = path.join(directory, 'database.json');
  let server;
  t.after(async () => { if (server) await new Promise((resolve) => server.close(resolve)); await fs.rm(directory, { recursive: true, force: true }); });
  async function boot() {
    const app = await createApp(await openStorage(filename), { quiet: true });
    server = app.listen(0, '127.0.0.1');
    await new Promise((resolve) => server.once('listening', resolve));
    return `http://127.0.0.1:${server.address().port}/api`;
  }
  let base = await boot();
  async function api(url, { token, method = 'GET', body, status = 200 } = {}) {
    const response = await fetch(base + url, { method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    const data = await response.json();
    assert.equal(response.status, status, `${method} ${url}: ${JSON.stringify(data)}`);
    return data;
  }
  const guest = await api('/auth/guest', { method: 'POST', status: 201 });
  const token = guest.token;
  const docs = (await api('/workspace', { token })).documents;
  await t.test('every page resource responds with JSON and private resources require authentication', async () => {
    for (const url of ['/health', '/courses', '/courses/frontend-course', '/tutors', '/shop/packages', '/industry-mentors', '/opportunities']) await api(url);
    for (const url of ['/profile', '/favorites', '/enrollments', '/sessions', '/credits', '/mentor/progress', '/mentor/certificates', '/roadmap', '/career/skills', '/career/portfolio', '/assessments', '/career/profile']) await api(url, { token });
    await api('/workspace', { status: 401 });
    await api('/courses/missing', { status: 404 });
    await api('/workspace', { token: 'invalid', status: 401 });
  });
  await t.test('profile, favorites, enrollments, roadmap, skills, portfolio and assessment persist', async () => {
    const profile = { ...docs[keys.profile], firstName: 'Integration', city: 'Jakarta' };
    const career = structuredClone(docs[keys.career]);
    career.portfolio.bio = 'Portfolio integration';
    career.savedJobs = ['demo-frontend'];
    career.skillAttempts['html'] = { version: 1, answers: { 0: 0, 1: 1, 2: 2 }, submittedAt: new Date().toISOString() };
    career.projects.push({ id: 'project-test', title: 'API project', description: 'Connected app', technologies: 'React', visible: true, skills: [], github: '', demo: '', image: '' });
    const attempt = { version: 1, courseId: 'programming', mode: 'pre', answers: {}, cells: {}, flags: [], current: 0, submitted: true, questionCount: 10, deadline: Date.now() + 60000, puzzle: null };
    const values = { [keys.profile]: profile, [keys.favorites]: ['Angela Wilkins'], [keys.enrollments]: { 'frontend-course': { registered: true, completedLessons: [0, 1] } },
      [keys.roadmap]: { target: 'backend', practiced: [] }, [keys.career]: career, 'tutorin-test-v1:test:programming:pre': attempt };
    for (const [key, body] of Object.entries(values)) await api(`/documents/${encodeURIComponent(key)}`, { token, method: 'PUT', body });
    const saved = (await api('/workspace', { token })).documents;
    for (const [key, value] of Object.entries(values)) assert.deepEqual(saved[key], value);
    assert.ok((await api('/assessments', { token }))['tutorin-test-v1:test:programming:pre'].result);
    await api(`/documents/${keys.activity}`, { token, method: 'PUT', body: docs[keys.activity], status: 400 });
    await api(`/documents/${keys.profile}`, { token, method: 'PUT', body: {}, status: 400 });
    await api('/career/profile', { token, method: 'PUT', body: { version: 1, target: 'backend', state: career } });
  });
  await t.test('server prices topups; concurrent retries do not credit twice', async () => {
    const before = await api('/credits', { token });
    await Promise.all(Array.from({ length: 8 }, () => api('/shop/demo-purchases', { token, method: 'POST', body: { id: 'purchase-retry-001', packageId: 'intensive', method: 'QRIS', credits: 999999 } })));
    const after = await api('/credits', { token });
    assert.equal(after.balance - before.balance, 130);
    assert.equal(after.transactions.filter((tx) => tx.id === 'purchase-retry-001').length, 1);
    await api('/shop/demo-purchases', { token, method: 'POST', body: { id: 'bad', packageId: 'unknown' }, status: 400 });
  });
  await t.test('booking charges canonical amount, rejects conflicts and refunds once', async () => {
    const date = new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10);
    const before = (await api('/credits', { token })).balance;
    const body = { tutor: 'Rafi Ahmad', subject: 'Frontend Web Development', catalogCourseId: 'frontend-course', date, time: '10:00', credits: 1, startStep: 1 };
    const session = (await api('/sessions', { token, method: 'POST', body })).value;
    assert.equal(session.credits, 82); assert.equal(session.duration, 120);
    assert.equal((await api('/credits', { token })).balance, before - 82);
    await api('/sessions', { token, method: 'POST', body, status: 409 });
    await api(`/sessions/${session.id}/cancel`, { token, method: 'POST' });
    await api(`/sessions/${session.id}/cancel`, { token, method: 'POST' });
    assert.equal((await api('/credits', { token })).balance, before);
    await api('/sessions', { token, method: 'POST', body: { ...body, date: '2020-01-01' }, status: 400 });
  });
  await t.test('industry booking, Zoom links, and mentor rewards have server checks', async () => {
    const mentors = await api('/industry-mentors');
    const mentor = mentors[0];
    await api('/sessions/industry', { token, method: 'POST', body: { mentorId: 'missing' }, status: 400 });
    const slot = mentor.slots.find((s) => !docs[keys.activity].sessions.some((session) => session.date === s.date));
    assert.ok(slot);
    const before = (await api('/credits', { token })).balance;
    const booked = (await api('/sessions/industry', { token, method: 'POST', body: { mentorId: mentor.id, category: mentor.categories[0], slotId: slot.id } })).value;
    assert.equal((await api('/credits', { token })).balance, before - mentor.credits);
    await api(`/sessions/${booked.id}/cancel`, { token, method: 'POST' });
    assert.equal((await api('/credits', { token })).balance, before);
    await api('/sessions/zoom-today-mentor/zoom', { token, method: 'PUT', body: { zoomUrl: 'https://evil.example' }, status: 400 });
    await api('/sessions/zoom-today-mentee/zoom', { token, method: 'PUT', body: { zoomUrl: 'https://zoom.us/j/123456789' }, status: 403 });
    await api('/sessions/zoom-today-mentee/start', { token, method: 'POST', status: 403 });
    await api('/sessions/zoom-today-mentor/start', { token, method: 'POST', status: 409 });
    await api('/sessions/zoom-today-mentor/zoom', { token, method: 'PUT', body: { zoomUrl: 'https://zoom.us/j/123456789' } });
    const sessions = await api('/sessions', { token });
    assert.equal(sessions.find((s) => s.id === 'zoom-today-mentee').zoomUrl, 'https://zoom.us/j/123456789');
    assert.equal(sessions.find((s) => s.id === 'zoom-today-mentee').startedAt, null);
    const started = (await api('/sessions/zoom-today-mentor/start', { token, method: 'POST' })).value.startedAt;
    assert.ok(Number.isFinite(Date.parse(started)));
    assert.equal((await api('/sessions/zoom-today-mentor/start', { token, method: 'POST' })).value.startedAt, started);
    const refreshed = (await api('/workspace', { token })).documents[keys.activity].sessions;
    assert.equal(refreshed.find((s) => s.id === 'zoom-today-mentee').startedAt, started);
    await api('/mentor/missions/reviews/claim', { token, method: 'POST', status: 409 });
  });
  let account;
  await t.test('registration, login, and separate user data', async () => {
    account = await api('/auth/register', { method: 'POST', body: { name: 'Test User', email: 'integration@example.com', password: 'integration123' }, status: 201 });
    assert.equal(account.user.email, 'integration@example.com');
    const second = await api('/workspace', { token: account.token });
    assert.notEqual(second.documents[keys.profile].firstName, 'Integration');
    assert.deepEqual(second.documents[keys.favorites], []);
    await api('/auth/login', { method: 'POST', body: { email: 'integration@example.com', password: 'wrong' }, status: 401 });
    assert.equal((await api('/auth/login', { method: 'POST', body: { email: 'INTEGRATION@example.com', password: 'integration123' } })).user.id, account.user.id);
    await api('/auth/register', { method: 'POST', body: { name: 'Other', email: 'integration@example.com', password: 'integration123' }, status: 409 });
    const user = (await openStorage(filename)).read().users[account.user.id];
    assert.notEqual(user.passwordHash, 'integration123');
    assert.equal(account.user.passwordHash, undefined);
  });
  await t.test('malformed JSON returns 400 without taking down the server', async () => {
    const response = await fetch(base + '/sessions', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: '{bad' });
    assert.equal(response.status, 400); await api('/health');
  });
  await t.test('restart retains user data and authentication', async () => {
    await new Promise((resolve) => server.close(resolve)); server = null; base = await boot();
    assert.equal((await api('/profile', { token })).firstName, 'Integration');
    assert.equal((await api('/auth/me', { token: account.token })).id, account.user.id);
  });
});
