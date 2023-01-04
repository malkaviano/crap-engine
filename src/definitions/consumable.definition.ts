import { ItemInfoInterface } from '@interfaces/item-info.interface';
import { ItemDefinition } from '@definitions/item.definition';

export class ConsumableDefinition extends ItemDefinition {
  constructor(
    itemInfo: ItemInfoInterface,
    usability: string,
    skillName: string | null,
    public readonly effectType: string,
    public readonly amount: number,
    public readonly energy: number,
  ) {
    super(itemInfo, 'CONSUMABLE', usability, skillName);
  }
}
