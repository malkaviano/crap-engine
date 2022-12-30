import { DamageInterface } from '@interfaces/damage.interface';

export interface WeaponInterface {
  readonly damage: DamageInterface;
  readonly dodgeable: boolean;
  readonly energyActivation: number;
}
