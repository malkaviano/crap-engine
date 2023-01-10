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

    await service.store('actor1', swordEntity);

    let result = await service.look('actor1', swordEntity.id);

    expect(result).toEqual(swordEntity);

    await service.store('actor1', knifeEntity);

    result = await service.look('actor1', knifeEntity.id);

    expect(result).toEqual(knifeEntity);

    result = await service.look('actor1', swordEntity.id);

    expect(result).toEqual(swordEntity);

    result = await service.look('actor1', knifeEntity.id);

    expect(result).toEqual(knifeEntity);

    await service.drop('actor1', swordEntity.id);

    result = await service.look('actor1', swordEntity.id);

    expect(result).toBeNull();
  });
});
