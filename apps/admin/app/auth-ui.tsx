'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const api = `${(process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '')}/api/v1`;
const headers = { 'Content-Type': 'application/json' };
async function send(path: string, body: unknown, csrf?: string) { return fetch(`${api}${path}`, { method: 'POST', credentials: 'include', cache: 'no-store',
  headers: { ...headers, ...(csrf ? { 'X-CSRF-Token': csrf, 'X-Galung-Audience': 'admin' } : {}) }, body: JSON.stringify(body) }); }

export function AdminLogin() {
  const router = useRouter();
  const [stage, setStage] = useState<'password' | 'mfa' | 'enroll' | 'codes'>('password');
  const [challengeId, setChallengeId] = useState(''), [secret, setSecret] = useState(''), [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [recovery, setRecovery] = useState(false), [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  async function firstFactor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await send('/auth/login', { email: form.get('email'), password: form.get('password'), audience: 'admin' });
      if (response.status !== 202) throw new Error('LOGIN_FAILED');
      const result = await response.json(); setChallengeId(result.challengeId);
      if (result.enrollmentRequired) {
        const enrolled = await send('/auth/mfa/enroll', { challengeId: result.challengeId });
        if (!enrolled.ok) throw new Error('ENROLLMENT_FAILED');
        setSecret((await enrolled.json()).secret); setStage('enroll');
      } else setStage('mfa');
    } catch { setMessage('Masuk gagal. Periksa kredensial atau hubungi administrator. / Sign in failed.'); }
    finally { setBusy(false); }
  }
  async function secondFactor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage('');
    const value = String(new FormData(event.currentTarget).get('code') ?? '');
    const path = stage === 'enroll' ? '/auth/mfa/enroll/confirm' : recovery ? '/auth/mfa/recovery' : '/auth/mfa/complete';
    const body = recovery ? { challengeId, recoveryCode: value } : { challengeId, code: value };
    try {
      const response = await send(path, body);
      if (!response.ok) throw new Error('MFA_FAILED');
      const result = await response.json();
      if (stage === 'enroll') { setRecoveryCodes(result.recoveryCodes); setSecret(''); setStage('codes'); }
      else router.replace('/account');
    } catch { setMessage('Kode tidak berlaku atau tantangan berakhir. / Code invalid or challenge expired.'); }
    finally { setBusy(false); }
  }
  return <main className="auth-page"><section className="auth-card"><h1>Galung Admin</h1>
    {stage === 'password' && <form onSubmit={firstFactor}><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="username" required />
      <label htmlFor="password">Kata sandi <span lang="en">/ Password</span></label><input id="password" name="password" type="password" autoComplete="current-password" required />
      <button disabled={busy}>Masuk / Sign in</button></form>}
    {stage === 'enroll' && <><p>Daftarkan aplikasi autentikator dengan rahasia ini. Simpan secara pribadi. <span lang="en">/ Enroll your authenticator with this secret. Keep it private.</span></p>
      <code className="secret">{secret}</code><p>Masukkan kode enam digit untuk menyelesaikan pendaftaran. <span lang="en">/ Enter the six-digit code to finish enrollment.</span></p></>}
    {(stage === 'mfa' || stage === 'enroll') && <form onSubmit={secondFactor}>
      <label htmlFor="code">{recovery ? 'Kode pemulihan / Recovery code' : 'Kode autentikator / Authenticator code'}</label>
      <input id="code" name="code" type={recovery ? 'password' : 'text'} inputMode={recovery ? 'text' : 'numeric'} autoComplete="one-time-code"
        pattern={recovery ? '[A-Fa-f0-9]{64}' : '[0-9]{6}'} required />
      <button disabled={busy}>Verifikasi / Verify</button></form>}
    {stage === 'mfa' && <button type="button" onClick={() => setRecovery(!recovery)}>{recovery ? 'Gunakan autentikator / Use authenticator' : 'Gunakan kode pemulihan / Use recovery code'}</button>}
    {stage === 'codes' && <><h2>Kode pemulihan <span lang="en">/ Recovery codes</span></h2>
      <p>Salin sekarang. Kode ini hanya ditampilkan sekali. <span lang="en">/ Copy them now. They are shown only once.</span></p>
      <ol>{recoveryCodes.map(code => <li key={code}><code>{code}</code></li>)}</ol>
      <button onClick={() => { setRecoveryCodes([]); router.replace('/account'); }}>Saya sudah menyimpan kode / I saved the codes</button></>}
    {message && <p role="alert" className="error">{message}</p>}
  </section></main>;
}

export function AdminAccount() {
  const router = useRouter();
  const [session, setSession] = useState<{ id: string; authLevel: string } | null>(null), [csrf, setCsrf] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => { void (async () => {
    const response = await fetch(`${api}/auth/session`, { credentials: 'include', cache: 'no-store', headers: { 'X-Galung-Audience': 'admin' } });
    if (!response.ok) { router.replace('/login'); return; }
    setSession(await response.json());
    const token = await fetch(`${api}/auth/csrf`, { credentials: 'include', cache: 'no-store', headers: { 'X-Galung-Audience': 'admin' } });
    if (token.ok) setCsrf((await token.json()).csrfToken);
  })(); }, [router]);
  async function logout() {
    try {
      const response = await send('/auth/logout', {}, csrf);
      if (!response.ok) throw new Error('LOGOUT_FAILED');
      router.replace('/login');
    } catch { setMessage('Keluar gagal. Coba lagi. / Sign out failed. Please retry.'); }
  }
  return <main className="auth-page"><section className="auth-card"><h1>Sesi admin <span lang="en">/ Admin session</span></h1>
    {!session ? <p role="status">Memuat… / Loading…</p> : <><p>MFA: {session.authLevel === 'mfa' ? 'aktif / active' : 'tidak aktif / inactive'}</p>
      <button onClick={logout} disabled={!csrf}>Keluar / Sign out</button></>}
    {message && <p role="alert" className="error">{message}</p>}
  </section></main>;
}
