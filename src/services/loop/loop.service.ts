import { Injectable } from '@nestjs/common';

import { ConfigValuesHelper } from '@root/helpers/config-values.helper';
import { EventHubService } from '../event-hub/event-hub.service';

export type TRoundStarted = string;

@Injectable()
export class LoopService {
  constructor(
    private readonly configValuesHelper: ConfigValuesHelper,
    private readonly eventHubService: EventHubService<TRoundStarted>,
  ) {}

  public round() {
    setInterval(
      () => this.eventHubService.publishRoundStartedEvent('ok'),
      this.configValuesHelper.ENGINE_LOOP_MS,
    );
  }
}
