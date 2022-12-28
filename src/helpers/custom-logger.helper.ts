import {
  Inject,
  Injectable,
  LoggerService,
  Logger,
  Scope,
} from '@nestjs/common';

import { Request } from 'express';

import { DateTimeHelper } from '@root/helpers/date-time.helper';

@Injectable({ scope: Scope.TRANSIENT })
export class CustomLoggerHelper implements LoggerService {
  private context = 'NO_CONTEXT';
  private readonly logger: LoggerService;
  private readonly requestId: string;

  constructor(
    @Inject('REQUEST') request: Request,
    private readonly dateTimeHelper: DateTimeHelper,
  ) {
    this.logger = new Logger();
    this.requestId = request.headers.requestId as string;
  }

  public setContext(context: string): void {
    this.context = context;
  }

  public error(message: string, exception: Error): void {
    const timestamp = this.dateTimeHelper.timestamp();

    const errorObj = {
      timestamp,
      requestId: this.requestId,
      message,
      exception: {
        name: exception.name,
        message: exception.message,
        stack: exception.stack,
      },
    };

    this.logger.error(errorObj, this.context);
  }

  public warn(message: string, data: object = {}): void {
    const timestamp = this.dateTimeHelper.timestamp();

    const dataObj = {
      timestamp,
      requestId: this.requestId,
      message,
      data,
    };

    this.logger.warn(
      JSON.stringify(dataObj, this.getCircularReplacer()),
      this.context,
    );
  }

  public log(message: string, data: object = {}): void {
    const timestamp = this.dateTimeHelper.timestamp();

    const dataObj = {
      timestamp,
      requestId: this.requestId,
      message,
      data,
    };

    this.logger.log(
      JSON.stringify(dataObj, this.getCircularReplacer()),
      this.context,
    );
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
