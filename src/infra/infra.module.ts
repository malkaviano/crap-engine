import { Module, Global } from '@nestjs/common';

import { AstraClient } from '@infra/astra-client/astra.client';
import { ITEM_STORE_TOKEN } from '@root/tokens';
import { ItemCatalogStore } from './stores/catalogs/item-catalog.store';

@Global()
@Module({
  providers: [
    AstraClient,
    { provide: ITEM_STORE_TOKEN, useClass: ItemCatalogStore },
  ],
  exports: [ITEM_STORE_TOKEN],
})
export class InfraModule {}
