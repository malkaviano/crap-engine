import { ItemDefinitionInterface } from '@interfaces/item-definition.interface';

export interface ItemEntityInterface extends ItemDefinitionInterface {
  readonly id: string;
}
