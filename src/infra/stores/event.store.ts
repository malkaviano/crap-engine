import { Injectable } from '@nestjs/common';

import { ConfigValuesHelper } from '@helpers/config-values.helper.service';
import { CustomLoggerHelper } from '@helpers/custom-logger.helper.service';
import { AmqpClient } from '@infra/clients/amqp.client';

@Injectable()
export class EventStore {
  constructor(
    private readonly amqpClient: AmqpClient,
    private readonly configValuesHelper: ConfigValuesHelper,
    private readonly logger: CustomLoggerHelper,
  ) {}
}
