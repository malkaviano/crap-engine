import { ItemEntityInterface } from '@interfaces/item-entity.interface';
import { ConsumableEntity } from '@entities/consumable.entity';
import { ReadableEntity } from '@entities/readable.entity';
import { WeaponEntity } from '@entities/weapon.entity';

export interface InventoryStoreInterface {
  store(
    interactiveId: string,
    itemEntity: ItemEntityInterface,
  ): Promise<boolean>;
  look<T extends WeaponEntity | ConsumableEntity | ReadableEntity>(
    interactiveId: string,
    itemId: string,
  ): Promise<T | null>;
  drop(interactiveId: string, itemId: string): Promise<boolean>;
  remove(interactiveId: string): Promise<void>;
}
