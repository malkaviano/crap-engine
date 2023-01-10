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

  it('should execute inventory actions', async () => {
    await service.remove('actor1');

    await service.remove('actor2');

    let op = await service.drop('actor1', knifeEntity.id);

    expect(op).toEqual(false);

    op = await service.store('actor1', swordEntity);

    expect(op).toEqual(true);

    let item = await service.look('actor1', swordEntity.id);

    expect(item).toEqual(swordEntity);

    op = await service.store('actor1', knifeEntity);

    expect(op).toEqual(true);

    item = await service.look('actor1', knifeEntity.id);

    expect(item).toEqual(knifeEntity);

    item = await service.look('actor2', swordEntity.id);

    expect(item).toBeNull();

    op = await service.drop('actor1', knifeEntity.id);

    expect(op).toEqual(true);

    item = await service.look('actor1', knifeEntity.id);

    expect(item).toBeNull();
  });
});
