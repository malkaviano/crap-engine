import { ItemDefinition } from '@definitions/item.definition';

export interface ItemStoreInterface {
  getItem(name: string): Promise<ItemDefinition | null>;
  upsertItem(item: ItemDefinition): Promise<void>;
  removeItem(name: string): Promise<void>;
}
