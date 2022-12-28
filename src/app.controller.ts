import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { AppService } from '@root/app.service';
import { CustomLoggerHelper } from '@root/helpers/custom-logger.helper';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly logger: CustomLoggerHelper,
  ) {
    this.logger.setContext(AppController.name);
  }

  @ApiBearerAuth()
  @Get()
  getHello(): string {
    this.logger.warn('Just a test', { request: 'Good' });

    return this.appService.getHello();
  }
}
