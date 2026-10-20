'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const api = `${(process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '')}/api/v1`;
const legal = {
  termsVersion: process.env.NEXT_PUBLIC_LEGAL_TERMS_VERSION,
  privacyNoticeVersion: process.env.NEXT_PUBLIC_LEGAL_PRIVACY_VERSION,
  termsUrl: process.env.NEXT_PUBLIC_LEGAL_TERMS_URL,
  privacyUrl: process.env.NEXT_PUBLIC_LEGAL_PRIVACY_URL,
};
type ApiError = { error?: { code?: string } };
async function post(path: string, body: unknown, csrf?: string) {
  return fetch(`${api}${path}`, { method: 'POST', credentials: 'include', cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...(csrf ? { 'X-CSRF-Token': csrf } : {}) }, body: JSON.stringify(body) });
}
async function errorCode(response: Response) { const body = await response.json().catch(() => ({})) as ApiError; return body.error?.code ?? 'REQUEST_FAILED'; }
function Message({ message, error = false }: { message: string; error?: boolean }) { return message ? <p role={error ? 'alert' : 'status'} className={error ? 'error' : 'success'}>{message}</p> : null; }

export function LoginForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [show, setShow] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await post('/auth/login', { email: form.get('email'), password: form.get('password'), audience: 'customer' });
      if (!response.ok) throw new Error(await errorCode(response));
      router.replace('/account');
    } catch { setMessage('Masuk gagal. Periksa email dan kata sandi. / Sign in failed. Check your email and password.'); }
    finally { setBusy(false); }
  }
  return <main className="auth-page"><section className="auth-card" aria-labelledby="title">
    <h1 id="title">Masuk <span lang="en">/ Sign in</span></h1>
    <form onSubmit={submit}>
      <label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="username" required maxLength={320} />
      <label htmlFor="password">Kata sandi <span lang="en">/ Password</span></label>
      <div className="password-row"><input id="password" name="password" type={show ? 'text' : 'password'} autoComplete="current-password" required />
        <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Sembunyikan kata sandi / Hide password' : 'Tampilkan kata sandi / Show password'}>{show ? 'Sembunyikan' : 'Tampilkan'}</button></div>
      <button type="submit" disabled={busy}>{busy ? 'Memproses… / Processing…' : 'Masuk / Sign in'}</button>
    </form><Message message={message} error />
    <p><a href="/forgot-password">Lupa kata sandi? <span lang="en">/ Forgot password?</span></a></p>
    <p><a href="/register">Buat akun <span lang="en">/ Create account</span></a></p>
  </section></main>;
}

