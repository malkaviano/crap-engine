import { Module, Global } from '@nestjs/common';

import { AstraClient } from '@root/infra/clients/astra.client';
import {
  ITEM_CATALOG_STORE_TOKEN,
  ITEM_ENTITY_STORE_TOKEN,
} from '@root/tokens';
import { ItemCatalogStore } from '@infra/stores/catalogs/item-catalog.store';
import { ItemEntityStore } from '@infra/stores/item-entity.store';

@Global()
@Module({
  providers: [
    AstraClient,
    { provide: ITEM_CATALOG_STORE_TOKEN, useClass: ItemCatalogStore },
    { provide: ITEM_ENTITY_STORE_TOKEN, useClass: ItemEntityStore },
  ],
  exports: [ITEM_CATALOG_STORE_TOKEN, ITEM_ENTITY_STORE_TOKEN],
})
export class InfraModule {}
