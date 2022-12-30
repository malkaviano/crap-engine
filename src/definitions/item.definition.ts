import { ItemIdentityInterface } from '@interfaces/item-identity.interface';

export abstract class ItemDefinition {
  public readonly name: string;
  public readonly label: string;
  public readonly description: string;

  constructor(
    identity: ItemIdentityInterface,
    public readonly category: string,
    public readonly usability: string,
    public readonly skillName: string | null,
  ) {
    this.name = identity.name;
    this.label = identity.label;
    this.description = identity.description;
  }
}
