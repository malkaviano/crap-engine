import { IdentifiableInterface } from '@interfaces/identifiable.interface';
import { InventorySummaryInterface } from '@interfaces/inventory-summary.interface';

export interface InventoryStoreInterface {
  setLootToken(interactiveId: string, lootToken: string): Promise<void>;
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
  remove(interactiveId: string): Promise<void>;
}
