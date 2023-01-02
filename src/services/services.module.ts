import { Module } from '@nestjs/common';

import { EventHubService } from '@services/event-hub.service';

@Module({
  providers: [EventHubService],
  exports: [EventHubService],
})
export class ServicesModule {}
