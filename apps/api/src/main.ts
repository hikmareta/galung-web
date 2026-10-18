import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './module';
import { parseConfig } from '@galung/config';
import { JsonLogger } from './logger';
async function main() {
  const config = parseConfig(process.env);
  const app = await NestFactory.create(AppModule, { logger: new JsonLogger() });
  app.getHttpAdapter().getInstance().disable('x-powered-by');
  app.setGlobalPrefix('api/v1');
  await app.listen(config.API_PORT);
}
main().catch(error => { console.error('API startup failed', error instanceof Error ? error.message : 'unknown'); process.exitCode = 1; });
