import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { HealthController, ReadinessProbe } from './health';
import { RequestLogMiddleware } from './request-log';
import { PermissionGuard } from './authorization';
import { IdentityController, IdentityGateway, IdentityMiddleware, IdentityProfileController } from './identity-http';
import { IdentityStore } from './identity-store';
import { IdentityMail } from './identity-mail';
import { IdentityDeliveryWorker } from './identity-delivery';
import { IdentityErrorFilter } from './identity-errors';
@Module({ controllers: [HealthController, IdentityController, IdentityProfileController], providers: [ReadinessProbe, IdentityStore, IdentityMail, IdentityGateway, IdentityMiddleware, IdentityDeliveryWorker, { provide: APP_GUARD, useClass: PermissionGuard }, { provide: APP_FILTER, useClass: IdentityErrorFilter }] })
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) { consumer.apply(RequestLogMiddleware, IdentityMiddleware).forRoutes('{*path}'); }
}
