import { Injectable, NestMiddleware } from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';

import { CustomLoggerHelper } from '@helpers/custom-logger.helper.service';
import { DateTimeHelper } from '@helpers/date-time.helper.service';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly dateTimeHelper: DateTimeHelper) {}

  use(request: Request, response: Response, next: NextFunction) {
    const logger = new CustomLoggerHelper(this.dateTimeHelper);

    logger.log('Request started', {
      headers: request.headers,
      ip: request.ip,
      method: request.method,
      body: request.body,
      query: request.query,
      params: request.params,
      path: request.path,
      originalUrl: request.originalUrl,
      baseUrl: request.baseUrl,
    });

    response.on('finish', () => {
      const { statusCode, statusMessage } = response;

      logger.log('Request ended', {
        statusCode,
        statusMessage,
      });
    });

    next();
  }
}
