import { ItemDefinition } from '@definitions/item.definition';

export type ItemEntityInterface = {
  readonly id: string;
} & ItemDefinition;
