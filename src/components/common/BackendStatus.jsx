import { useState, useSyncExternalStore } from 'react';
import { backendSnapshot, subscribeBackend, connectBackend, persistPending, authenticateAccount, logoutAccount } from '../../state/backend';
import './BackendStatus.css';

export function BackendStatus() {
  const state = useSyncExternalStore(subscribeBackend, backendSnapshot);
  if (state.phase === 'ready' && !state.pending) return null;
  return <div className="backend-status" role="status">
    <span>{state.pending ? `${state.pending} perubahan menunggu sinkronisasi. ` : ''}{state.message || 'Menyimpan ke server…'}</span>
    {state.phase === 'error' && <button type="button" onClick={() => (state.pending ? persistPending() : connectBackend()).catch(() => {})}>Coba lagi</button>}
  </div>;
}
export function AccountConnection() {
  const state = useSyncExternalStore(subscribeBackend, backendSnapshot);
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function submit(event) {
    event.preventDefault(); setBusy(true); setMessage('');
    try { await authenticateAccount(register ? 'register' : 'login', Object.fromEntries(new FormData(event.currentTarget))); }
    catch (error) { setMessage(error.message); setBusy(false); }
  }
  return <section className="account-connection activity-panel">
    <h2>{state.user?.guest ? 'Simpan data dengan akun' : 'Akun terhubung'}</h2>
    <p>{state.user?.guest ? 'Data sesi tamu tersimpan di server. Masuk atau daftar untuk memakai akun pribadi di perangkat lain. Akun baru memiliki data awal sendiri.' : state.user?.email}</p>
    {state.user?.guest ? <form onSubmit={submit}>
      {register && <label>Nama<input name="name" autoComplete="name" required maxLength={120} /></label>}
      <label>Email<input name="email" type="email" autoComplete="email" required maxLength={120} /></label>
      <label>Password<input name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} required minLength={register ? 8 : undefined} maxLength={72} /></label>
      <button className="profile-button" disabled={busy}>{busy ? 'Memproses…' : register ? 'Daftar' : 'Masuk'}</button>
      <button className="text-link" type="button" disabled={busy} onClick={() => setRegister(!register)}>{register ? 'Sudah punya akun? Masuk' : 'Buat akun baru'}</button>
    </form> : <button className="profile-button" disabled={busy} onClick={async () => {
      setBusy(true); try { await logoutAccount(); } catch (error) { setMessage(error.message); setBusy(false); }
    }}>Keluar</button>}
    <p role="status">{message}</p>
  </section>;
}
