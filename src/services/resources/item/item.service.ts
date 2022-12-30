import { Injectable, Inject } from '@nestjs/common';

import { CreateItemDto } from '@dtos/create-item.dto';
import { ItemStoreInterface } from '@interfaces/item-store.interface';
import { ItemDefinition } from '@definitions/item.definition';
import { WeaponDefinition } from '@definitions/weapon.definition';
import { CustomLoggerHelper } from '@root/helpers/custom-logger.helper.service';
import { ITEM_STORE_TOKEN } from '@root/tokens';
import { DiceSetHelper } from '@root/helpers/dice-set.helper.service';
import { ConsumableDefinition } from '@definitions/consumable.definition';
import { ApplicationError } from '@errors/application.error';

@Injectable()
export class ItemService {
  constructor(
    @Inject(ITEM_STORE_TOKEN) private readonly itemStore: ItemStoreInterface,
    private readonly customLoggerHelper: CustomLoggerHelper,
    private readonly diceSetHelper: DiceSetHelper,
  ) {
    this.customLoggerHelper.setContext(ItemService.name);
  }

  public async save(dto: CreateItemDto): Promise<void> {
    const item = this.createItem(dto);

    this.customLoggerHelper.log('Saving item', dto);

    if (!item) {
      throw new ApplicationError('Item with wrong category');
    }

    await this.itemStore.upsertItem(item);
  }

  async findOne(name: string): Promise<ItemDefinition | null> {
    const result = await this.itemStore.getItem(name);

    if (result) {
      this.customLoggerHelper.log('Item found', result);

      return result;
    }

    this.customLoggerHelper.log('Item not found', { name });

    return null;
  }

  public async remove(name: string): Promise<void> {
    this.customLoggerHelper.log('Deleting item', { name });

    await this.itemStore.removeItem(name);
  }

  private createItem(dto: CreateItemDto): ItemDefinition | null {
    if (dto.category === 'WEAPON' && dto.skillName && dto.weapon) {
      const diceSet = this.diceSetHelper.createSet(dto.weapon.damage.dice);

      return new WeaponDefinition(
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
      return new ConsumableDefinition(
        {
          name: dto.name,
          label: dto.label,
          description: dto.description,
        },
        dto.usability,
        dto.skillName,
        dto.consumable,
      );
    }

    return null;
  }
}
