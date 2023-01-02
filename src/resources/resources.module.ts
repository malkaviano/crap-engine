import { Module } from '@nestjs/common';

import { ItemService } from '@resources/item/item.service';
import { ItemController } from '@resources/item/item.controller';

@Module({
  controllers: [ItemController],
  providers: [ItemService],
})
export class ResourcesModule {}
