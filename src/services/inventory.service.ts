import { Inject, Injectable } from '@nestjs/common';

import { INVENTORY_STORE_TOKEN } from '@root/tokens';
import { InventoryStoreInterface } from '@interfaces/stores/inventory-store.interface';
import { GeneratorHelper } from '@helpers/generator.helper.service';
import { WeaponEntity } from '@entities/weapon.entity';
import { WeaponDefinition } from '@definitions/weapon.definition';
import { ConsumableDefinition } from '@definitions/consumable.definition';
import { ConsumableEntity } from '@entities/consumable.entity';
import { ReadableDefinition } from '@definitions/readable.definition';
import { ReadableEntity } from '@entities/readable.entity';
import { ItemEntityInterface } from '@interfaces/item-entity.interface';
import { ApplicationError } from '@errors/application.error';
import { ErrorCodes } from '@errors/error-code';
import { ItemService } from '@catalogs/item/item.service';

@Injectable()
export class InventoryService {
  constructor(
    @Inject(INVENTORY_STORE_TOKEN)
    private readonly inventoryStore: InventoryStoreInterface,
    private readonly itemService: ItemService,
    private readonly generatorHelper: GeneratorHelper,
  ) {}

  public async look<T extends WeaponEntity | ConsumableEntity | ReadableEntity>(
    interactiveId: string,
    itemId: string,
  ): Promise<T | null> {
    return this.inventoryStore.look<T>(interactiveId, itemId);
  }

  public async dispose(actorId: string, itemId: string): Promise<boolean> {
    return this.inventoryStore.drop(actorId, itemId);
  }

  public async loot(
    looterId: string,
    containerId: string,
    itemId: string,
  ): Promise<string> {
    const item = await this.inventoryStore.look(containerId, itemId);

    if (!item) {
      throw new ApplicationError(ErrorCodes.ITEM_NOT_FOUND);
    }

    let result = await this.inventoryStore.drop(containerId, itemId);

    if (!result) {
      throw new ApplicationError(ErrorCodes.LOOTED_BY_OTHER);
    }

    result = await this.inventoryStore.store(looterId, item);

    if (!result) {
      throw new ApplicationError(ErrorCodes.DUPLICATED_ITEM);
    }

    return item.id;
  }

  public async spawn(
    interactiveId: string,
    itemCategory: string,
    itemName: string,
  ): Promise<string> {
    const item = await this.itemService.findOne(itemCategory, itemName);

    if (!item) {
      throw new ApplicationError(ErrorCodes.ITEM_NOT_FOUND);
    }

    const id = this.generatorHelper.newId();

    let entity: ItemEntityInterface | null = null;

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
      throw new ApplicationError(ErrorCodes.UNRECOGNIZABLE_ITEM_FORMAT);
    }

    const r = await this.inventoryStore.store(interactiveId, entity);

    if (!r) {
      throw new ApplicationError(ErrorCodes.DUPLICATED_ITEM);
    }

    return entity.id;
  }

  public async erase(actorId: string): Promise<void> {
    return this.inventoryStore.remove(actorId);
  }
}
