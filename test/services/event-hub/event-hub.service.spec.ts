import { Test, TestingModule } from '@nestjs/testing';

import { EventHubService } from '@root/services/event-hub/event-hub.service';
import { TRoundStarted } from '@root/services/loop/loop.service';

describe('EventHubService', () => {
  let service: EventHubService<TRoundStarted>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventHubService],
    }).compile();

    service = module.get<EventHubService<TRoundStarted>>(EventHubService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('publishRoundStartedEvent', () => {
    it('should publish the event', (done) => {
      let result: TRoundStarted[] = [];

      service.roundStartedEvent$.subscribe((event) => {
        result.push(event);
      });

      service.publishRoundStartedEvent('GG');

      done();

      expect(result).toEqual(['GG']);
    });
  });
});
