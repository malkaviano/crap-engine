import { Module, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from '@root/app.controller';
import { AppService } from '@root/app.service';
import { LoggingMiddleware } from '@root/middlewares/logging.middleware';
import { HelpersModule } from '@root/helpers/helpers.module';
import { AuthModule } from '@root/auth/auth.module';
import { JwtAuthGuard } from '@root/guards/jwt-auth.guard';

@Module({
  imports: [HelpersModule, AuthModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
