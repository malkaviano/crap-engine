import { Module, Global } from '@nestjs/common';

import { AstraClient } from '@root/infra/clients/astra.client';
import {
  ITEM_CATALOG_STORE_TOKEN,
  INVENTORY_STORE_TOKEN,
  EVENT_BROKER_TOKEN,
} from '@root/tokens';
import { ItemCatalogStore } from '@infra/stores/item-catalog.store';
import { InventoryStore } from '@infra/stores/inventory.store';
import { AmqpClient } from '@infra/clients/amqp.client';
import { EventBroker } from '@infra/brokers/event.broker';

@Global()
@Module({
  providers: [
    AstraClient,
    AmqpClient,
    { provide: ITEM_CATALOG_STORE_TOKEN, useClass: ItemCatalogStore },
    { provide: INVENTORY_STORE_TOKEN, useClass: InventoryStore },
    { provide: EVENT_BROKER_TOKEN, useClass: EventBroker },
  ],
  exports: [
    ITEM_CATALOG_STORE_TOKEN,
    INVENTORY_STORE_TOKEN,
    EVENT_BROKER_TOKEN,
  ],
})
export class InfraModule {}
