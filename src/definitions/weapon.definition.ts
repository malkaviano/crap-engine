import { ItemDefinition } from '@definitions/item.definition';
import { ItemIdentityInterface } from '@interfaces/item-identity.interface';
import { DamageInterface } from '@interfaces/damage.interface';

export class WeaponDefinition extends ItemDefinition {
  constructor(
    identity: ItemIdentityInterface,
    usability: string,
    public override readonly skillName: string,
    public readonly dodgeable: boolean,
    public readonly energyActivation: number,
    public readonly damage: DamageInterface,
  ) {
    super(identity, 'WEAPON', usability, skillName);
  }
}
