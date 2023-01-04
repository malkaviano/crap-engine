import { WeaponEntity } from '@entities/weapon.entity';

export interface InventorySummaryInterface {
  readonly quantity: number;
  readonly max: number;
  readonly equipped: WeaponEntity | null;
  readonly unlocked: boolean;
}