export function RegisterForm() {
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [error, setError] = useState(false);
  const ready = Object.values(legal).every(Boolean);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!ready) return;
    const formElement = event.currentTarget;
    setBusy(true); setMessage('');
    const form = new FormData(formElement);
    try {
      const response = await post('/auth/register', { email: form.get('email'), password: form.get('password'), displayName: form.get('displayName'),
        countryCode: String(form.get('countryCode')).toUpperCase(), preferredLocale: form.get('preferredLocale'),
        termsVersion: legal.termsVersion, privacyNoticeVersion: legal.privacyNoticeVersion,
        acceptTerms: form.get('acceptTerms') === 'on', acknowledgePrivacy: form.get('acknowledgePrivacy') === 'on' });
      if (!response.ok) throw new Error(await errorCode(response));
      setError(false); setMessage('Jika alamat ini dapat didaftarkan, periksa email untuk verifikasi. / If this address can be registered, check your email for verification.');
      formElement.reset();
    } catch { setError(true); setMessage('Pendaftaran belum dapat diproses. Periksa data dan coba lagi. / Registration could not be processed.'); }
    finally { setBusy(false); }
  }
  return <main className="auth-page"><section className="auth-card" aria-labelledby="title"><h1 id="title">Buat akun <span lang="en">/ Create account</span></h1>
    {!ready ? <p role="status">Pendaftaran menunggu dokumen hukum yang disetujui. / Registration is awaiting approved legal documents.</p> :
      <form onSubmit={submit}>
        <label htmlFor="displayName">Nama tampilan <span lang="en">/ Display name</span></label><input id="displayName" name="displayName" required maxLength={150} />
        <label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required maxLength={320} />
        <label htmlFor="password">Kata sandi (minimal 12 karakter) <span lang="en">/ Password (at least 12 characters)</span></label><input id="password" name="password" type="password" autoComplete="new-password" minLength={12} required />
        <label htmlFor="countryCode">Kode negara dua huruf <span lang="en">/ Two-letter country code</span></label><input id="countryCode" name="countryCode" minLength={2} maxLength={2} pattern="[A-Za-z]{2}" required />
        <label htmlFor="preferredLocale">Bahasa <span lang="en">/ Language</span></label><select id="preferredLocale" name="preferredLocale"><option value="id-ID">Bahasa Indonesia</option><option value="en">English</option></select>
        <label className="check"><input name="acceptTerms" type="checkbox" required /> Saya menyetujui <a href={legal.termsUrl} target="_blank" rel="noopener noreferrer">Syarat Penggunaan</a> (versi {legal.termsVersion}). <span lang="en">/ I accept the Terms.</span></label>
        <label className="check"><input name="acknowledgePrivacy" type="checkbox" required /> Saya telah membaca <a href={legal.privacyUrl} target="_blank" rel="noopener noreferrer">Pemberitahuan Privasi</a> (versi {legal.privacyNoticeVersion}). <span lang="en">/ I have read the Privacy Notice.</span></label>
        <button type="submit" disabled={busy}>{busy ? 'Memproses…' : 'Daftar / Register'}</button>
      </form>}
    <Message message={message} error={error} /><p><a href="/login">Sudah punya akun? Masuk / Already registered? Sign in</a></p>
  </section></main>;
}

export function ForgotForm() {
  const [busy, setBusy] = useState(false), [sent, setSent] = useState(false), [message, setMessage] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage('');
    const email = new FormData(event.currentTarget).get('email');
    try {
      const response = await post('/auth/password-reset/request', { email });
      if (!response.ok) throw new Error(await errorCode(response));
      setSent(true);
    } catch { setMessage('Permintaan belum dapat diproses. Coba lagi. / Request could not be processed.'); }
    finally { setBusy(false); }
  }
  return <main className="auth-page"><section className="auth-card"><h1>Lupa kata sandi <span lang="en">/ Forgot password</span></h1>
    {sent ? <Message message="Jika akun tersedia, tautan pemulihan akan dikirim. / If an account exists, a recovery link will be sent." /> :
      <form onSubmit={submit}><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required /><button disabled={busy}>Kirim tautan / Send link</button></form>}
    <Message message={message} error /><p><a href="/login">Kembali ke masuk / Back to sign in</a></p></section></main>;
}

export function ResetForm() {
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false), [done, setDone] = useState(false), [message, setMessage] = useState('');
  useEffect(() => { setToken(new URLSearchParams(window.location.hash.slice(1)).get('token') ?? ''); window.history.replaceState({}, '', '/reset-password'); }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage('');
    const newPassword = new FormData(event.currentTarget).get('newPassword');
    try {
      const response = await post('/auth/password-reset/confirm', { token, newPassword });
      if (!response.ok) throw new Error(await errorCode(response));
      setDone(true);
    } catch { setMessage('Tautan tidak berlaku atau sudah digunakan. Minta tautan baru. / Link expired or already used. Request a new one.'); }
    finally { setBusy(false); }
  }
  return <main className="auth-page"><section className="auth-card"><h1>Atur ulang kata sandi <span lang="en">/ Reset password</span></h1>
    {token === null ? <p role="status">Memuat… / Loading…</p> : !token ? <Message message="Tautan pemulihan tidak lengkap. / Recovery link is incomplete." error /> : done ? <Message message="Kata sandi diperbarui. Silakan masuk. / Password updated. Please sign in." /> :
      <form onSubmit={submit}><label htmlFor="newPassword">Kata sandi baru (minimal 12 karakter) <span lang="en">/ New password (at least 12 characters)</span></label>
        <input id="newPassword" name="newPassword" type="password" autoComplete="new-password" minLength={12} required /><button disabled={busy}>Simpan / Save</button></form>}
    <Message message={message} error /><p><a href="/login">Masuk / Sign in</a></p></section></main>;
}

