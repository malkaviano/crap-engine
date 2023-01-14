import { Test, TestingModule } from '@nestjs/testing';

import { deepEqual, instance, mock, when } from 'ts-mockito';

import { InventoryService } from '@services/inventory.service';
import { INVENTORY_STORE_TOKEN, ITEM_CATALOG_STORE_TOKEN } from '@root/tokens';
import { InventoryStore } from '@infra/stores/inventory.store';
import { WeaponDefinition } from '@definitions/weapon.definition';
import { GeneratorHelper } from '@helpers/generator.helper.service';
import { ErrorCodes } from '@errors/error-code';

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
      it('throw ITEM_NOT_FOUND', async () => {
        when(mockedItemCatalogStore.getItem('WEAPON', 'itemId1')).thenResolve(
          null,
        );

        await expect(
          service.spawn('actorId1', 'WEAPON', 'itemId1'),
        ).rejects.toThrowError(ErrorCodes.ITEM_NOT_FOUND);
      });
    });

    describe('when item was duplicated', () => {
      it('throw DUPLICATED_ITEM', async () => {
        when(
          mockedItemCatalogStore.getItem<WeaponDefinition>(
            'WEAPON',
            sword.info.name,
          ),
        ).thenResolve(sword);

        when(mockedGeneratorHelper.newId()).thenReturn('sword1');

        when(mockedInventoryStore.store('WEAPON', swordEntity)).thenResolve(
          false,
        );

        await expect(
          service.spawn('actorId1', sword.category, sword.info.name),
        ).rejects.toThrowError(ErrorCodes.DUPLICATED_ITEM);
      });
    });

    describe('when item was spawned', () => {
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
        it('return id', async () => {
          when(
            mockedItemCatalogStore.getItem(item.category, item.info.name),
          ).thenResolve(item);

          when(mockedGeneratorHelper.newId()).thenReturn(entity.id);

          let stored = false;

          when(
            mockedInventoryStore.store('actorId1', deepEqual(entity)),
          ).thenResolve(true);

          const result = await service.spawn(
            'actorId1',
            item.category,
            item.info.name,
          );

          expect(result).toEqual(entity.id);
        });
      });
    });
  });

  describe('disposeItem', () => {
    [
      {
        expected: true,
      },
      {
        expected: false,
      },
    ].forEach(({ expected }) => {
      it(`return ${expected}`, async () => {
        when(mockedInventoryStore.drop('actor1', 'item1')).thenResolve(false);

        const result = await service.dispose('actor1', 'item1');

        expect(result).toEqual(false);
      });
    });
  });

  describe('removeAll', () => {
    it('should call store remove', async () => {
      let result = false;

      when(mockedInventoryStore.remove('actor1')).thenCall(
        () => (result = true),
      );

      await service.erase('actor1');

      expect(result).toEqual(true);
    });
  });

  describe('lootItem', () => {
    describe('item was not found', () => {
      it('throw ITEM_NOT_FOUND', async () => {
        when(mockedInventoryStore.look('chest1', swordEntity.id)).thenResolve(
          null,
        );

        await expect(
          service.loot('actor2', 'chest1', swordEntity.id),
        ).rejects.toThrowError(ErrorCodes.ITEM_NOT_FOUND);
      });
    });

    describe('item was already looted', () => {
      it('throw LOOTED_BY_OTHER', async () => {
        when(mockedInventoryStore.look('chest1', swordEntity.id)).thenResolve(
          swordEntity,
        );

        when(mockedInventoryStore.drop('chest1', swordEntity.id)).thenResolve(
          false,
        );

        await expect(
          service.loot('actor2', 'chest1', swordEntity.id),
        ).rejects.toThrowError(ErrorCodes.LOOTED_BY_OTHER);
      });
    });

    describe('item could not be looted', () => {
      it('throw DUPLICATED_ITEM', async () => {
        when(mockedInventoryStore.look('chest1', swordEntity.id)).thenResolve(
          swordEntity,
        );

        when(mockedInventoryStore.drop('chest1', swordEntity.id)).thenResolve(
          true,
        );

        when(
          mockedInventoryStore.store('actor2', deepEqual(swordEntity)),
        ).thenResolve(false);

        await expect(
          service.loot('actor2', 'chest1', swordEntity.id),
        ).rejects.toThrowError(ErrorCodes.DUPLICATED_ITEM);
      });
    });

    describe('item was looted', () => {
      it('return true', async () => {
        when(mockedInventoryStore.look('chest1', swordEntity.id)).thenResolve(
          swordEntity,
        );

        when(mockedInventoryStore.drop('chest1', swordEntity.id)).thenResolve(
          true,
        );

        when(
          mockedInventoryStore.store('actor2', deepEqual(swordEntity)),
        ).thenResolve(true);

        const result = await service.loot('actor2', 'chest1', swordEntity.id);

        expect(result).toEqual(swordEntity.id);
      });
    });
  });
});
