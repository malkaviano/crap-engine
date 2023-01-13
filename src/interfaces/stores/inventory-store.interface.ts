import { ItemEntityInterface } from '@interfaces/identifiable.interface';

export interface InventoryStoreInterface {
  store(
    interactiveId: string,
    itemEntity: ItemEntityInterface,
  ): Promise<boolean>;
  look(
    interactiveId: string,
    itemId: string,
  ): Promise<ItemEntityInterface | null>;
  drop(interactiveId: string, itemId: string): Promise<boolean>;
  remove(interactiveId: string): Promise<void>;
}
