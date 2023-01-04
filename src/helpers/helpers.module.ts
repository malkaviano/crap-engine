import { Module, Global } from '@nestjs/common';

import { CustomLoggerHelper } from '@root/helpers/custom-logger.helper.service';
import { DateTimeHelper } from '@root/helpers/date-time.helper.service';
import { ConfigValuesHelper } from '@root/helpers/config-values.helper.service';
import { HasherHelper } from '@root/helpers/hasher.helper.service';
import { DiceSetHelper } from '@root/helpers/dice-set.helper.service';
import { ConverterHelperService } from './converter.helper.service';

@Global()
@Module({
  providers: [
    DateTimeHelper,
    CustomLoggerHelper,
    ConfigValuesHelper,
    HasherHelper,
    DiceSetHelper,
    ConverterHelperService,
  ],
  exports: [
    DateTimeHelper,
    CustomLoggerHelper,
    ConfigValuesHelper,
    HasherHelper,
    DiceSetHelper,
    ConverterHelperService,
  ],
})
export class HelpersModule {}
