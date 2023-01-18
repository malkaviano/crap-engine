import { EventMessage } from '@messages/event.message';

export type LootEventMessage = EventMessage & {
  readonly lootedId: string;
  readonly itemId: string;
};
