import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { HealthController } from './health';
import { RequestLogMiddleware } from './request-log';
@Module({ controllers: [HealthController] })
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) { consumer.apply(RequestLogMiddleware).forRoutes('{*path}'); }
}
