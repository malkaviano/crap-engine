import { Observable } from 'rxjs';
import { ItemDefinitionInterface } from '@interfaces/item-definition.interface';

export interface ItemCatalogStoreInterface {
  getItem(
    category: string,
    name: string,
  ): Observable<ItemDefinitionInterface | null>;
  save(item: ItemDefinitionInterface): Observable<boolean>;
  removeItem(category: string, name: string): Observable<boolean>;
}
