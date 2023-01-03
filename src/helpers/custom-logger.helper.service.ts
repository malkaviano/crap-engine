import { Injectable, LoggerService, Logger } from '@nestjs/common';

import { DateTimeHelper } from '@helpers/date-time.helper.service';

@Injectable()
export class CustomLoggerHelper implements LoggerService {
  private readonly logger: LoggerService;

  constructor(private readonly dateTimeHelper: DateTimeHelper) {
    this.logger = new Logger();
  }

  public error(message: string, exception: Error): void {
    const timestamp = this.dateTimeHelper.timestamp();

    const errorObj = {
      timestamp,
      message,
      exception: {
        name: exception.name,
        message: exception.message,
        stack: exception.stack,
      },
    };

    this.logger.error(errorObj);
  }

  public warn(message: string, data: object = {}): void {
    const timestamp = this.dateTimeHelper.timestamp();

    const dataObj = {
      timestamp,
      message,
      data,
    };

    this.logger.warn(JSON.stringify(dataObj, this.getCircularReplacer()));
  }

  public log(message: string, data: object = {}): void {
    const timestamp = this.dateTimeHelper.timestamp();

    const dataObj = {
      timestamp,
      message,
      data,
    };

    this.logger.log(JSON.stringify(dataObj, this.getCircularReplacer()));
  }

  private getCircularReplacer = () => {
    const seen = new WeakSet();
    return (_: string, value: unknown) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    };
  };
}
