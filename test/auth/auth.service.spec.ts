import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { anyString, anything, instance, mock, when } from 'ts-mockito';

import { AuthService } from '@root/auth/auth.service';
import { AccountsRepository } from '@root/auth/accounts.repository';
import { HasherHelper } from '@root/helpers/hasher.helper.service';
import { Account } from '@root/auth/account.model';

describe('AuthService', () => {
  let service: AuthService;

  const mockedUsersRepository = mock(AccountsRepository);
  const mockedHasherHelper = mock(HasherHelper);
  const mockedJwtService = mock(JwtService);

  const username = 'usernameXpto';
  const password = 'password';
  const account = new Account(username, password);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: HasherHelper, useValue: instance(mockedHasherHelper) },
        {
          provide: AccountsRepository,
          useValue: instance(mockedUsersRepository),
        },
        {
          provide: JwtService,
          useValue: instance(mockedJwtService),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  [
    {
      passwordMatched: true,
      dbAccount: account,
      expected: username,
    },
    {
      passwordMatched: false,
      dbAccount: account,
      expected: null,
    },
    {
      passwordMatched: true,
      dbAccount: undefined,
      expected: null,
    },
    {
      passwordMatched: false,
      dbAccount: undefined,
      expected: null,
    },
  ].forEach(({ passwordMatched, dbAccount, expected }) => {
    describe('when authenticating a valid user', () => {
      it('should return username and display name', async () => {
        when(mockedHasherHelper.compare(anyString(), anyString())).thenResolve(
          passwordMatched,
        );

        when(mockedUsersRepository.findOne(anyString())).thenResolve(dbAccount);

        const result = await service.validateUser('username', 'password');

        expect(result).toEqual(expected);
      });
    });
  });

  describe('when generating JWT token', () => {
    it('should return JWT token string', async () => {
      when(mockedJwtService.signAsync(anything())).thenResolve('someToken');

      const expected = { accessToken: 'someToken' };

      const result = await service.generateToken('username');

      expect(result).toEqual(expected);
    });
  });
});
