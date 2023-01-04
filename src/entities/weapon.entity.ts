import { WeaponDefinition } from '@definitions/weapon.definition';
import { DamageInterface } from '@interfaces/damage.interface';
import { ItemInfoInterface } from '@interfaces/item-info.interface';
import { IdentifiableInterface } from '@interfaces/identifiable.interface';

export class WeaponEntity
  extends WeaponDefinition
  implements IdentifiableInterface
{
  constructor(
    public readonly id: string,
    info: ItemInfoInterface,
    usability: string,
    skillName: string,
    dodgeable: boolean,
    energyActivation: number,
    damage: DamageInterface,
  ) {
    super(info, usability, skillName, dodgeable, energyActivation, damage);
  }
}
