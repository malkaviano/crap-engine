import { IdentifiableInterface } from '@interfaces/identifiable.interface';
import { InventorySummaryInterface } from '@interfaces/inventory-summary.interface';
import { WeaponEntity } from '@entities/weapon.entity';

export interface ItemEntityStoreInterface {
  install(
    interactiveId: string,
    unlocked: boolean,
    max: number,
    equipped: WeaponEntity | null,
  ): Promise<void>;
  store(
    interactiveId: string,
    itemEntity: IdentifiableInterface,
  ): Promise<void>;
  look(
    interactiveId: string,
    itemId: string,
  ): Promise<IdentifiableInterface | null>;
  drop(interactiveId: string, itemId: string): Promise<void>;
  equip(actorId: string, weaponId: string): Promise<void>;
  unEquip(actorId: string): Promise<void>;
  summary(actorId: string): Promise<InventorySummaryInterface>;
  uninstall(interactiveId: string): Promise<void>;
}
