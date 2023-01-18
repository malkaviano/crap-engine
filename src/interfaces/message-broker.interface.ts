import { Observable } from 'rxjs';

import { EventMessage } from '@messages/event.message';

export interface MessageBrokerInterface {
  readonly eventMessageConsumed$: Observable<EventMessage>;

  publish(content: Buffer): Promise<boolean>;
}
