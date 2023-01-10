import { IdentifiableInterface } from '@interfaces/identifiable.interface';

export interface InventoryStoreInterface {
  store(
    interactiveId: string,
    itemEntity: IdentifiableInterface,
  ): Promise<void>;
  look(
    interactiveId: string,
    itemId: string,
  ): Promise<IdentifiableInterface | null>;
  drop(interactiveId: string, itemId: string): Promise<void>;
  remove(interactiveId: string): Promise<void>;
}
