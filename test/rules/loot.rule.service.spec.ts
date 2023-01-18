import { Test, TestingModule } from '@nestjs/testing';

import { instance, when } from 'ts-mockito';
import { of, throwError } from 'rxjs';

import { LootRuleService } from '@rules/loot.rule.service';
import { InventoryService } from '@services/inventory.service';
import { LootEventMessage } from '@messages/loot-event.message';
import { ApplicationError } from '@errors/application.error';
import { ErrorSignals } from '@signals/error-signals';

import { mockedInventoryService } from '../shared-mocks';
import { swordEntity } from '../fakes';

describe('LootRuleService', () => {
  let service: LootRuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LootRuleService,
        {
          provide: InventoryService,
          useValue: instance(mockedInventoryService),
        },
      ],
    }).compile();

    service = module.get<LootRuleService>(LootRuleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    describe('when loot failed', () => {
      it('return error message', (done) => {
        const message: LootEventMessage = {
          action: 'LOOT',
          actorId: 'actor1',
          lootedId: 'chest1',
          itemId: 'sword1',
        };

        when(
          mockedInventoryService.loot(
            message.actorId,
            message.lootedId,
            message.itemId,
          ),
        ).thenReturn(
          throwError(
            () => new ApplicationError(ErrorSignals.ITEM_NOT_FOUND, 404),
          ),
        );

        service.execute(message).subscribe({
          next: (result) => {
            done();

            expect(result).toEqual({
              action: message.action,
              status: 'FAILURE',
              actorId: message.actorId,
              error: ErrorSignals.ITEM_NOT_FOUND,
              details: {
                itemId: message.itemId,
                lootedId: message.lootedId,
              },
            });
          },
          error: () => {
            done('fail');
          },
        });
      });
    });

    describe('when loot succeeded', () => {
      it('return success message', (done) => {
        const message: LootEventMessage = {
          action: 'LOOT',
          actorId: 'actor1',
          lootedId: 'chest1',
          itemId: swordEntity.id,
        };

        when(
          mockedInventoryService.loot(
            message.actorId,
            message.lootedId,
            message.itemId,
          ),
        ).thenReturn(of(swordEntity));

        service.execute(message).subscribe({
          next: (result) => {
            done();

            expect(result).toEqual({
              action: message.action,
              status: 'SUCCESS',
              actorId: message.actorId,
              item: swordEntity,
            });
          },
          error: () => {
            done('fail');
          },
        });
      });
    });
  });
});
