import { Test, TestingModule } from '@nestjs/testing';

import { deepEqual, instance, mock, when } from 'ts-mockito';

import { InventoryService } from '@services/inventory.service';
import { INVENTORY_STORE_TOKEN, ITEM_CATALOG_STORE_TOKEN } from '@root/tokens';
import { InventoryStore } from '@infra/stores/inventory.store';
import { WeaponDefinition } from '@definitions/weapon.definition';
import { GeneratorHelper } from '@helpers/generator.helper.service';

import {
  firstAidKit,
  firstAidKitEntity,
  friendNote,
  friendNoteEntity,
  sword,
  swordEntity,
} from '../fakes';
import { mockedGeneratorHelper, mockedItemCatalogStore } from '../shared-mocks';

describe('InventoryService', () => {
  let service: InventoryService;

  const mockedInventoryStore = mock(InventoryStore);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: INVENTORY_STORE_TOKEN,
          useValue: instance(mockedInventoryStore),
        },
        {
          provide: ITEM_CATALOG_STORE_TOKEN,
          useValue: instance(mockedItemCatalogStore),
        },
        {
          provide: GeneratorHelper,
          useValue: instance(mockedGeneratorHelper),
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('spawnItem', () => {
    describe('when item did not exist in catalog', () => {
      it('throw error', async () => {
        when(mockedItemCatalogStore.getItem('WEAPON', 'itemId1')).thenResolve(
          null,
        );

        await expect(
          service.spawnItem('actorId1', 'WEAPON', 'itemId1'),
        ).rejects.toThrowError('Item not found');
      });
    });

    describe('when item was spawned', () => {
      it('return item entity id', async () => {
        when(
          mockedItemCatalogStore.getItem<WeaponDefinition>(
            'WEAPON',
            sword.info.name,
          ),
        ).thenResolve(sword);

        when(mockedGeneratorHelper.newId()).thenReturn('sword1');

        const result = await service.spawnItem(
          'actorId1',
          sword.category,
          sword.info.name,
        );

        expect(result).toEqual('sword1');
      });

      [
        {
          item: sword,
          entity: swordEntity,
        },
        {
          item: firstAidKit,
          entity: firstAidKitEntity,
        },
        {
          item: friendNote,
          entity: friendNoteEntity,
        },
      ].forEach(({ item, entity }) => {
        it('should store item', async () => {
          when(
            mockedItemCatalogStore.getItem(item.category, item.info.name),
          ).thenResolve(item);

          when(mockedGeneratorHelper.newId()).thenReturn(entity.id);

          let stored = false;

          when(
            mockedInventoryStore.store('actorId1', deepEqual(entity)),
          ).thenCall(() => (stored = true));

          await service.spawnItem('actorId1', item.category, item.info.name);

          expect(stored).toEqual(true);
        });
      });
    });
  });
});
