import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './module';
import { parseConfig } from '@galung/config';
import { JsonLogger } from './logger';
async function main() {
  const config = parseConfig(process.env);
  const app = await NestFactory.create(AppModule, { logger: new JsonLogger() });
  if (process.env.IDENTITY_ENABLED === 'true') {
    app.enableCors({ origin: [process.env.CUSTOMER_ORIGIN!, process.env.ADMIN_ORIGIN!], credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'OPTIONS'], allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'X-Galung-Audience'] });
  }
  app.getHttpAdapter().getInstance().disable('x-powered-by');
  app.setGlobalPrefix('api/v1');
  await app.listen(config.API_PORT);
}
main().catch(() => { console.error('API startup failed'); process.exitCode = 1; });
