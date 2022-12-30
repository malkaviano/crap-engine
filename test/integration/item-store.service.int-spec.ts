import { Test, TestingModule } from '@nestjs/testing';

import { ItemStoreService } from '@infra/stores/item/item-store.service';
import { AstraClient } from '@infra/astra-client/astra-client';
import { HelpersModule } from '@helpers/helpers.module';

describe('ItemStoreService', () => {
  let service: ItemStoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HelpersModule],
      providers: [ItemStoreService, AstraClient],
    }).compile();

    service = module.get<ItemStoreService>(ItemStoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
