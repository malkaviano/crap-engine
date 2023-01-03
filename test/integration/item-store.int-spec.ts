import { Test, TestingModule } from '@nestjs/testing';

import { ItemStoreService } from '@infra/stores/item.store';
import { HelpersModule } from '@helpers/helpers.module';
import { InfraModule } from '@infra/infra.module';
import { ITEM_STORE_TOKEN } from '@root/tokens';
import { firstAidKit, friendNote, sword } from '../fakes';

describe('ItemStoreService', () => {
  let service: ItemStoreService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HelpersModule, InfraModule],
    }).compile();

    service = await module.get(ITEM_STORE_TOKEN);
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  describe('saving item', () => {
    it('should save the item', async () => {
      await service.upsertItem(sword);

      await service.upsertItem(firstAidKit);

      await service.upsertItem(friendNote);

      let result1 = await service.getItem(sword.name);

      let result2 = await service.getItem(friendNote.name);

      let result3 = await service.getItem(firstAidKit.name);

      expect(result1).toEqual(sword);

      expect(result2).toEqual(friendNote);

      expect(result3).toEqual(firstAidKit);

      await service.removeItem(sword.name);

      await service.removeItem(friendNote.name);

      await service.removeItem(firstAidKit.name);

      result1 = await service.getItem(sword.name);

      result2 = await service.getItem(friendNote.name);

      result3 = await service.getItem(firstAidKit.name);

      expect(result1).toBeNull();

      expect(result2).toBeNull();

      expect(result3).toBeNull();
    });
  });
});
