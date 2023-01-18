import { Test, TestingModule } from '@nestjs/testing';

import { deepEqual, instance, when } from 'ts-mockito';
import { of } from 'rxjs';

import { ItemService } from '@catalogs/item/item.service';
import { ITEM_CATALOG_STORE_TOKEN } from '@root/tokens';
import { CustomLoggerHelper } from '@root/helpers/custom-logger.helper.service';
import { DiceSetHelper } from '@root/helpers/dice-set.helper.service';
import { StatusSignals } from '@signals/status-signals';
import { ErrorSignals } from '@signals/error-signals';
import { ApplicationError } from '@errors/application.error';

import {
  mockedCustomLoggerHelper,
  mockedDiceSetHelper,
  mockedItemCatalogStore,
} from '../shared-mocks';
import { firstAidKit, friendNote, sword } from '../fakes';

describe('ItemService', () => {
  let service: ItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemService,
        {
          provide: ITEM_CATALOG_STORE_TOKEN,
          useValue: instance(mockedItemCatalogStore),
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
      it('throw ITEM_NOT_FOUND', (done) => {
        when(mockedItemCatalogStore.getItem('WEAPON', 'xpto')).thenReturn(
          of(null),
        );

        service.findOne('WEAPON', 'xpto').subscribe({
          error: (result) => {
            done();

            expect(result).toEqual(
              new ApplicationError(ErrorSignals.ITEM_NOT_FOUND, 404),
            );
          },
        });
      });
    });

    describe('item was weapon', () => {
      it('return weapon', (done) => {
        when(mockedItemCatalogStore.getItem('WEAPON', 'sword')).thenReturn(
          of(sword),
        );

        service.findOne('WEAPON', 'sword').subscribe((result) => {
          done();

          expect(result).toEqual(sword);
        });
      });
    });
  });

  describe('remove', () => {
    describe('when item was found', () => {
      it('return ITEM_DELETED', (done) => {
        when(mockedItemCatalogStore.removeItem('WEAPON', 'xpto')).thenReturn(
          of(true),
        );

        service.remove('WEAPON', 'xpto').subscribe((result) => {
          done();

          expect(result).toEqual(StatusSignals.ITEM_DELETED);
        });
      });
    });

    describe('when item was not found', () => {
      it('throw ITEM_NOT_FOUND', (done) => {
        when(mockedItemCatalogStore.removeItem('WEAPON', 'xpto')).thenReturn(
          of(false),
        );

        service.remove('WEAPON', 'xpto').subscribe({
          error: (result) => {
            done();

            expect(result).toEqual(
              new ApplicationError(ErrorSignals.ITEM_NOT_FOUND, 404),
            );
          },
        });
      });
    });
  });

  describe('create', () => {
    describe('when item had wrong category', () => {
      it('throw ITEM_WRONG_CATEGORY', (done) => {
        service
          .create({
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
          })
          .subscribe({
            error: (result) => {
              done();

              expect(result).toEqual(
                new ApplicationError(ErrorSignals.ITEM_WRONG_CATEGORY, 400),
              );
            },
          });
      });
    });

    describe('when item exists', () => {
      it('throw DUPLICATED_ITEM', (done) => {
        const item = {
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
        };

        when(mockedItemCatalogStore.save(deepEqual(firstAidKit))).thenReturn(
          of(false),
        );

        service.create(item).subscribe({
          error: (result) => {
            done();

            expect(result).toEqual(
              new ApplicationError(ErrorSignals.DUPLICATED_ITEM, 400),
            );
          },
        });
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
      describe(`when creating ${item.category}`, () => {
        it('return ITEM_CREATED', (done) => {
          when(mockedItemCatalogStore.save(deepEqual(expected))).thenReturn(
            of(true),
          );

          service.create(item).subscribe((result) => {
            done();

            expect(result).toEqual(StatusSignals.ITEM_CREATED);
          });
        });
      });
    });
  });
});
