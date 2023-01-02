import { Test, TestingModule } from '@nestjs/testing';

import { instance, mock } from 'ts-mockito';

import { ItemController } from '@resources/item/item.controller';
import { ItemService } from '@resources/item/item.service';

describe('ItemController', () => {
  let controller: ItemController;

  const mockedItemService = mock(ItemService);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemController],
      providers: [
        {
          provide: ItemService,
          useValue: instance(mockedItemService),
        },
      ],
    }).compile();

    controller = module.get<ItemController>(ItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
