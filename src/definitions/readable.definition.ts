import { ItemInfoInterface } from '@interfaces/item-info.interface';
import { ItemDefinitionInterface } from '@interfaces/item-definition.interface';

export class ReadableDefinition implements ItemDefinitionInterface {
  public readonly category = 'READABLE';

  constructor(
    public readonly info: ItemInfoInterface,
    public readonly usability: string,
    public readonly skillName: string | null,
    public readonly title: string,
    public readonly paragraphs: string[],
  ) {}
}
