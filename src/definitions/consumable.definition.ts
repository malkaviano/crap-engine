import { ConsumeInterface } from '@interfaces/consume.interface';
import { ItemInfoInterface } from '@interfaces/item-info.interface';
import { ItemDefinition } from '@definitions/item.definition';

export class ConsumableDefinition extends ItemDefinition {
  constructor(
    itemInfo: ItemInfoInterface,
    usability: string,
    skillName: string | null,
    public readonly consume: ConsumeInterface,
  ) {
    super(itemInfo, 'CONSUMABLE', usability, skillName);
  }
}
