import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { IdentityGateway } from './identity-http';
import { IdentityStore } from './identity-store';
import { IdentityMail } from './identity-mail';
import { decryptFactor } from './identity-security';

@Injectable()
export class IdentityDeliveryWorker implements OnModuleInit, OnModuleDestroy {
  private timer?: NodeJS.Timeout;
  constructor(@Inject(IdentityGateway) private readonly gateway: IdentityGateway,
    @Inject(IdentityStore) private readonly store: IdentityStore,
    @Inject(IdentityMail) private readonly mail: IdentityMail) {}
  onModuleInit() {
    if (!this.gateway.config || process.env.APP_ENV === 'test') return;
    this.timer = setInterval(() => { void this.deliverOnce().catch(() => undefined); }, this.gateway.config.IDENTITY_MAIL_POLL_MS);
    this.timer.unref();
  }
  onModuleDestroy() { if (this.timer) clearInterval(this.timer); }
  async deliverOnce(): Promise<boolean> {
    const config = this.gateway.requireConfig();
    const delivery = await this.store.claimDelivery();
    if (!delivery) return false;
    let delivered = false;
    try {
      const token = decryptFactor(delivery.ciphertext, config.IDENTITY_OUTBOX_KEY);
      await this.mail.send(delivery.email, delivery.purpose, token, config);
      delivered = true;
    } catch { /* Delivery state and audit are persisted below. */ }
    await this.store.finishDelivery(delivery, delivered, randomUUID());
    return true;
  }
}
