import { Observable } from 'rxjs';

import { EventMessage } from '@messages/event.message';
import { ResultMessage } from '@messages/result.message';

export interface RuleInterface {
  execute(message: EventMessage): Observable<ResultMessage>;
}
