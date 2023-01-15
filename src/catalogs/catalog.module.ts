import { Module } from '@nestjs/common';

import { ItemService } from '@catalogs/item/item.service';
import { ItemController } from '@catalogs/item/item.controller';

@Module({
  controllers: [ItemController],
  providers: [ItemService],
})
export class ResourcesModule {}
