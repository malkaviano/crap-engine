import { ConsumeInterface } from '@interfaces/consume.interface';
import { ItemIdentityInterface } from '@interfaces/item-identity.interface';
import { ItemDefinition } from '@definitions/item.definition';

export class ConsumableDefinition extends ItemDefinition {
  constructor(
    identity: ItemIdentityInterface,
    usability: string,
    skillName: string | null,
    public readonly consume: ConsumeInterface,
  ) {
    super(identity, 'CONSUMABLE', usability, skillName);
  }
}
