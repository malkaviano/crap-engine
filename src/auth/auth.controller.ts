import { Controller, Post, Request, UseGuards, HttpCode } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';

import { LocalAuthGuard } from '@root/guards/local-auth.guard';
import { AuthService } from '@root/auth/auth.service';
import { JWTTokenDto } from '@dtos/jwt-token.dto';
import { LoginDto } from '@dtos/login.dto';
import { NoJWT } from '@root/annotations/no-jwt.annotation';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @ApiBody({ type: LoginDto })
  @NoJWT()
  @UseGuards(LocalAuthGuard)
  @Post('token')
  @HttpCode(200)
  async generateToken(@Request() req: { user: string }): Promise<JWTTokenDto> {
    return this.service.generateToken(req.user);
  }
}
