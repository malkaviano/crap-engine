import { Module, MiddlewareConsumer } from '@nestjs/common';

import { LoggingMiddleware } from '@root/middlewares/logging.middleware';
import { AuthModule } from '@root/auth/auth.module';
import { ResourcesModule } from '@catalogs/catalog.module';
import { InfraModule } from '@infra/infra.module';
import { HelpersModule } from '@helpers/helpers.module';
import { RulesModule } from '@rules/rules.module';

@Module({
  imports: [
    InfraModule,
    HelpersModule,
    AuthModule,
    ResourcesModule,
    RulesModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
