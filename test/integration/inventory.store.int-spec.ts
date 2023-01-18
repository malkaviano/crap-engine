import { Test, TestingModule } from '@nestjs/testing';

import { map, mergeMap } from 'rxjs';

import { InventoryStore } from '@root/infra/stores/inventory.store';
import { HelpersModule } from '@helpers/helpers.module';
import { InfraModule } from '@infra/infra.module';
import { INVENTORY_STORE_TOKEN } from '@root/tokens';

import { knifeEntity, swordEntity } from '../fakes';

describe('InventoryStore', () => {
  let service: InventoryStore;

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

  it('should execute inventory actions', (done) => {
    service
      .remove('actor1')
      .pipe(
        map((result) => {
          expect(result).toEqual(true);
        }),
        mergeMap(() => service.remove('actor2')),
        map((result) => {
          expect(result).toEqual(true);
        }),
        mergeMap(() => service.store('actor1', swordEntity)),
        map((result) => {
          expect(result).toEqual(true);
        }),
        mergeMap(() => service.drop('actor1', knifeEntity.id)),
        map((result) => {
          expect(result).toEqual(false);
        }),
        mergeMap(() => service.look('actor1', swordEntity.id)),
        map((result) => {
          expect(result).toEqual(swordEntity);
        }),
        mergeMap(() => service.store('actor1', knifeEntity)),
        map((result) => {
          expect(result).toEqual(true);
        }),
        mergeMap(() => service.look('actor1', knifeEntity.id)),
        map((result) => {
          expect(result).toEqual(knifeEntity);
        }),
        mergeMap(() => service.look('actor2', swordEntity.id)),
        map((result) => {
          expect(result).toBeNull();
        }),
        mergeMap(() => service.drop('actor1', knifeEntity.id)),
        map((result) => {
          expect(result).toEqual(true);
        }),
        mergeMap(() => service.look('actor1', knifeEntity.id)),
        map((result) => {
          expect(result).toBeNull();
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
