import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { HealthController, ReadinessProbe } from './health';
import { RequestLogMiddleware } from './request-log';
import { PermissionGuard } from './authorization';
@Module({ controllers: [HealthController], providers: [ReadinessProbe, { provide: APP_GUARD, useClass: PermissionGuard }] })
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) { consumer.apply(RequestLogMiddleware).forRoutes('{*path}'); }
}
