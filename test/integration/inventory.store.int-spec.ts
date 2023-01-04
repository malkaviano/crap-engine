import { Test, TestingModule } from '@nestjs/testing';

import { InventoryStore } from '@root/infra/stores/inventory.store';
import { HelpersModule } from '@helpers/helpers.module';
import { InfraModule } from '@infra/infra.module';
import { INVENTORY_STORE_TOKEN } from '@root/tokens';

import { knifeEntity, swordEntity } from '../fakes';

describe('InventoryStore', () => {
  let service: InventoryStore;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HelpersModule, InfraModule],
    }).compile();

    service = module.get(INVENTORY_STORE_TOKEN);

    await service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should execute all inventory actions', async () => {
    await service.remove('actor1');

    let summary = await service.summary('actor1');

    expect(summary).toEqual({
      quantity: 0,
      lootToken: null,
      equipped: null,
    });

    await service.store('actor1', swordEntity);

    let result = await service.look('actor1', swordEntity.id);

    expect(result).toEqual(swordEntity);

    await service.store('actor1', knifeEntity);

    result = await service.look('actor1', knifeEntity.id);

    expect(result).toEqual(knifeEntity);

    await service.setLootToken('actor1', 'lootToken');

    summary = await service.summary('actor1');

    expect(summary).toEqual({
      quantity: 2,
      lootToken: 'lootToken',
      equipped: null,
    });

    await service.equip('actor1', swordEntity.id);

    result = await service.look('actor1', swordEntity.id);

    expect(result).toBeNull();

    summary = await service.summary('actor1');

    expect(summary).toEqual({
      quantity: 1,
      lootToken: 'lootToken',
      equipped: swordEntity,
    });

    await service.equip('actor1', knifeEntity.id);

    result = await service.look('actor1', swordEntity.id);

    expect(result).toEqual(swordEntity);

    summary = await service.summary('actor1');

    expect(summary).toEqual({
      quantity: 1,
      lootToken: 'lootToken',
      equipped: knifeEntity,
    });

    await service.unEquip('actor1');

    result = await service.look('actor1', knifeEntity.id);

    expect(result).toEqual(knifeEntity);

    summary = await service.summary('actor1');

    expect(summary).toEqual({
      quantity: 2,
      lootToken: 'lootToken',
      equipped: null,
    });

    await service.drop('actor1', swordEntity.id);

    result = await service.look('actor1', swordEntity.id);

    expect(result).toBeNull();
  });
});
