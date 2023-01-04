import { WeaponEntity } from '@entities/weapon.entity';

export interface InventorySummaryInterface {
  readonly quantity: number;
  readonly lootToken: string | null;
  readonly equipped: WeaponEntity | null;
}
