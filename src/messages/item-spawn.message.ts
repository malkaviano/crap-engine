import { EventMessage } from '@messages/event.message';

export type ItemSpawnMessage = EventMessage & {
  readonly inventoryId: string;
  readonly itemCategory: string;
  readonly itemName: string;
};
