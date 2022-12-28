import { Test, TestingModule } from '@nestjs/testing';

import { instance, mock, when } from 'ts-mockito';

import { HasherHelper } from '@root/helpers/hasher.helper';
import { ConfigValuesHelper } from '@root/helpers/config-values.helper';

describe('HasherService', () => {
  let service: HasherHelper;

  const mockedConfigValuesHelper = mock(ConfigValuesHelper);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HasherHelper,
        {
          provide: ConfigValuesHelper,
          useValue: instance(mockedConfigValuesHelper),
        },
      ],
    }).compile();

    service = module.get<HasherHelper>(HasherHelper);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  [
    { pwd: 'ohmygowd', saltRounds: 10 },
    { pwd: '123456', saltRounds: 9 },
    { pwd: 'we@k', saltRounds: 8 },
    { pwd: 'X3Q8NxD3@h36', saltRounds: 11 },
    { pwd: 'wsJQS2W5^706Zr5', saltRounds: 12 },
  ].forEach(({ pwd, saltRounds }) => {
    describe('when hashing passwords', () => {
      it('should return a hash', async () => {
        const expected = 60;

        when(mockedConfigValuesHelper.BCRYPT_SALT_ROUNDS).thenReturn(
          saltRounds,
        );

        const result = await service.secureHash(pwd);

        expect(result.length).toEqual(expected);
      });
    });
  });

  [
    { pwd: 'ohmygowd', hashed: 'ohmygowd', saltRounds: 10, expected: true },
    { pwd: '123456', hashed: 'xpto', saltRounds: 9, expected: false },
    { pwd: 'we@k', hashed: 'xpto', saltRounds: 8, expected: false },
    { pwd: 'X3Q8NxD3@h36', hashed: 'xpto', saltRounds: 11, expected: false },
    {
      pwd: 'wsJQS2W5^706Zr5',
      hashed: 'wsJQS2W5^706Zr5',
      saltRounds: 12,
      expected: true,
    },
  ].forEach(({ pwd, hashed, saltRounds, expected }) => {
    describe(`when comparing ${pwd} with hashed ${hashed}`, () => {
      it(`should return ${expected}`, async () => {
        when(mockedConfigValuesHelper.BCRYPT_SALT_ROUNDS).thenReturn(
          saltRounds,
        );

        const hashedPwd = await service.secureHash(hashed);

        const result = await service.compare(pwd, hashedPwd);

        expect(result).toEqual(expected);
      });
    });
  });
});
