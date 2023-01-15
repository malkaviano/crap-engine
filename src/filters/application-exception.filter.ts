import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

import { Request, Response } from 'express';

import { ApplicationError } from '@errors/application.error';
import { CustomLoggerHelper } from '@helpers/custom-logger.helper.service';

@Catch(ApplicationError)
export class ApplicationExceptionFilter implements ExceptionFilter {
  constructor(private readonly customLoggerHelper: CustomLoggerHelper) {}

  catch(exception: ApplicationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    this.customLoggerHelper.error(exception.message, exception);

    response.status(exception.code).json({
      statusCode: exception.code,
      timestamp: new Date().toISOString(),
      message: exception.message,
    });
  }
}
