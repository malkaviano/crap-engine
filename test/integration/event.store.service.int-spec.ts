import { Test, TestingModule } from '@nestjs/testing';

import { EventStore } from '@infra/stores/event.store';
import { HelpersModule } from '@helpers/helpers.module';
import { InfraModule } from '@infra/infra.module';
import { EVENT_STORE_TOKEN } from '@root/tokens';

describe('EventStoreService', () => {
  let service: EventStore;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HelpersModule, InfraModule],
    }).compile();

    service = module.get(EVENT_STORE_TOKEN);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
