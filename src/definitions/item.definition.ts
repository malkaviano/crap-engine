import { ItemInfoInterface } from '@interfaces/item-info.interface';

export abstract class ItemDefinition {
  constructor(
    public readonly info: ItemInfoInterface,
    public readonly category: string,
    public readonly usability: string,
    public readonly skillName: string | null,
  ) {}
}
