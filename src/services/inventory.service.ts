import { Inject, Injectable } from '@nestjs/common';

import { map, mergeMap, Observable } from 'rxjs';

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
import { ErrorSignals } from '@root/signals/error-signals';
import { ItemService } from '@catalogs/item/item.service';
import { StatusSignals } from '@signals/status-signals';

@Injectable()
export class InventoryService {
  constructor(
    @Inject(INVENTORY_STORE_TOKEN)
    private readonly inventoryStore: InventoryStoreInterface,
    private readonly itemService: ItemService,
    private readonly generatorHelper: GeneratorHelper,
  ) {}

  public look<T extends WeaponEntity | ConsumableEntity | ReadableEntity>(
    interactiveId: string,
    itemId: string,
  ): Observable<T> {
    return this.inventoryStore.look<T>(interactiveId, itemId).pipe(
      map((item) => {
        if (!item) {
          throw new ApplicationError(ErrorSignals.ITEM_NOT_FOUND, 404);
        }

        return item;
      }),
    );
  }

  public drop(actorId: string, itemId: string): Observable<string> {
    return this.inventoryStore.drop(actorId, itemId).pipe(
      map((result) => {
        if (!result) {
          throw new ApplicationError(ErrorSignals.ITEM_NOT_FOUND, 404);
        }

        return StatusSignals.ITEM_LOST;
      }),
    );
  }

  public store(
    interactiveId: string,
    item: ItemEntityInterface,
  ): Observable<string> {
    return this.inventoryStore.store(interactiveId, item).pipe(
      map((item) => {
        if (!item) {
          throw new ApplicationError(ErrorSignals.DUPLICATED_ITEM, 404);
        }

        return StatusSignals.ITEM_STORED;
      }),
    );
  }

  public loot(
    looterId: string,
    containerId: string,
    itemId: string,
  ): Observable<ItemEntityInterface> {
    return this.look(containerId, itemId).pipe(
      mergeMap((entity) => {
        return this.drop(containerId, itemId).pipe(
          map((result) => {
            return { result, entity };
          }),
        );
      }),
      mergeMap(({ entity }) => {
        return this.store(looterId, entity).pipe(
          map(() => {
            return entity;
          }),
        );
      }),
    );
  }

  public spawn(
    interactiveId: string,
    itemCategory: string,
    itemName: string,
  ): Observable<string> {
    return this.itemService.findOne(itemCategory, itemName).pipe(
      map((item) => {
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
          throw new ApplicationError(
            ErrorSignals.UNRECOGNIZABLE_ITEM_FORMAT,
            400,
          );
        }

        return entity;
      }),
      mergeMap((entity) => {
        return this.inventoryStore.store(interactiveId, entity).pipe(
          map((result) => {
            return { result, entity };
          }),
        );
      }),
      map(({ result, entity }) => {
        if (!result) {
          throw new ApplicationError(ErrorSignals.DUPLICATED_ITEM, 400);
        }

        return entity.id;
      }),
    );
  }

  public erase(actorId: string): Observable<string> {
    return this.inventoryStore.remove(actorId).pipe(
      map(() => {
        return StatusSignals.INVENTORY_ERASED;
      }),
    );
  }
}
