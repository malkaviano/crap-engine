import { ItemIdentityInterface } from '@interfaces/item-identity.interface';
import { ItemDefinition } from '@definitions/item.definition';
import { ReadableInterface } from '@interfaces/readable.interface';

export class ReadableDefinition extends ItemDefinition {
  constructor(
    identity: ItemIdentityInterface,
    usability: string,
    skillName: string | null,
    public readonly read: ReadableInterface,
  ) {
    super(identity, 'READABLE', usability, skillName);
  }
}
