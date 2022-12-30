import { Module } from '@nestjs/common';

import { ItemService } from '@root/services/resources/item/item.service';
import { ItemController } from '@root/services/resources/item/item.controller';

@Module({
  controllers: [ItemController],
  providers: [ItemService],
})
export class ItemModule {}
