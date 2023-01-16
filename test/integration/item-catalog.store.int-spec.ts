import { Test, TestingModule } from '@nestjs/testing';

import { map, mergeMap } from 'rxjs';

import { HelpersModule } from '@helpers/helpers.module';
import { InfraModule } from '@infra/infra.module';
import { ITEM_CATALOG_STORE_TOKEN } from '@root/tokens';
import { ItemCatalogStore } from '@infra/stores/item-catalog.store';
import { WeaponDefinition } from '@definitions/weapon.definition';
import { ReadableDefinition } from '@definitions/readable.definition';
import { ConsumableDefinition } from '@definitions/consumable.definition';

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

  it('should store and retrieve items', (done) => {
    service
      .save(sword)
      .pipe(
        map((result) => {
          expect(result).toEqual(true);
        }),
        mergeMap(() => service.save(firstAidKit)),
        map((result) => {
          expect(result).toEqual(true);
        }),
        mergeMap(() => service.save(friendNote)),
        map((result) => {
          expect(result).toEqual(true);
        }),
        mergeMap(() => service.save(sword)),
        map((result) => {
          expect(result).toEqual(false);
        }),
        mergeMap(() => service.save(firstAidKit)),
        map((result) => {
          expect(result).toEqual(false);
        }),
        mergeMap(() => service.save(friendNote)),
        map((result) => {
          expect(result).toEqual(false);
        }),
        mergeMap(() =>
          service.getItem<WeaponDefinition>(sword.category, sword.info.name),
        ),
        map((result) => {
          expect(result).toEqual(sword);
        }),
        mergeMap(() =>
          service.getItem<ReadableDefinition>(
            friendNote.category,
            friendNote.info.name,
          ),
        ),
        map((result) => {
          expect(result).toEqual(friendNote);
        }),
        mergeMap(() =>
          service.getItem<ConsumableDefinition>(
            firstAidKit.category,
            firstAidKit.info.name,
          ),
        ),
        map((result) => {
          expect(result).toEqual(firstAidKit);
        }),
        mergeMap(() => service.removeItem(sword.category, sword.info.name)),
        map((result) => {
          expect(result).toEqual(true);
        }),
        mergeMap(() =>
          service.removeItem(friendNote.category, friendNote.info.name),
        ),
        map((result) => {
          expect(result).toEqual(true);
        }),
        mergeMap(() =>
          service.removeItem(firstAidKit.category, firstAidKit.info.name),
        ),
        map((result) => {
          expect(result).toEqual(true);
        }),
        mergeMap(() => service.removeItem(sword.category, sword.info.name)),
        map((result) => {
          expect(result).toEqual(false);
        }),
        mergeMap(() =>
          service.removeItem(friendNote.category, friendNote.info.name),
        ),
        map((result) => {
          expect(result).toEqual(false);
        }),
        mergeMap(() =>
          service.removeItem(firstAidKit.category, firstAidKit.info.name),
        ),
        map((result) => {
          expect(result).toEqual(false);
        }),
        mergeMap(() =>
          service.getItem<WeaponDefinition>(sword.category, sword.info.name),
        ),
        map((result) => {
          expect(result).toBeNull();
        }),
        mergeMap(() =>
          service.getItem<ReadableDefinition>(
            friendNote.category,
            friendNote.info.name,
          ),
        ),
        map((result) => {
          expect(result).toBeNull();
        }),
        mergeMap(() =>
          service.getItem<ConsumableDefinition>(
            firstAidKit.category,
            firstAidKit.info.name,
          ),
        ),
        map((result) => {
          expect(result).toBeNull();
        }),
      )
      .subscribe({
        next: () => {
          done();
        },
        error: () => {
          done.fail();
        },
      });
  });
});
