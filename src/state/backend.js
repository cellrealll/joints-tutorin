const base = (import.meta.env?.VITE_API_URL || '/api').replace(/\/$/, '');
const memory = new Map();
const listeners = new Set();
const pending = new Map();
let auth;
try { auth = JSON.parse(localStorage.getItem('tutorin-auth')); } catch { /* No saved session. */ }
let status = { phase: 'loading', message: 'Menghubungkan ke server…', pending: 0, user: auth?.user || null };
let queue = Promise.resolve();
let connecting;
function notify(patch) { status = { ...status, ...patch }; listeners.forEach((fn) => fn()); }
export const subscribeBackend = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
export const backendSnapshot = () => status;
export async function request(path, { method = 'GET', body, anonymous = false } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(`${base}${path}`, { method, signal: controller.signal, headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(!anonymous && auth?.token ? { Authorization: `Bearer ${auth.token}` } : {}),
    }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw Object.assign(new Error(data.message || `Permintaan gagal (${response.status}).`), { status: response.status, code: data.code });
    return data;
  } catch (error) {
    if (error.status) throw error;
    throw new Error('Server tidak dapat dihubungi. Periksa koneksi lalu coba lagi.', { cause: error });
  } finally { clearTimeout(timer); }
}
function cacheKey(key) { return `tutorin-cache:${auth?.user?.id || 'offline'}:${key}`; }
function announce(key) { window.dispatchEvent(new StorageEvent('storage', { key })); }
function putLocal(key, raw) {
  memory.set(key, raw);
  try { localStorage.setItem(cacheKey(key), raw); } catch { /* In-memory editing remains available. */ }
}
function applyDocuments(documents) {
  for (const key of memory.keys()) {
    if (!(key in documents) && !pending.has(key)) {
      memory.delete(key);
      try { localStorage.removeItem(cacheKey(key)); } catch { /* Cache is optional. */ }
      announce(key);
    }
  }
  for (const [key, value] of Object.entries(documents)) {
    if (pending.has(key)) continue;
    putLocal(key, JSON.stringify(value)); announce(key);
  }
}
function saveAuth(value) {
  auth = value;
  try { localStorage.setItem('tutorin-auth', JSON.stringify(value)); } catch { /* This session lasts until the tab closes. */ }
}
function enqueue(fn) {
  const next = queue.then(fn);
  queue = next.catch(() => {});
  return next;
}
export const documentStorage = {
  getItem(key) {
    if (memory.has(key)) return memory.get(key);
    try { return localStorage.getItem(cacheKey(key)); } catch { return null; }
  },
  setItem(key, raw) {
    if (status.phase === 'loading') throw new Error('Tunggu koneksi server selesai.');
    JSON.parse(raw);
    putLocal(key, raw);
    pending.set(key, raw);
    try { localStorage.setItem(`tutorin-pending:${auth.user.id}:${key}`, raw); } catch { /* The memory queue remains available. */ }
    notify({ pending: pending.size });
    persistPending();
    return raw;
  },
};
export function persistPending() {
  return enqueue(async () => {
    notify({ pending: pending.size });
    for (const [key, raw] of pending) {
      try {
        await request(`/documents/${encodeURIComponent(key)}`, { method: 'PUT', body: JSON.parse(raw) });
        if (pending.get(key) === raw) {
          pending.delete(key);
          try { localStorage.removeItem(`tutorin-pending:${auth.user.id}:${key}`); } catch { /* Optional durable queue. */ }
        }
      } catch (error) {
        if (error.status === 400 || error.status === 413) {
          if (pending.get(key) === raw) {
            pending.delete(key);
            try { localStorage.removeItem(`tutorin-pending:${auth.user.id}:${key}`); } catch { /* Optional durable queue. */ }
          }
          const remote = await request('/workspace').catch(() => null);
          if (remote) applyDocuments(remote.documents);
        } else {
          try { localStorage.setItem(`tutorin-pending:${auth.user.id}:${key}`, raw); } catch { /* Memory queue is retained. */ }
        }
        notify({ phase: 'error', message: error.message, pending: pending.size });
        return;
      }
    }
    notify({ phase: 'ready', message: '', pending: pending.size });
  });
}
export function connectBackend() {
  if (connecting) return connecting;
  connecting = (async () => {
    notify({ phase: 'loading', message: 'Menghubungkan ke server…' });
    if (!auth?.token) saveAuth(await request('/auth/guest', { method: 'POST', anonymous: true }));
    else {
      try { auth.user = await request('/auth/me'); saveAuth(auth); }
      catch (error) {
        if (error.status !== 401) throw error;
        // Expired accounts require login; do not silently replace them with a guest.
        if (!auth.user?.guest) throw error;
        saveAuth(await request('/auth/guest', { method: 'POST', anonymous: true }));
      }
    }
    try {
      for (let index = 0; index < localStorage.length; index++) {
        const key = localStorage.key(index), prefix = `tutorin-pending:${auth.user.id}:`;
        if (key?.startsWith(prefix)) {
          const raw = localStorage.getItem(key);
          try { JSON.parse(raw); pending.set(key.slice(prefix.length), raw); putLocal(key.slice(prefix.length), raw); }
          catch { localStorage.removeItem(key); }
        }
      }
    } catch { /* Storage can be disabled. */ }
    const { documents } = await request('/workspace');
    applyDocuments(documents);
    for (const key of pending.keys()) announce(key);
    notify({ phase: 'ready', user: auth.user, message: '', pending: pending.size });
    if (pending.size) await persistPending();
  })().catch((error) => { notify({ phase: 'error', message: error.message }); throw error; }).finally(() => { connecting = null; });
  return connecting;
}
export async function backendAction(path, body, method = 'POST') {
  return enqueue(async () => {
    if (pending.size) throw new Error('Tunggu data tersinkron, lalu coba kembali.');
    try {
      const result = await request(path, { method, body });
      if (result.documents) applyDocuments(result.documents);
      notify({ phase: 'ready', message: '' });
      return result.value;
    } catch (error) {
      if (!error.status || error.status >= 500 || error.status === 401) notify({ phase: 'error', message: error.message });
      throw error;
    }
  });
}
export function refreshWorkspace() {
  return enqueue(async () => {
    if (pending.size || status.phase === 'loading') return;
    const { documents } = await request('/workspace');
    applyDocuments(documents);
    notify({ phase: 'ready', message: '' });
  }).catch(() => { /* Retry on the next poll without interrupting an open page. */ });
}
export async function authenticateAccount(mode, fields) {
  await queue;
  if (pending.size) throw new Error('Sinkronkan perubahan terlebih dahulu sebelum mengganti akun.');
  const session = await request(`/auth/${mode}`, { method: 'POST', body: fields, anonymous: true });
  saveAuth(session);
  // Reload resets every React store and assessment draft for account isolation.
  window.location.hash = '#pilih-peran';
  window.location.reload();
}
export async function logoutAccount() {
  await queue;
  if (pending.size) throw new Error('Sinkronkan perubahan terlebih dahulu sebelum keluar.');
  saveAuth(await request('/auth/guest', { method: 'POST', anonymous: true }));
  window.location.hash = '#sign-in';
  window.location.reload();
}
export async function loadCatalogs() {
  const [courses, tutors, mentors, jobs] = await Promise.all([
    request('/courses'), request('/tutors'), request('/industry-mentors'), request('/opportunities'),
  ]);
  if (![courses, tutors, mentors, jobs].every(Array.isArray)) throw new Error('Data katalog server tidak valid.');
  return { courses, tutors, mentors, jobs };
}
