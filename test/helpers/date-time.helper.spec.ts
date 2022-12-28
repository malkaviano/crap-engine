import { Test, TestingModule } from '@nestjs/testing';

import { DateTime } from 'luxon';

import { DateTimeHelper } from '@root/helpers/date-time.helper';

describe('TimestampService', () => {
  let service: DateTimeHelper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DateTimeHelper],
    }).compile();

    service = module.get<DateTimeHelper>(DateTimeHelper);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('when asking for current timestamp', () => {
    it('should return current timestamp', () => {
      expect(service.timestamp()).toContain('-03:00');
    });
  });

  describe('when asking for current DateTime', () => {
    it('should return current DateTime', () => {
      const expected = DateTime.now().hour;

      expect(service.now().hour).toEqual(expected);
    });
  });
});
