import { Test, TestingModule } from '@nestjs/testing';
import { Logger, Scope } from '@nestjs/common';

import { mock, instance, anything, verify, anyString } from 'ts-mockito';

import { CustomLoggerHelper } from '@root/helpers/custom-logger.helper';
import { DateTimeHelper } from '@root/helpers/date-time.helper';

describe('CustomLoggerHelper', () => {
  const mockedDatetimeHelper = mock(DateTimeHelper);
  const mockedLogger = mock(Logger);

  let service: CustomLoggerHelper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomLoggerHelper,
        {
          provide: DateTimeHelper,
          useValue: instance(mockedDatetimeHelper),
          scope: Scope.REQUEST,
        },
      ],
    })
      .overrideProvider('REQUEST')
      .useValue({ headers: { requestId: 'requestId' } })
      .compile();

    service = await module.resolve<CustomLoggerHelper>(CustomLoggerHelper);

    // eslint-disable-next-line
    (service as any).logger = instance(mockedLogger);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('when logging an error', () => {
    it('should call logger error', () => {
      const e = new Error('Some Error ocurred');

      e.name = 'CustomError';

      e.stack = 'some stack problem at line X';

      service.error('Problem occurred', e);

      verify(mockedLogger.error(anything(), anyString())).once();
    });
  });

  describe('when logging a warn', () => {
    it('should call logger warn', () => {
      const obj = { a: 'a', b: 1, c: { d: 'tt' } };

      service.warn('Warn occurred', obj);

      verify(mockedLogger.warn(anything(), anyString())).once();
    });
  });

  describe('when logging a log', () => {
    it('should call logger log', () => {
      const obj = { a: 'a', b: 1, c: { d: 'tt' } };

      service.log('Info occurred', obj);

      verify(mockedLogger.log(anything(), anyString())).once();
    });
  });
});
