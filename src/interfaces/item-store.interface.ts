import { ItemDefinition } from '@definitions/item.definition';

export interface ItemCatalogStoreInterface {
  getItem(category: string, name: string): Promise<ItemDefinition | null>;
  upsertItem(item: ItemDefinition): Promise<void>;
  removeItem(category: string, name: string): Promise<void>;
}
