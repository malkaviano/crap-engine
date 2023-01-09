import { Inject, Injectable } from '@nestjs/common';

import { INVENTORY_STORE_TOKEN, ITEM_CATALOG_STORE_TOKEN } from '@root/tokens';
import { InventoryStoreInterface } from '@interfaces/inventory-store.interface';
import { ItemCatalogStoreInterface } from '@interfaces/stores/item-catalog-store.interface';
import { GeneratorHelper } from '@helpers/generator.helper.service';
import { WeaponEntity } from '@entities/weapon.entity';
import { WeaponDefinition } from '@definitions/weapon.definition';
import { IdentifiableInterface } from '@interfaces/identifiable.interface';
import { ConsumableDefinition } from '@definitions/consumable.definition';
import { ConsumableEntity } from '@entities/consumable.entity';
import { ReadableDefinition } from '@definitions/readable.definition';
import { ReadableEntity } from '@entities/readable.entity';

@Injectable()
export class InventoryService {
  constructor(
    @Inject(INVENTORY_STORE_TOKEN)
    private readonly inventoryStore: InventoryStoreInterface,
    @Inject(ITEM_CATALOG_STORE_TOKEN)
    private readonly itemCatalogStore: ItemCatalogStoreInterface,
    private readonly generatorHelper: GeneratorHelper,
  ) {}

  public async spawnItem(
    interactiveId: string,
    itemCategory: string,
    itemName: string,
  ): Promise<string> {
    const item = await this.itemCatalogStore.getItem(itemCategory, itemName);

    if (!item) {
      throw new Error('Item not found');
    }

    const id = this.generatorHelper.newId();

    let entity: IdentifiableInterface | null = null;

    if (item instanceof WeaponDefinition) {
      entity = new WeaponEntity(
        id,
        item.info,
        item.usability,
        item.skillName,
        item.dodgeable,
        item.energyActivation,
        item.damage,
      );
    } else if (item instanceof ConsumableDefinition) {
      entity = new ConsumableEntity(
        id,
        item.info,
        item.usability,
        item.skillName,
        item.effectType,
        item.amount,
        item.energy,
      );
    } else if (item instanceof ReadableDefinition) {
      entity = new ReadableEntity(
        id,
        item.info,
        item.usability,
        item.skillName,
        item.title,
        item.paragraphs,
      );
    }

    if (!entity) {
      throw new Error('Unrecognizable item format');
    }

    await this.inventoryStore.store(interactiveId, entity);

    return id;
  }
}
