import { Test, TestingModule } from '@nestjs/testing';

import { deepEqual, instance, mock, when } from 'ts-mockito';
import { of, throwError } from 'rxjs';

import { InventoryService } from '@services/inventory.service';
import { INVENTORY_STORE_TOKEN } from '@root/tokens';
import { InventoryStore } from '@infra/stores/inventory.store';
import { GeneratorHelper } from '@helpers/generator.helper.service';
import { ErrorSignals } from '@root/signals/error-signals';
import { ItemService } from '@catalogs/item/item.service';
import { ApplicationError } from '@errors/application.error';
import { StatusSignals } from '@signals/status-signals';

import {
  firstAidKit,
  firstAidKitEntity,
  friendNote,
  friendNoteEntity,
  sword,
  swordEntity,
} from '../fakes';
import { mockedGeneratorHelper, resetMocked } from '../shared-mocks';

describe('InventoryService', () => {
  let service: InventoryService;

  const mockedInventoryStore = mock(InventoryStore);
  const mockedItemService = mock(ItemService);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: INVENTORY_STORE_TOKEN,
          useValue: instance(mockedInventoryStore),
        },
        {
          provide: ItemService,
          useValue: instance(mockedItemService),
        },
        {
          provide: GeneratorHelper,
          useValue: instance(mockedGeneratorHelper),
        },
      ],
    }).compile();

    resetMocked();

    service = module.get<InventoryService>(InventoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('spawnItem', () => {
    describe('when item did not exist in catalog', () => {
      it('throw ITEM_NOT_FOUND', (done) => {
        when(
          mockedItemService.findOne(sword.category, sword.info.name),
        ).thenReturn(
          throwError(
            () => new ApplicationError(ErrorSignals.ITEM_NOT_FOUND, 404),
          ),
        );

        service.spawn('actorId1', sword.category, sword.info.name).subscribe({
          next: () => {
            done('fail');
          },
          error: (result) => {
            done();

            expect(result).toEqual(
              new ApplicationError(ErrorSignals.ITEM_NOT_FOUND, 404),
            );
          },
        });
      });
    });

    describe('when item was duplicated', () => {
      it('throw DUPLICATED_ITEM', (done) => {
        when(
          mockedItemService.findOne(sword.category, sword.info.name),
        ).thenReturn(of(sword));

        when(mockedGeneratorHelper.newId()).thenReturn('sword1');

        when(
          mockedInventoryStore.store('actorId1', deepEqual(swordEntity)),
        ).thenReturn(of(false));

        service.spawn('actorId1', sword.category, sword.info.name).subscribe({
          next: () => {
            done('fail');
          },
          error: (result) => {
            done();

            expect(result).toEqual(
              new ApplicationError(ErrorSignals.DUPLICATED_ITEM, 400),
            );
          },
        });
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
        it('return id', (done) => {
          when(
            mockedItemService.findOne(item.category, item.info.name),
          ).thenReturn(of(item));

          when(mockedGeneratorHelper.newId()).thenReturn(entity.id);

          when(
            mockedInventoryStore.store('actorId1', deepEqual(entity)),
          ).thenReturn(of(true));

          service.spawn('actorId1', item.category, item.info.name).subscribe({
            next: (result) => {
              done();

              expect(result).toEqual(entity.id);
            },
            error: () => {
              done('fail');
            },
          });
        });
      });
    });
  });

  describe('disposeItem', () => {
    describe(`when item was disposed`, () => {
      it(`return ITEM_LOST`, (done) => {
        when(mockedInventoryStore.drop('actor1', 'item1')).thenReturn(of(true));

        service.drop('actor1', 'item1').subscribe({
          next: (result) => {
            done();

            expect(result).toEqual(StatusSignals.ITEM_LOST);
          },
          error: () => {
            done('fail');
          },
        });
      });
    });

    describe(`when item was not found`, () => {
      it(`throw ITEM_NOT_FOUND`, (done) => {
        when(mockedInventoryStore.drop('actor1', 'item1')).thenReturn(
          of(false),
        );

        service.drop('actor1', 'item1').subscribe({
          next: () => {
            done('fail');
          },
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

  describe('look', () => {
    describe('when item was not found', () => {
      it('throw ITEM_NOT_FOUND', (done) => {
        when(mockedInventoryStore.look('actor1', 'sword1')).thenReturn(
          of(null),
        );

        service.look('actor1', 'sword1').subscribe({
          next: () => {
            done('fail');
          },
          error: (result) => {
            done();

            expect(result).toEqual(
              new ApplicationError(ErrorSignals.ITEM_NOT_FOUND, 404),
            );
          },
        });
      });
    });

    describe('when item was found', () => {
      it('return item', (done) => {
        when(mockedInventoryStore.look('actor1', swordEntity.id)).thenReturn(
          of(swordEntity),
        );

        service.look('actor1', swordEntity.id).subscribe({
          next: (result) => {
            done();

            expect(result).toEqual(swordEntity);
          },
          error: () => {
            done('fail');
          },
        });
      });
    });
  });

  describe('lootItem', () => {
    describe('item was not found', () => {
      it('throw ITEM_NOT_FOUND', (done) => {
        when(mockedInventoryStore.look('chest1', swordEntity.id)).thenReturn(
          of(null),
        );

        service.loot('actor2', 'chest1', swordEntity.id).subscribe({
          next: () => {
            done('fail');
          },
          error: (result) => {
            done();

            expect(result).toEqual(
              new ApplicationError(ErrorSignals.ITEM_NOT_FOUND, 404),
            );
          },
        });
      });
    });

    describe('item was already looted', () => {
      it('throw ITEM_NOT_FOUND', (done) => {
        when(mockedInventoryStore.look('chest1', swordEntity.id)).thenReturn(
          of(swordEntity),
        );

        when(mockedInventoryStore.drop('chest1', swordEntity.id)).thenReturn(
          of(false),
        );

        service.loot('actor2', 'chest1', swordEntity.id).subscribe({
          next: () => {
            done('fail');
          },
          error: (result) => {
            done();

            expect(result).toEqual(
              new ApplicationError(ErrorSignals.ITEM_NOT_FOUND, 400),
            );
          },
        });
      });
    });

    describe('item could not be looted', () => {
      it('throw DUPLICATED_ITEM', (done) => {
        when(mockedInventoryStore.look('chest1', swordEntity.id)).thenReturn(
          of(swordEntity),
        );

        when(mockedInventoryStore.drop('chest1', swordEntity.id)).thenReturn(
          of(true),
        );

        when(
          mockedInventoryStore.store('actor2', deepEqual(swordEntity)),
        ).thenReturn(of(false));

        service.loot('actor2', 'chest1', swordEntity.id).subscribe({
          error: (result) => {
            done();

            expect(result).toEqual(
              new ApplicationError(ErrorSignals.DUPLICATED_ITEM, 400),
            );
          },
        });
      });
    });

    describe('item was looted', () => {
      it('return item', (done) => {
        when(mockedInventoryStore.look('chest1', swordEntity.id)).thenReturn(
          of(swordEntity),
        );

        when(mockedInventoryStore.drop('chest1', swordEntity.id)).thenReturn(
          of(true),
        );

        when(
          mockedInventoryStore.store('actor2', deepEqual(swordEntity)),
        ).thenReturn(of(true));

        service.loot('actor2', 'chest1', swordEntity.id).subscribe((result) => {
          done();

          expect(result).toEqual(swordEntity);
        });
      });
    });
  });

  describe('store', () => {
    describe('when item was duplicated', () => {
      it('throw DUPLICATED_ITEM', (done) => {
        when(
          mockedInventoryStore.store('actor1', deepEqual(swordEntity)),
        ).thenReturn(of(false));

        service.store('actor1', swordEntity).subscribe({
          next: () => done.fail(),
          error: (result) => {
            done();

            expect(result).toEqual(
              new ApplicationError(ErrorSignals.DUPLICATED_ITEM, 400),
            );
          },
        });
      });
    });

    describe('when item was stored', () => {
      it('return item', (done) => {
        when(mockedInventoryStore.store('actor1', swordEntity)).thenReturn(
          of(true),
        );

        service.store('actor1', swordEntity).subscribe({
          next: (result) => {
            done();

            expect(result).toEqual(StatusSignals.ITEM_STORED);
          },
          error: () => {
            done('fail');
          },
        });
      });
    });
  });
});
