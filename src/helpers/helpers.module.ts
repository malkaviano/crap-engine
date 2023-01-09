import { Module, Global } from '@nestjs/common';

import { CustomLoggerHelper } from '@root/helpers/custom-logger.helper.service';
import { DateTimeHelper } from '@root/helpers/date-time.helper.service';
import { ConfigValuesHelper } from '@root/helpers/config-values.helper.service';
import { HasherHelper } from '@root/helpers/hasher.helper.service';
import { DiceSetHelper } from '@root/helpers/dice-set.helper.service';
import { ConverterHelper } from './converter.helper.service';
import { GeneratorHelper } from './generator.helper.service';

@Global()
@Module({
  providers: [
    DateTimeHelper,
    CustomLoggerHelper,
    ConfigValuesHelper,
    HasherHelper,
    DiceSetHelper,
    ConverterHelper,
    GeneratorHelper,
  ],
  exports: [
    DateTimeHelper,
    CustomLoggerHelper,
    ConfigValuesHelper,
    HasherHelper,
    DiceSetHelper,
    ConverterHelper,
    GeneratorHelper,
  ],
})
export class HelpersModule {}
