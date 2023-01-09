import { Module } from '@nestjs/common';

import { EventHubService } from '@services/event-hub.service';
import { InventoryService } from './inventory.service';

@Module({
  providers: [EventHubService, InventoryService],
  exports: [EventHubService, InventoryService],
})
export class ServicesModule {}
