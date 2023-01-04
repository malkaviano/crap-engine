import { Module, Global } from '@nestjs/common';

import { AstraClient } from '@root/infra/clients/astra.client';
import {
  ITEM_CATALOG_STORE_TOKEN,
  INVENTORY_STORE_TOKEN,
  EVENT_STORE_TOKEN,
} from '@root/tokens';
import { ItemCatalogStore } from '@infra/stores/catalogs/item-catalog.store';
import { InventoryStore } from '@root/infra/stores/inventory.store';
import { AmqpClient } from '@infra/clients/amqp.client';
import { EventStore } from '@infra/stores/event.store';

@Global()
@Module({
  providers: [
    AstraClient,
    { provide: ITEM_CATALOG_STORE_TOKEN, useClass: ItemCatalogStore },
    { provide: INVENTORY_STORE_TOKEN, useClass: InventoryStore },
    AmqpClient,
    { provide: EVENT_STORE_TOKEN, useClass: EventStore },
  ],
  exports: [ITEM_CATALOG_STORE_TOKEN, INVENTORY_STORE_TOKEN, EVENT_STORE_TOKEN],
})
export class InfraModule {}
