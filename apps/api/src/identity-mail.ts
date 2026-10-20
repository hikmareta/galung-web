import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import type { IdentityConfiguration } from './identity-security';

export function identityLink(origin: string, purpose: 'email_verify' | 'password_reset', token: string): string {
  const link = new URL(purpose === 'email_verify' ? '/verify-email' : '/reset-password', origin);
  link.hash = new URLSearchParams({ token }).toString();
  return link.toString();
}

@Injectable()
export class IdentityMail {
  async send(to: string, purpose: 'email_verify' | 'password_reset', token: string, config: IdentityConfiguration): Promise<void> {
    const link = identityLink(config.CUSTOMER_ORIGIN, purpose, token);
    const verify = purpose === 'email_verify';
    const subject = verify ? 'Verifikasi email Galung / Verify your Galung email' : 'Atur ulang kata sandi Galung / Reset your Galung password';
    const message = verify
      ? `Buka tautan ini untuk memverifikasi email Anda. / Open this link to verify your email:\n${link}\n\nJika Anda tidak meminta ini, abaikan pesan ini. / If you did not request this, ignore this message.`
      : `Buka tautan ini untuk mengatur ulang kata sandi Anda. / Open this link to reset your password:\n${link}\n\nJika Anda tidak meminta ini, abaikan pesan ini. / If you did not request this, ignore this message.`;
    const transport = nodemailer.createTransport(config.SMTP_URL);
    try { await transport.sendMail({ from: config.SMTP_FROM, to, subject, text: message }); }
    finally { transport.close(); }
  }
}
