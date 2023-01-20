import { ItemInfoInterface } from '@interfaces/item-info.interface';
import { ItemDefinitionInterface } from '@interfaces/item-definition.interface';

export class ConsumableDefinition implements ItemDefinitionInterface {
  public readonly category: string = 'CONSUMABLE';

  constructor(
    public readonly info: ItemInfoInterface,
    public readonly usability: string,
    public readonly skillName: string | null,
    public readonly effectType: string,
    public readonly amount: number,
    public readonly energy: number,
  ) {}
}
