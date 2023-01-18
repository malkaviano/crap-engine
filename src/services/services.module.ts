import { Module } from '@nestjs/common';

import { ItemService } from '@catalogs/item/item.service';
import { InventoryService } from '@services/inventory.service';

@Module({
  providers: [ItemService, InventoryService],
  exports: [ItemService, InventoryService],
})
export class ServicesModule {}
