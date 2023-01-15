import { Observable } from 'rxjs';

import { ItemEntityInterface } from '@interfaces/item-entity.interface';
import { ConsumableEntity } from '@entities/consumable.entity';
import { ReadableEntity } from '@entities/readable.entity';
import { WeaponEntity } from '@entities/weapon.entity';

export interface InventoryStoreInterface {
  store(
    interactiveId: string,
    itemEntity: ItemEntityInterface,
  ): Observable<boolean>;
  look<T extends WeaponEntity | ConsumableEntity | ReadableEntity>(
    interactiveId: string,
    itemId: string,
  ): Observable<T | null>;
  drop(interactiveId: string, itemId: string): Observable<boolean>;
  remove(interactiveId: string): Observable<boolean>;
}
