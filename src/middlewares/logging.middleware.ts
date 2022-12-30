import { Injectable, NestMiddleware } from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';
import { v4 } from 'uuid';

import { CustomLoggerHelper } from '@root/helpers/custom-logger.helper.service';
import { DateTimeHelper } from '@root/helpers/date-time.helper.service';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly dateTimeHelper: DateTimeHelper) {}

  use(request: Request, response: Response, next: NextFunction) {
    const uuid = v4();

    request.headers.requestId = uuid;

    const logger = new CustomLoggerHelper(request, this.dateTimeHelper);

    logger.setContext('SERVER');

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
