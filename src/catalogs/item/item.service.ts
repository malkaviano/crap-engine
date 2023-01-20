import { Injectable, Inject } from '@nestjs/common';

import { map, mergeMap, Observable, of } from 'rxjs';

import { CreateItemDto } from '@dtos/create-item.dto';
import { ItemCatalogStoreInterface } from '@interfaces/stores/item-catalog-store.interface';
import { WeaponDefinition } from '@definitions/weapon.definition';
import { CustomLoggerHelper } from '@helpers/custom-logger.helper.service';
import { ITEM_CATALOG_STORE_TOKEN } from '@root/tokens';
import { DiceSetHelper } from '@helpers/dice-set.helper.service';
import { ConsumableDefinition } from '@definitions/consumable.definition';
import { ApplicationError } from '@errors/application.error';
import { ReadableDefinition } from '@definitions/readable.definition';
import { ErrorSignals } from '@signals/error-signals';
import { StatusSignals } from '@signals/status-signals';
import { ItemDefinitionInterface } from '@interfaces/item-definition.interface';

@Injectable()
export class ItemService {
  constructor(
    @Inject(ITEM_CATALOG_STORE_TOKEN)
    private readonly itemCatalogStore: ItemCatalogStoreInterface,
    private readonly customLoggerHelper: CustomLoggerHelper,
    private readonly diceSetHelper: DiceSetHelper,
  ) {}

  public create(dto: CreateItemDto): Observable<string> {
    this.customLoggerHelper.log('Creating item', dto);

    const item = of(this.createItem(dto)).pipe(
      map((item) => {
        if (!item) {
          throw new ApplicationError(ErrorSignals.ITEM_WRONG_CATEGORY, 400);
        }

        return item;
      }),
      mergeMap((item) => {
        return this.itemCatalogStore.save(item);
      }),
      map((result) => {
        if (!result) {
          throw new ApplicationError(ErrorSignals.DUPLICATED_ITEM, 400);
        }

        this.customLoggerHelper.log('Created item', dto);

        return StatusSignals.ITEM_CREATED;
      }),
    );

    return item;
  }

  public findOne(
    category: string,
    name: string,
  ): Observable<ItemDefinitionInterface> {
    this.customLoggerHelper.log('Find one', { category, name });

    return this.itemCatalogStore.getItem(category, name).pipe(
      map((item) => {
        if (!item) {
          throw new ApplicationError(ErrorSignals.ITEM_NOT_FOUND, 404);
        }

        return item;
      }),
    );
  }

  public remove(category: string, name: string): Observable<string> {
    this.customLoggerHelper.log('Deleting item', { category, name });

    const msg = this.itemCatalogStore.removeItem(category, name).pipe(
      map((result) => {
        if (!result) {
          throw new ApplicationError(ErrorSignals.ITEM_NOT_FOUND, 404);
        }

        this.customLoggerHelper.log('Deleted item', { category, name });

        return StatusSignals.ITEM_DELETED;
      }),
    );

    return msg;
  }

  private createItem(dto: CreateItemDto): ItemDefinitionInterface | null {
    let item: ItemDefinitionInterface | null = null;

    if (dto.category === 'WEAPON' && dto.skillName && dto.weapon) {
      const diceSet = this.diceSetHelper.createSet(dto.weapon.damage.dice);

      item = new WeaponDefinition(
        {
          name: dto.name,
          label: dto.label,
          description: dto.description,
        },
        dto.usability,
        dto.skillName,
        dto.weapon.dodgeable,
        dto.weapon.energyActivation,
        {
          diceSet,
          fixed: dto.weapon.damage.fixed,
          effectType: dto.weapon.damage.effectType,
        },
      );
    } else if (dto.category === 'CONSUMABLE' && dto.consumable) {
      item = new ConsumableDefinition(
        {
          name: dto.name,
          label: dto.label,
          description: dto.description,
        },
        dto.usability,
        dto.skillName ?? null,
        dto.consumable.effectType,
        dto.consumable.amount,
        dto.consumable.energy,
      );
    } else if (dto.category === 'READABLE' && dto.readable) {
      item = new ReadableDefinition(
        {
          name: dto.name,
          label: dto.label,
          description: dto.description,
        },
        dto.usability,
        dto.skillName ?? null,
        dto.readable.title,
        dto.readable.paragraphs,
      );
    }

    return item;
  }
}
