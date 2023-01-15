import { ItemDefinition } from '@definitions/item.definition';
import { Observable } from 'rxjs';

export interface ItemCatalogStoreInterface {
  getItem(category: string, name: string): Observable<ItemDefinition | null>;
  save(item: ItemDefinition): Observable<boolean>;
  removeItem(category: string, name: string): Observable<boolean>;
}
