import { IdentifiableInterface } from '@interfaces/identifiable.interface';
import { ItemInfoInterface } from '@interfaces/item-info.interface';
import { ReadableDefinition } from '@definitions/readable.definition';

export class ReadableEntity
  extends ReadableDefinition
  implements IdentifiableInterface
{
  constructor(
    public readonly id: string,
    itemInfo: ItemInfoInterface,
    usability: string,
    skillName: string | null,
    title: string,
    paragraphs: string[],
  ) {
    super(itemInfo, usability, skillName, title, paragraphs);
  }
}
