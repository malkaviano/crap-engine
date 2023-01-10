import { IdentifiableInterface } from '@interfaces/identifiable.interface';

export interface InventoryStoreInterface {
  store(
    interactiveId: string,
    itemEntity: IdentifiableInterface,
  ): Promise<boolean>;
  look(
    interactiveId: string,
    itemId: string,
  ): Promise<IdentifiableInterface | null>;
  drop(interactiveId: string, itemId: string): Promise<boolean>;
  remove(interactiveId: string): Promise<void>;
  loot(
    actorId: string,
    interactiveId: string,
    itemId: string,
  ): Promise<boolean>;
}