export function VerifyForm() {
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false), [done, setDone] = useState(false), [message, setMessage] = useState('');
  useEffect(() => { setToken(new URLSearchParams(window.location.hash.slice(1)).get('token') ?? ''); window.history.replaceState({}, '', '/verify-email'); }, []);
  async function verify() {
    setBusy(true); setMessage('');
    try {
      const response = await post('/auth/email-verification/confirm', { token });
      if (!response.ok) throw new Error(await errorCode(response));
      setDone(true);
    } catch { setMessage('Tautan tidak berlaku atau sudah digunakan. / Link expired or already used.'); }
    finally { setBusy(false); }
  }
  return <main className="auth-page"><section className="auth-card"><h1>Verifikasi email <span lang="en">/ Verify email</span></h1>
    {token === null ? <p role="status">Memuat… / Loading…</p> : !token ? <Message message="Tautan verifikasi tidak lengkap. / Verification link is incomplete." error /> : done ? <Message message="Email terverifikasi. / Email verified." /> :
      <button onClick={verify} disabled={busy}>Verifikasi / Verify</button>}
    <Message message={message} error /><p><a href="/login">Masuk / Sign in</a></p></section></main>;
}

export function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<{ email: string; displayName: string | null; legalBillingName: string | null } | null>(null);
  const [csrf, setCsrf] = useState(''), [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
  useEffect(() => { void (async () => {
    const response = await fetch(`${api}/me`, { credentials: 'include', cache: 'no-store' });
    if (response.status === 401) { router.replace('/login'); return; }
    if (!response.ok) { setMessage('Akun belum dapat dimuat. / Account could not be loaded.'); return; }
    setProfile(await response.json());
    const csrfResponse = await fetch(`${api}/auth/csrf`, { credentials: 'include', cache: 'no-store' });
    if (csrfResponse.ok) setCsrf((await csrfResponse.json()).csrfToken);
  })(); }, [router]);
  async function update(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`${api}/me`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
        body: JSON.stringify({ displayName: form.get('displayName'), legalBillingName: form.get('legalBillingName') }) });
      if (!response.ok) throw new Error(await errorCode(response));
      setProfile(await response.json()); setMessage('Profil disimpan. / Profile saved.');
    } catch { setMessage('Profil belum tersimpan. / Profile was not saved.'); }
    finally { setBusy(false); }
  }
  async function logout() {
    try {
      const response = await post('/auth/logout', {}, csrf);
      if (!response.ok) throw new Error(await errorCode(response));
      router.replace('/login');
    } catch { setMessage('Keluar gagal. Coba lagi. / Sign out failed. Please retry.'); }
  }
  return <main className="auth-page"><section className="auth-card"><h1>Akun saya <span lang="en">/ My account</span></h1>
    {!profile ? <p role="status">Memuat… / Loading…</p> : <><p>Email: {profile.email}</p>
      <form onSubmit={update}><label htmlFor="displayName">Nama tampilan <span lang="en">/ Display name</span></label>
        <input id="displayName" name="displayName" defaultValue={profile.displayName ?? ''} required />
        <label htmlFor="legalBillingName">Nama penagihan resmi <span lang="en">/ Legal billing name</span></label>
        <input id="legalBillingName" name="legalBillingName" defaultValue={profile.legalBillingName ?? ''} required />
        <button disabled={busy || !csrf}>Simpan / Save</button></form>
      <button onClick={logout} disabled={!csrf}>Keluar / Sign out</button></>}
    <Message message={message} error={message.includes('belum') || message.includes('gagal')} />
  </section></main>;
}
