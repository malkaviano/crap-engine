import { ConsumableDefinition } from '@definitions/consumable.definition';
import { ItemEntityInterface } from '@interfaces/item-entity.interface';
import { ItemInfoInterface } from '@interfaces/item-info.interface';

export class ConsumableEntity
  extends ConsumableDefinition
  implements ItemEntityInterface
{
  constructor(
    public readonly id: string,
    itemInfo: ItemInfoInterface,
    usability: string,
    skillName: string | null,
    effectType: string,
    amount: number,
    energy: number,
  ) {
    super(itemInfo, usability, skillName, effectType, amount, energy);
  }
}
