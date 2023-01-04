import { ItemInfoInterface } from '@interfaces/item-info.interface';
import { ItemDefinition } from '@definitions/item.definition';

export class ReadableDefinition extends ItemDefinition {
  constructor(
    itemInfo: ItemInfoInterface,
    usability: string,
    skillName: string | null,
    public readonly title: string,
    public readonly paragraphs: string[],
  ) {
    super(itemInfo, 'READABLE', usability, skillName);
  }
}
