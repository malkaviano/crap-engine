import { ItemInfoInterface } from '@interfaces/item-info.interface';
import { DamageInterface } from '@interfaces/damage.interface';
import { ItemDefinitionInterface } from '@interfaces/item-definition.interface';

export class WeaponDefinition implements ItemDefinitionInterface {
  public readonly category: string = 'WEAPON';

  constructor(
    public readonly info: ItemInfoInterface,
    public readonly usability: string,
    public readonly skillName: string,
    public readonly dodgeable: boolean,
    public readonly energyActivation: number,
    public readonly damage: DamageInterface,
  ) {}
}
