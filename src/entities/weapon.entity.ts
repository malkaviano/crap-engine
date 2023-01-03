import { WeaponDefinition } from '@definitions/weapon.definition';
import { DamageInterface } from '@interfaces/damage.interface';
import { ItemInfoInterface } from '@interfaces/item-info.interface';

export class WeaponEntity extends WeaponDefinition {
  private constructor(
    private readonly id: string,
    info: ItemInfoInterface,
    usability: string,
    skillName: string,
    dodgeable: boolean,
    energyActivation: number,
    damage: DamageInterface,
  ) {
    super(info, usability, skillName, dodgeable, energyActivation, damage);
  }

  public static create(
    id: string,
    info: ItemInfoInterface,
    usability: string,
    skillName: string,
    dodgeable: boolean,
    energyActivation: number,
    damage: DamageInterface,
  ): WeaponEntity {
    return new WeaponEntity(
      id,
      info,
      usability,
      skillName,
      dodgeable,
      energyActivation,
      damage,
    );
  }
}
