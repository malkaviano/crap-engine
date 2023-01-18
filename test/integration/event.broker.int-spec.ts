import { Test, TestingModule } from '@nestjs/testing';

import { AmqpBroker } from '@root/infra/brokers/amqp.broker';
import { HelpersModule } from '@helpers/helpers.module';
import { InfraModule } from '@infra/infra.module';
import { MESSAGE_BROKER_TOKEN } from '@root/tokens';
import { AmqpClient } from '@infra/clients/amqp.client';

describe('EventsBroker', () => {
  let service: AmqpBroker;

  let client: AmqpClient;

  const expected = {
    category: 'INVENTORY',
    action: 'UNEQUIP',
    actorId: 'actor1',
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HelpersModule, InfraModule],
    }).compile();

    service = module.get(MESSAGE_BROKER_TOKEN);

    client = module.get(AmqpClient);

    await service.onModuleInit();

    await service.publish(
      Buffer.from(
        JSON.stringify({
          category: 'INVENTORY',
          action: 'UNEQUIP',
          actorId: 'actor1',
        }),
      ),
    );
  });

  afterAll(async () => {
    await client.onModuleDestroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should consume event messages', (done) => {
    service.eventMessageConsumed$.subscribe((event) => {
      done();

      expect(event).toEqual(expected);
    });
  });
});
