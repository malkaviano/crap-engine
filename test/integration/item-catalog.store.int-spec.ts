import { Test, TestingModule } from '@nestjs/testing';

import { concatMap, map, of } from 'rxjs';

import { HelpersModule } from '@helpers/helpers.module';
import { InfraModule } from '@infra/infra.module';
import { ITEM_CATALOG_STORE_TOKEN } from '@root/tokens';
import { ItemCatalogStore } from '@infra/stores/item-catalog.store';
import { ItemDefinitionInterface } from '@interfaces/item-definition.interface';

import { firstAidKit, friendNote, sword } from '../fakes';

describe('ItemCatalogStore', () => {
  let service: ItemCatalogStore;

  const save = concatMap((item: ItemDefinitionInterface) =>
    service.save(item).pipe(
      map((result) => {
        return {
          result,
          item,
        };
      }),
    ),
  );

  const get = concatMap((item: ItemDefinitionInterface) =>
    service.getItem(item.category, item.info.name).pipe(
      map((result) => {
        return {
          result,
          item,
        };
      }),
    ),
  );

  const remove = concatMap((item: ItemDefinitionInterface) =>
    service.removeItem(item.category, item.info.name).pipe(
      map((result) => {
        return {
          result,
          item,
        };
      }),
    ),
  );

  const assert = (expected: boolean) =>
    map(
      ({
        result,
        item,
      }: {
        result: boolean;
        item: ItemDefinitionInterface;
      }) => {
        expect(result).toEqual(expected);

        return item;
      },
    );

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

  it('should execute store, remove and get items', (done) => {
    of(sword, firstAidKit, friendNote)
      .pipe(
        save,
        assert(true),
        save,
        assert(false),
        get,
        map(({ result, item }) => {
          expect(result).toEqual(item);

          return item;
        }),
        remove,
        assert(true),
        remove,
        assert(false),
        get,
        map(({ result, item }) => {
          expect(result).toBeNull();

          return item;
        }),
      )
      .subscribe({
        next: () => {
          done();
        },
        error: () => {
          done('fail');
        },
      });
  });
});
