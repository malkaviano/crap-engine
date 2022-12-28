import { Module, Global } from '@nestjs/common';

import { CustomLoggerHelper } from '@root/helpers/custom-logger.helper';
import { DateTimeHelper } from '@root/helpers/date-time.helper';
import { ConfigValuesHelper } from '@root/helpers/config-values.helper';
import { HasherHelper } from '@root/helpers/hasher.helper';

@Global()
@Module({
  providers: [
    DateTimeHelper,
    CustomLoggerHelper,
    ConfigValuesHelper,
    HasherHelper,
  ],
  exports: [
    DateTimeHelper,
    CustomLoggerHelper,
    ConfigValuesHelper,
    HasherHelper,
  ],
})
export class HelpersModule {}
