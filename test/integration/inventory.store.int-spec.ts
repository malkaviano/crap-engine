import { Test, TestingModule } from '@nestjs/testing';

import { map, concatMap, of } from 'rxjs';

import { InventoryStore } from '@infra/stores/inventory.store';
import { HelpersModule } from '@helpers/helpers.module';
import { InfraModule } from '@infra/infra.module';
import { INVENTORY_STORE_TOKEN } from '@root/tokens';
import { ItemEntityInterface } from '@interfaces/item-entity.interface';

import { firstAidKitEntity, friendNoteEntity, swordEntity } from '../fakes';

describe('InventoryStore', () => {
  let service: InventoryStore;

  const store = (actor: string) =>
    concatMap((entity: ItemEntityInterface) =>
      service.store(actor, entity).pipe(
        map((result) => {
          return { result, entity };
        }),
      ),
    );

  const look = (actor: string) =>
    concatMap((entity: ItemEntityInterface) =>
      service.look(actor, entity.id).pipe(
        map((result) => {
          return { result, entity };
        }),
      ),
    );

  const drop = (actor: string) =>
    concatMap((entity: ItemEntityInterface) =>
      service.drop(actor, entity.id).pipe(
        map((result) => {
          return { result, entity };
        }),
      ),
    );

  const assert = (expected: boolean) =>
    map(
      ({
        result,
        entity,
      }: {
        result: boolean;
        entity: ItemEntityInterface;
      }) => {
        expect(result).toEqual(expected);

        return entity;
      },
    );

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HelpersModule, InfraModule],
    }).compile();

    service = module.get(INVENTORY_STORE_TOKEN);

    await service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should execute store, look and remove', (done) => {
    of(swordEntity, friendNoteEntity, firstAidKitEntity)
      .pipe(
        store('actor1'),
        assert(true),
        look('actor1'),
        map(({ result, entity }) => {
          expect(result).toEqual(entity);

          return entity;
        }),
        look('actor2'),
        map(({ result, entity }) => {
          expect(result).toBeNull();

          return entity;
        }),
        drop('actor1'),
        assert(true),
        drop('actor2'),
        assert(false),
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
