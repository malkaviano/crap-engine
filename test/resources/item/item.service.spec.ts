import { Test, TestingModule } from '@nestjs/testing';

import { deepEqual, instance, verify, when } from 'ts-mockito';

import { ItemService } from '@resources/item/item.service';
import { ITEM_CATALOG_STORE_TOKEN } from '@root/tokens';
import { CustomLoggerHelper } from '@root/helpers/custom-logger.helper.service';
import { DiceSetHelper } from '@root/helpers/dice-set.helper.service';
import { ItemDefinition } from '@definitions/item.definition';

import {
  mockedCustomLoggerHelper,
  mockedDiceSetHelper,
  mockedItemStore,
} from '../../shared-mocks';
import { firstAidKit, friendNote, sword } from '../../fakes';

describe('ItemService', () => {
  let service: ItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemService,
        {
          provide: ITEM_CATALOG_STORE_TOKEN,
          useValue: instance(mockedItemStore),
        },
        {
          provide: CustomLoggerHelper,
          useValue: instance(mockedCustomLoggerHelper),
        },
        {
          provide: DiceSetHelper,
          useValue: instance(mockedDiceSetHelper),
        },
      ],
    }).compile();

    when(mockedDiceSetHelper.createSet(deepEqual({ D6: 1 }))).thenReturn({
      D4: 0,
      D6: 1,
      D8: 0,
      D10: 0,
      D12: 0,
      D20: 0,
      D100: 0,
    });

    service = module.get<ItemService>(ItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    describe('item was not found', () => {
      it('return null', async () => {
        when(mockedItemStore.getItem('WEAPON', 'xpto')).thenResolve(null);

        const result = await service.findOne('WEAPON', 'xpto');

        expect(result).toBeNull();
      });
    });

    describe('item was weapon', () => {
      it('return weapon', async () => {
        when(mockedItemStore.getItem('WEAPON', 'sword')).thenResolve(sword);

        const result = await service.findOne('WEAPON', 'sword');

        expect(result).toEqual(sword);
      });
    });
  });

  describe('remove', () => {
    it('should call store remove', async () => {
      await service.remove('WEAPON', 'xpto');

      verify(mockedItemStore.removeItem('WEAPON', 'xpto')).once();
    });
  });

  describe('save', () => {
    describe('when item had wrong category', () => {
      it('throw Item with wrong category', () => {
        expect(
          service.save({
            category: 'WRONG',
            name: 'firstAidKit',
            label: 'First Aid Kit',
            description: 'Use to recover HP (8) on skill check success',
            usability: 'DISPOSABLE',
            skillName: 'First Aid',
            consumable: {
              effectType: 'REMEDY',
              amount: 8,
              energy: 0,
            },
          }),
        ).rejects.toThrowError('Item with wrong category');
      });
    });

    [
      {
        item: {
          category: 'CONSUMABLE',
          name: 'firstAidKit',
          label: 'First Aid Kit',
          description: 'Use to recover HP (8) on skill check success',
          usability: 'DISPOSABLE',
          skillName: 'First Aid',
          consumable: {
            effectType: 'REMEDY',
            amount: 8,
            energy: 0,
          },
        },
        expected: firstAidKit,
      },
      {
        item: {
          category: 'WEAPON',
          name: 'sword',
          label: 'Sword',
          description: 'Some Sword',
          usability: 'PERMANENT',
          skillName: 'Melee Weapon (Simple)',
          weapon: {
            dodgeable: true,
            energyActivation: 0,
            damage: {
              effectType: 'KINETIC',
              fixed: 0,
              dice: {
                D6: 1,
              },
            },
          },
        },
        expected: sword,
      },
      {
        item: {
          category: 'READABLE',
          name: 'friendNote',
          label: "Friend's Note",
          description: 'Small Handwritten Note',
          usability: 'PERMANENT',
          readable: {
            title: 'LATE!!!',
            paragraphs: ['GG', 'GG2', 'GG3'],
          },
        },
        expected: friendNote,
      },
    ].forEach(({ item, expected }) => {
      describe(`when saving ${item.category}`, () => {
        it('should call store upsert', async () => {
          await service.save(item);

          verify(
            mockedItemStore.upsertItem(deepEqual(expected as ItemDefinition)),
          ).once();
        });
      });
    });
  });
});
