import { Test, TestingModule } from '@nestjs/testing';

import { concat, concatMap, map, mergeMap, of, take } from 'rxjs';

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
    of(sword, firstAidKit, friendNote)
      .pipe(
        concatMap((item) =>
          service.save(item).pipe(
            map((result) => {
              return {
                result,
                item,
              };
            }),
          ),
        ),
        map(({ result, item }) => {
          expect(result).toEqual(true);

          return item;
        }),
        concatMap((item) =>
          service.save(item).pipe(
            map((result) => {
              return {
                result,
                item,
              };
            }),
          ),
        ),
        map(({ result, item }) => {
          expect(result).toEqual(false);

          return item;
        }),
        concatMap((item) =>
          service.getItem(item.category, item.info.name).pipe(
            map((result) => {
              return {
                result,
                item,
              };
            }),
          ),
        ),
        map(({ result, item }) => {
          expect(result).toEqual(item);

          return item;
        }),
        concatMap((item) =>
          service.removeItem(item.category, item.info.name).pipe(
            map((result) => {
              return {
                result,
                item,
              };
            }),
          ),
        ),
        map(({ result, item }) => {
          expect(result).toEqual(true);

          return item;
        }),
        concatMap((item) =>
          service.removeItem(item.category, item.info.name).pipe(
            map((result) => {
              return {
                result,
                item,
              };
            }),
          ),
        ),
        map(({ result, item }) => {
          expect(result).toEqual(false);

          return item;
        }),
        concatMap((item) =>
          service.getItem(item.category, item.info.name).pipe(
            map((result) => {
              return {
                result,
                item,
              };
            }),
          ),
        ),
        map(({ result, item }) => {
          expect(result).toBeNull();

          return item;
        }),
      )
      .subscribe({
        next: () => {
          done();
        },
        error: (err) => {
          console.log(err);
          done('fail');
        },
      });
  });
});
