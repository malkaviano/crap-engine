import { Injectable } from '@nestjs/common';

import { Observable, Subject } from 'rxjs';

@Injectable()
export class EventHubService<TRoundStarted> {
  private readonly roundStartedEvent: Subject<TRoundStarted>;

  public readonly roundStartedEvent$: Observable<TRoundStarted>;

  constructor() {
    this.roundStartedEvent = new Subject();

    this.roundStartedEvent$ = this.roundStartedEvent;
  }

  public publishRoundStartedEvent(event: TRoundStarted): void {
    this.roundStartedEvent.next(event);
  }
}
