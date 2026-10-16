import { useState } from 'react';
import { authenticateAccount } from '../../state/backend';
import logo from '../../../images/logos/logo1new.png';
import mascot from '../../assets/mascot-reading.png';
import './AuthPage.css';

export default function AuthPage({ mode = 'login' }) {
  const registering = mode === 'register';
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    if (registering && fields.password !== fields.confirmPassword) { setError('Konfirmasi password belum sama.'); return; }
    if (registering && new TextEncoder().encode(fields.password).length > 72) { setError('Password maksimal 72 byte. Gunakan password yang lebih pendek.'); return; }
    setBusy(true); setError('');
    try { await authenticateAccount(registering ? 'register' : 'login', { name: fields.name?.trim(), email: fields.email.trim(), password: fields.password }); }
    catch (failure) { setError(failure.message || 'Belum bisa masuk. Coba kembali.'); setBusy(false); }
  }
  return <main className="auth-page">
    <a className="auth-brand" href="#mulai" aria-label="Tutor.in beranda"><img src={logo} alt="Tutor.in" /></a>
    <section className="auth-layout">
      <div className="auth-story"><span className="auth-eyebrow">BELAJAR. BERBAGI. BERTUMBUH.</span><h1>Langkah kecil,<br /><span>kesempatan besar.</span></h1><p>Masuk ke akunmu, lalu pilih ingin belajar atau mengajar. Satu akun untuk semua perjalananmu.</p><img src={mascot} alt="Tito membaca buku" /><div className="auth-story-note"><span aria-hidden="true">✦</span> Ilmu bertambah saat dibagikan.</div></div>
      <section className="auth-card" aria-labelledby="auth-title">
        <nav className="auth-tabs" aria-label="Pilihan masuk akun"><a href="#sign-in" aria-current={!registering ? 'page' : undefined}>Sign in</a><a href="#sign-up" aria-current={registering ? 'page' : undefined}>Sign up</a></nav>
        <h2 id="auth-title">{registering ? 'Mulai perjalananmu' : 'Selamat datang kembali!'}</h2>
        <p>{registering ? 'Buat akun untuk belajar dan berbagi ilmu bersama Tutor.in.' : 'Sign in dulu, lalu tentukan langkah belajarmu hari ini.'}</p>
        <form aria-label={registering ? 'Sign up' : 'Sign in'} onSubmit={submit}>
          {registering && <label htmlFor="auth-name">Nama lengkap<input id="auth-name" name="name" autoComplete="name" required maxLength={120} placeholder="Anna Ratna" disabled={busy} /></label>}
          <label htmlFor="auth-email">Email<input id="auth-email" name="email" type="email" autoComplete="email" required maxLength={120} placeholder="nama@email.com" disabled={busy} /></label>
          <label htmlFor="auth-password">Password<div className="auth-password"><input id="auth-password" name="password" type={visible ? 'text' : 'password'} autoComplete={registering ? 'new-password' : 'current-password'} required minLength={registering ? 8 : undefined} maxLength={72} placeholder={registering ? 'Minimal 8 karakter' : 'Masukkan password'} disabled={busy} /><button type="button" aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'} aria-pressed={visible} onClick={() => setVisible(!visible)}><svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.7" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />{visible && <path d="m3 3 18 18" stroke="currentColor" strokeWidth="1.7" />}</svg></button></div></label>
          {registering && <label htmlFor="auth-confirm">Konfirmasi password<input id="auth-confirm" name="confirmPassword" type={visible ? 'text' : 'password'} autoComplete="new-password" required maxLength={72} placeholder="Ulangi password" disabled={busy} /></label>}
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Memproses...' : registering ? 'Buat akun' : 'Masuk'}<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
        </form>
        <p className="auth-switch">{registering ? 'Sudah punya akun?' : 'Belum punya akun?'} <a href={registering ? '#sign-in' : '#sign-up'}>{registering ? 'Sign in' : 'Sign up'}</a></p>
        <a className="auth-back" href="#mulai">Kembali ke beranda</a>
      </section>
    </section>
  </main>;
}
