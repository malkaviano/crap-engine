import { ItemInfoInterface } from '@interfaces/item-info.interface';
import { ItemDefinition } from '@definitions/item.definition';
import { ReadableInterface } from '@interfaces/readable.interface';

export class ReadableDefinition extends ItemDefinition {
  constructor(
    itemInfo: ItemInfoInterface,
    usability: string,
    skillName: string | null,
    public readonly read: ReadableInterface,
  ) {
    super(itemInfo, 'READABLE', usability, skillName);
  }
}
