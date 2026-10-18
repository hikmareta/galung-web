import { Controller, Get, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { Client } from 'pg';
import Redis from 'ioredis';
import { PublicRoute } from './authorization';

@Injectable()
export class ReadinessProbe {
  async check(): Promise<void> {
    const db = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 2000 });
    const redis = new Redis(process.env.REDIS_URL!, { lazyConnect: true, connectTimeout: 2000, maxRetriesPerRequest: 0 });
    try {
      await db.connect();
      await db.query('SELECT 1');
      await redis.connect();
      if (await redis.ping() !== 'PONG') throw new Error('Redis unavailable');
    } finally { await db.end().catch(() => undefined); redis.disconnect(); }
  }
}

@Controller()
@PublicRoute()
export class HealthController {
  constructor(private readonly probe: ReadinessProbe) {}
  @Get('health/live') live() { return { status: 'ok' }; }
  @Get('health/ready') async ready() {
    try {
      await this.probe.check();
      return { status: 'ok' };
    } catch { throw new ServiceUnavailableException({ error: { code: 'DEPENDENCY_UNAVAILABLE', message: 'Service not ready' } }); }
  }
}
