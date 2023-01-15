import { Module, Global } from '@nestjs/common';

import { AstraClient } from '@root/infra/clients/astra.client';
import {
  ITEM_CATALOG_STORE_TOKEN,
  INVENTORY_STORE_TOKEN,
  MESSAGE_BROKER_TOKEN,
} from '@root/tokens';
import { ItemCatalogStore } from '@infra/stores/item-catalog.store';
import { InventoryStore } from '@infra/stores/inventory.store';
import { AmqpClient } from '@infra/clients/amqp.client';
import { AmqpBroker } from '@infra/brokers/amqp.broker';

@Global()
@Module({
  providers: [
    AstraClient,
    AmqpClient,
    { provide: ITEM_CATALOG_STORE_TOKEN, useClass: ItemCatalogStore },
    { provide: INVENTORY_STORE_TOKEN, useClass: InventoryStore },
    { provide: MESSAGE_BROKER_TOKEN, useClass: AmqpBroker },
  ],
  exports: [
    ITEM_CATALOG_STORE_TOKEN,
    INVENTORY_STORE_TOKEN,
    MESSAGE_BROKER_TOKEN,
  ],
})
export class InfraModule {}
