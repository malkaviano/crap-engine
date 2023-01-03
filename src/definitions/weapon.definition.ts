import { ItemDefinition } from '@definitions/item.definition';
import { ItemInfoInterface } from '@interfaces/item-info.interface';
import { DamageInterface } from '@interfaces/damage.interface';

export class WeaponDefinition extends ItemDefinition {
  constructor(
    itemInfo: ItemInfoInterface,
    usability: string,
    public override readonly skillName: string,
    public readonly dodgeable: boolean,
    public readonly energyActivation: number,
    public readonly damage: DamageInterface,
  ) {
    super(itemInfo, 'WEAPON', usability, skillName);
  }
}
