import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { Strategy } from 'passport-local';

import { AuthService } from '@root/auth/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<string | null> {
    const authUser = await this.authService.validateUser(username, password);

    if (!authUser) {
      throw new UnauthorizedException();
    }

    return authUser;
  }
}
