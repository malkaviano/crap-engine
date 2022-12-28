import { LoggingMiddleware } from '@root/middlewares/logging.middleware';
import { DateTimeHelper } from '@root/helpers/date-time.helper';

describe('LoggingMiddleware', () => {
  it('should be defined', () => {
    expect(new LoggingMiddleware(new DateTimeHelper())).toBeDefined();
  });
});
