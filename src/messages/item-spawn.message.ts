import { EventMessage } from '@messages/event.message';

export type ItemSpawnMessage = EventMessage & {
  readonly inventoryId: string;
  readonly itemCategory: string;
  readonly itemName: string;
};

const m: ItemSpawnMessage = {
  event: 'INVENTORY',
  action: 'SPAWN',
  inventoryId: 'interactiveId1',
  itemCategory: 'WEAPON',
  itemName: 'huntingKnife',
};
