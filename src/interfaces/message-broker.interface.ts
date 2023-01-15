import { Observable } from 'rxjs';

import { EventMessage } from '@messages/event.message';

export interface MessageBrokerInterface {
  eventMessageReceived$: Observable<EventMessage>;
  publish(content: Buffer): Promise<boolean>;
}
