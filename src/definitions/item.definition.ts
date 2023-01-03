import { ItemInfoInterface } from '@interfaces/item-info.interface';

export abstract class ItemDefinition {
  public readonly name: string;
  public readonly label: string;
  public readonly description: string;

  constructor(
    itemInfo: ItemInfoInterface,
    public readonly category: string,
    public readonly usability: string,
    public readonly skillName: string | null,
  ) {
    this.name = itemInfo.name;
    this.label = itemInfo.label;
    this.description = itemInfo.description;
  }
}
