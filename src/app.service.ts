import { Injectable } from '@nestjs/common';

import { CustomLoggerHelper } from '@root/helpers/custom-logger.helper';
import { ConfigValuesHelper } from './helpers/config-values.helper';

@Injectable()
export class AppService {
  constructor(
    private readonly logger: CustomLoggerHelper,
    private readonly config: ConfigValuesHelper,
  ) {
    this.logger.setContext(AppService.name);
  }

  getHello(): string {
    this.logger.warn('Just a test', { request: 'Not so bad' });

    this.logger.warn('Look at the admin', { admin: this.config.DB_USER });

    return 'Hello World!';
  }
}
