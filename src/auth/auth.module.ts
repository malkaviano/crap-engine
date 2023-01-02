import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';

import { AuthService } from '@root/auth/auth.service';
import { AccountsRepository } from '@root/auth/accounts.repository';
import { LocalStrategy } from '@root/auth/strategies/local.strategy';
import { AuthController } from '@root/auth/auth.controller';
import { ConfigValuesHelper } from '@root/helpers/config-values.helper.service';
import { JwtStrategy } from '@root/auth/strategies/jwt.strategy';
import { JwtAuthGuard } from '@root/guards/jwt-auth.guard';

const config = new ConfigValuesHelper();

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: config.JWT_SECRET,
      signOptions: { expiresIn: config.JWT_EXPIRES_IN },
    }),
  ],
  providers: [
    AuthService,
    AccountsRepository,
    LocalStrategy,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
