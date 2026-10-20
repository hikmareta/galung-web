import { test, expect, type Page } from '@playwright/test';

const customer = 'http://127.0.0.1:3000';
const admin = 'http://127.0.0.1:3001';
function mock(page: Page, path: string, status: number, body: unknown = {}) {
  return page.route(`**/api/v1${path}`, route => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) }));
}

test('customer registration, verification, login, recovery and session UI', async ({ page }) => {
  const requests: { path: string; body: Record<string, unknown> }[] = [];
  await page.route('**/api/v1/**', async route => {
    const req = route.request(); const path = new URL(req.url()).pathname;
    if (req.method() === 'POST') requests.push({ path, body: req.postDataJSON() as Record<string, unknown> });
    let status = 200; let body: unknown = {};
    if (path === '/api/v1/auth/register') status = 201;
    if (path === '/api/v1/auth/password-reset/request') status = 202;
    if (path === '/api/v1/me' && req.method() === 'GET') body = { email: 'customer@example.invalid', displayName: 'Test Customer', legalBillingName: 'Test Customer' };
    if (path === '/api/v1/me' && req.method() === 'PATCH') body = { email: 'customer@example.invalid', displayName: 'Changed', legalBillingName: 'Test Customer' };
    if (path === '/api/v1/auth/csrf') body = { csrfToken: 'synthetic-csrf' };
    await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.goto(`${customer}/register`);
  await page.getByLabel(/Nama tampilan/).fill('Test Customer');
  await page.getByLabel('Email').fill('customer@example.invalid');
  await page.getByLabel(/Kata sandi \(minimal/).fill('synthetic-password-123');
  await page.getByLabel(/Kode negara/).fill('ID');
  await page.getByRole('checkbox').first().check();
  await page.getByRole('checkbox').last().check();
  await page.getByRole('button', { name: 'Daftar / Register' }).click();
  await expect(page.getByRole('status')).toContainText('periksa email');
  expect(requests.at(-1)?.body).toMatchObject({ termsVersion: 'synthetic-browser-test', privacyNoticeVersion: 'synthetic-browser-test', acceptTerms: true, acknowledgePrivacy: true });

  await page.goto(`${customer}/verify-email#token=synthetic-verify`);
  await expect(page).toHaveURL(`${customer}/verify-email`);
  await page.getByRole('button', { name: 'Verifikasi / Verify' }).click();
  await expect(page.getByRole('status')).toContainText('terverifikasi');
  expect(requests.at(-1)?.body.token).toBe('synthetic-verify');

  await page.goto(`${customer}/login`);
  await page.getByLabel('Email').fill('customer@example.invalid');
  await page.getByLabel(/Kata sandi/).fill('synthetic-password-123');
  await page.getByRole('button', { name: 'Masuk / Sign in' }).click();
  await expect(page).toHaveURL(`${customer}/account`);
  await expect(page.getByText('customer@example.invalid')).toBeVisible();
  await page.getByRole('button', { name: 'Keluar / Sign out' }).click();
  await expect(page).toHaveURL(`${customer}/login`);

  await page.goto(`${customer}/forgot-password`);
  await page.getByLabel('Email').fill('customer@example.invalid');
  await page.getByRole('button', { name: 'Kirim tautan / Send link' }).click();
  await expect(page.getByRole('status')).toContainText('Jika akun tersedia');
  await page.goto(`${customer}/reset-password#token=synthetic-reset`);
  await expect(page).toHaveURL(`${customer}/reset-password`);
  await page.getByLabel(/Kata sandi baru/).fill('synthetic-new-password-123');
  await page.getByRole('button', { name: 'Simpan / Save' }).click();
  await expect(page.getByRole('status')).toContainText('Kata sandi diperbarui');
  expect(requests.at(-1)?.body.token).toBe('synthetic-reset');
});

test('admin MFA and recovery path, with keyboard-accessible controls', async ({ page }) => {
  const requests: string[] = [];
  await page.route('**/api/v1/**', async route => {
    const path = new URL(route.request().url()).pathname;
    requests.push(path);
    let status = 200; let body: unknown = {};
    if (path === '/api/v1/auth/login') { status = 202; body = { challengeId: 'synthetic-challenge', enrollmentRequired: false }; }
    if (path === '/api/v1/auth/session') body = { id: 'synthetic-session', authLevel: 'mfa' };
    if (path === '/api/v1/auth/csrf') body = { csrfToken: 'synthetic-csrf' };
    await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.goto(`${admin}/login`);
  await page.getByLabel('Email').fill('admin@example.invalid');
  await page.getByLabel(/Kata sandi/).fill('synthetic-password-123');
  await page.getByRole('button', { name: 'Masuk / Sign in' }).click();
  await expect(page.getByLabel(/Kode autentikator/)).toBeVisible();
  await page.getByRole('button', { name: /Gunakan kode pemulihan/ }).click();
  await page.getByLabel(/Kode pemulihan/).fill('a'.repeat(64));
  await page.getByRole('button', { name: 'Verifikasi / Verify' }).press('Enter');
  await expect(page).toHaveURL(`${admin}/account`);
  await expect(page.getByText('aktif / active')).toBeVisible();
  expect(requests).toContain('/api/v1/auth/mfa/recovery');
  const headers = await page.request.get(`${admin}/account`);
  expect(headers.headers()['cache-control']).toContain('no-store');
  expect(headers.headers()['x-frame-options']).toBe('DENY');
});

test('account redirects unauthenticated users and shows logout failure', async ({ page }) => {
  await mock(page, '/me', 401, { error: { code: 'UNAUTHENTICATED' } });
  await page.goto(`${customer}/account`);
  await expect(page).toHaveURL(`${customer}/login`);

  await page.unrouteAll();
  await mock(page, '/me', 200, { email: 'customer@example.invalid', displayName: 'Test', legalBillingName: 'Test' });
  await mock(page, '/auth/csrf', 200, { csrfToken: 'synthetic-csrf' });
  await mock(page, '/auth/logout', 503, { error: { code: 'UNAVAILABLE' } });
  await page.goto(`${customer}/account`);
  await page.getByRole('button', { name: 'Keluar / Sign out' }).click();
  await expect(page.locator('.auth-card [role="alert"]')).toContainText('Keluar gagal');
  await expect(page).toHaveURL(`${customer}/account`);
});

test('mobile auth controls fit viewport and have keyboard focus', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto(`${customer}/login`);
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus-visible')).toHaveCount(1);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});
