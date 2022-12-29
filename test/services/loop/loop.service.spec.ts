import { Test, TestingModule } from '@nestjs/testing';

import { instance, mock } from 'ts-mockito';

import { LoopService } from '@root/services/loop/loop.service';
import { ConfigValuesHelper } from '@root/helpers/config-values.helper';
import { EventHubService } from '@root/services/event-hub/event-hub.service';

describe('LoopService', () => {
  let service: LoopService;

  const mockedConfigValuesHelper = mock(ConfigValuesHelper);

  const mockedEventHubService = mock(EventHubService);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoopService,
        {
          provide: ConfigValuesHelper,
          useValue: instance(mockedConfigValuesHelper),
        },
        {
          provide: EventHubService,
          useValue: instance(mockedEventHubService),
        },
      ],
    }).compile();

    service = module.get<LoopService>(LoopService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
