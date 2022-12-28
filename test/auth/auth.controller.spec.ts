import { Test, TestingModule } from '@nestjs/testing';

import { instance, mock } from 'ts-mockito';

import { AuthController } from '@root/auth/auth.controller';
import { AuthService } from '@root/auth/auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockedAuthService = mock(AuthService);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: instance(mockedAuthService) },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
