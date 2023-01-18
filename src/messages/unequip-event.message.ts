import { EventMessage } from '@messages/event.message';

export type UnEquipEventMessage = EventMessage & {
  readonly itemId: string;
};
