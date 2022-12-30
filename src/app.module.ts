import { Module, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { LoggingMiddleware } from '@root/middlewares/logging.middleware';
import { AuthModule } from '@root/auth/auth.module';
import { JwtAuthGuard } from '@root/guards/jwt-auth.guard';
import { EventHubService } from '@root/services/event-hub/event-hub.service';
import { ItemModule } from '@root/services/resources/item/item.module';
import { InfraModule } from '@infra/infra.module';
import { HelpersModule } from '@helpers/helpers.module';

@Module({
  imports: [InfraModule, HelpersModule, AuthModule, ItemModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    EventHubService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
