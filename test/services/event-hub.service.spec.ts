import { Test, TestingModule } from '@nestjs/testing';

import { EventHubService } from '@services/event-hub.service';

describe('EventHubService', () => {
  let service: EventHubService<string>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventHubService],
    }).compile();

    service = module.get<EventHubService<string>>(EventHubService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('publishRoundStartedEvent', () => {
    it('should publish the event', (done) => {
      let result: string[] = [];

      service.roundStartedEvent$.subscribe((event) => {
        result.push(event);
      });

      service.publishRoundStartedEvent('GG');

      done();

      expect(result).toEqual(['GG']);
    });
  });
});
