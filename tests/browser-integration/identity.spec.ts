import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { Client } from 'pg';
import { decryptFactor } from '../../apps/api/src/identity-security';

const origin = 'http://localhost:3000';
const outboxKey = Buffer.from('55'.repeat(32), 'hex');
async function latestToken(email: string, purpose: 'email_verify' | 'password_reset'): Promise<string> {
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  try {
    const result = await db.query<{ payload_ciphertext: Buffer }>(`SELECT o.payload_ciphertext FROM galung.identity_delivery_outbox o
      JOIN galung.users u ON u.id=o.user_id WHERE u.email=$1 AND o.purpose=$2 ORDER BY o.created_at DESC LIMIT 1`, [email, purpose]);
    expect(result.rowCount).toBe(1);
    return decryptFactor(result.rows[0].payload_ciphertext, outboxKey);
  } finally { await db.end(); }
}

test('real browser + API + PostgreSQL 16 + Redis: verify, login, reset, revoke', async ({ page }) => {
  const email = `phase02-${randomUUID()}@example.invalid`;
  const initialPassword = 'synthetic-initial-password-123';
  const newPassword = 'synthetic-replacement-password-123';
  await page.goto(`${origin}/register`);
  await page.getByLabel(/Nama tampilan/).fill('Synthetic Customer');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel(/Kata sandi \(minimal/).fill(initialPassword);
  await page.getByLabel(/Kode negara/).fill('ID');
  await page.getByRole('checkbox').first().check();
  await page.getByRole('checkbox').last().check();
  await page.getByRole('button', { name: 'Daftar / Register' }).click();
  await expect(page.getByRole('status')).toContainText('periksa email');

  const verifyToken = await latestToken(email, 'email_verify');
  await page.goto(`${origin}/verify-email#token=${verifyToken}`);
  await expect(page).toHaveURL(`${origin}/verify-email`);
  await page.getByRole('button', { name: 'Verifikasi / Verify' }).click();
  await expect(page.getByRole('status')).toContainText('terverifikasi');

  await page.goto(`${origin}/login`);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel(/Kata sandi/).fill(initialPassword);
  await page.getByRole('button', { name: 'Masuk / Sign in' }).click();
  await expect(page).toHaveURL(`${origin}/account`);
  await expect(page.getByText(email)).toBeVisible();

  await page.goto(`${origin}/forgot-password`);
  await page.getByLabel('Email').fill(email);
  await page.getByRole('button', { name: 'Kirim tautan / Send link' }).click();
  await expect(page.getByRole('status')).toContainText('Jika akun tersedia');
  const resetToken = await latestToken(email, 'password_reset');
  await page.goto(`${origin}/reset-password#token=${resetToken}`);
  await expect(page).toHaveURL(`${origin}/reset-password`);
  await page.getByLabel(/Kata sandi baru/).fill(newPassword);
  await page.getByRole('button', { name: 'Simpan / Save' }).click();
  await expect(page.getByRole('status')).toContainText('Kata sandi diperbarui');
  await page.goto(`${origin}/account`);
  await expect(page).toHaveURL(`${origin}/login`);

  await page.getByLabel('Email').fill(email);
  await page.getByLabel(/Kata sandi/).fill(newPassword);
  await page.getByRole('button', { name: 'Masuk / Sign in' }).click();
  await expect(page).toHaveURL(`${origin}/account`);
  await expect(page.getByText(email)).toBeVisible();
});
