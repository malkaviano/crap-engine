import { Module, Global } from '@nestjs/common';

import { AstraClient } from '@root/infra/clients/astra.client';
import { ITEM_CATALOG_STORE_TOKEN, INVENTORY_STORE_TOKEN } from '@root/tokens';
import { ItemCatalogStore } from '@infra/stores/catalogs/item-catalog.store';
import { InventoryStore } from '@root/infra/stores/inventory.store';
import { AmqpClient } from '@infra/clients/amqp.client';

@Global()
@Module({
  providers: [
    AstraClient,
    { provide: ITEM_CATALOG_STORE_TOKEN, useClass: ItemCatalogStore },
    { provide: INVENTORY_STORE_TOKEN, useClass: InventoryStore },
    AmqpClient,
  ],
  exports: [ITEM_CATALOG_STORE_TOKEN, INVENTORY_STORE_TOKEN],
})
export class InfraModule {}
