import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AccountsRepository } from '@root/auth/accounts.repository';
import { HasherHelper } from '@root/helpers/hasher.helper.service';
import { JWTTokenDto } from '@dtos/jwt-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly hasherHelper: HasherHelper,
    private readonly accountsRepository: AccountsRepository,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<string | null> {
    const user = await this.accountsRepository.findOne(username);

    if (user) {
      const valid = await this.hasherHelper.compare(password, user.password);

      if (valid) {
        return user.username;
      }
    }

    return null;
  }

  async generateToken(username: string): Promise<JWTTokenDto> {
    const accessToken = await this.jwtService.signAsync({ username });

    return {
      accessToken,
    };
  }
}
