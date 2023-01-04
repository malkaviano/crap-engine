import { Test, TestingModule } from '@nestjs/testing';

import { HelpersModule } from '@helpers/helpers.module';
import { InfraModule } from '@infra/infra.module';
import { ITEM_CATALOG_STORE_TOKEN } from '@root/tokens';
import { ItemCatalogStore } from '@infra/stores/catalogs/item-catalog.store';

import { firstAidKit, friendNote, sword } from '../fakes';

describe('ItemCatalogStore', () => {
  let service: ItemCatalogStore;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HelpersModule, InfraModule],
    }).compile();

    service = await module.get(ITEM_CATALOG_STORE_TOKEN);

    await service.onModuleInit();
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('should store and retrieve items', async () => {
    await service.upsertItem(sword);

    await service.upsertItem(firstAidKit);

    await service.upsertItem(friendNote);

    let result1 = await service.getItem(sword.category, sword.info.name);

    let result2 = await service.getItem(
      friendNote.category,
      friendNote.info.name,
    );

    let result3 = await service.getItem(
      firstAidKit.category,
      firstAidKit.info.name,
    );

    expect(result1).toEqual(sword);

    expect(result2).toEqual(friendNote);

    expect(result3).toEqual(firstAidKit);

    await service.removeItem(sword.category, sword.info.name);

    await service.removeItem(friendNote.category, friendNote.info.name);

    await service.removeItem(firstAidKit.category, firstAidKit.info.name);

    result1 = await service.getItem(sword.category, sword.info.name);

    result2 = await service.getItem(friendNote.category, friendNote.info.name);

    result3 = await service.getItem(
      firstAidKit.category,
      firstAidKit.info.name,
    );

    expect(result1).toBeNull();

    expect(result2).toBeNull();

    expect(result3).toBeNull();
  });
});
