import { ItemInfoInterface } from '@interfaces/item-info.interface';

export interface ItemDefinitionInterface {
  readonly info: ItemInfoInterface;
  readonly category: string;
  readonly usability: string;
  readonly skillName: string | null;
}
