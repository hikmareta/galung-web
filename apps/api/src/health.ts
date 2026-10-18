import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { Client } from 'pg';
import Redis from 'ioredis';

@Controller()
export class HealthController {
  @Get('health/live') live() { return { status: 'ok' }; }
  @Get('health/ready') async ready() {
    const db = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 2000 });
    const redis = new Redis(process.env.REDIS_URL!, { lazyConnect: true, connectTimeout: 2000, maxRetriesPerRequest: 0 });
    try {
      await db.connect();
      await db.query('SELECT 1');
      await redis.connect();
      if (await redis.ping() !== 'PONG') throw new Error('Redis unavailable');
      return { status: 'ok' };
    } catch { throw new ServiceUnavailableException({ error: { code: 'DEPENDENCY_UNAVAILABLE', message: 'Service not ready' } }); }
    finally { await db.end().catch(() => undefined); redis.disconnect(); }
  }
}
