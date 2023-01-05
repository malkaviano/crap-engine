import { Test, TestingModule } from '@nestjs/testing';

import { EventBroker } from '@infra/brokers/event.broker';
import { HelpersModule } from '@helpers/helpers.module';
import { InfraModule } from '@infra/infra.module';
import { EVENT_BROKER_TOKEN } from '@root/tokens';
import { AmqpClient } from '@infra/clients/amqp.client';

describe('EventsBroker', () => {
  let service: EventBroker;

  const expected = {
    currentSceneId: 'scene1',
    event: 'PICK',
    actorId: 'actor1',
    targetId: 'chest1',
    itemId: 'sword1',
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HelpersModule, InfraModule],
    }).compile();

    service = module.get(EVENT_BROKER_TOKEN);

    await service.onModuleInit();

    await service.consume();

    await service.produce(Buffer.from(JSON.stringify(expected)));
  });

  afterAll(async () => {
    await service.onModuleDestroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should consume event messages', (done) => {
    service.eventMessageReceived$.subscribe((event) => {
      done();
      expect(event).toEqual(expected);
    });
  });
});
