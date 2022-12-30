import { Module } from '@nestjs/common';

import { ItemStoreService } from '@infra/stores/item/item-store.service';
import { AstraClient } from '@infra/astra-client/astra-client';
import { ITEM_STORE_TOKEN } from '@root/tokens';

@Module({
  providers: [
    AstraClient,
    { provide: ITEM_STORE_TOKEN, useClass: ItemStoreService },
  ],
  exports: [ITEM_STORE_TOKEN],
})
export class ItemStoreModule {}
