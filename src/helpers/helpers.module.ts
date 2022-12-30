import { Module, Global } from '@nestjs/common';

import { CustomLoggerHelper } from '@root/helpers/custom-logger.helper.service';
import { DateTimeHelper } from '@root/helpers/date-time.helper.service';
import { ConfigValuesHelper } from '@root/helpers/config-values.helper.service';
import { HasherHelper } from '@root/helpers/hasher.helper.service';
import { DiceSetHelper } from '@root/helpers/dice-set.helper.service';

@Global()
@Module({
  providers: [
    DateTimeHelper,
    CustomLoggerHelper,
    ConfigValuesHelper,
    HasherHelper,
    DiceSetHelper,
  ],
  exports: [
    DateTimeHelper,
    CustomLoggerHelper,
    ConfigValuesHelper,
    HasherHelper,
    DiceSetHelper,
  ],
})
export class HelpersModule {}
