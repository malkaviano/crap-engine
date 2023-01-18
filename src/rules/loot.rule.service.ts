import { Injectable } from '@nestjs/common';

import { catchError, map, Observable, of } from 'rxjs';

import { RuleInterface } from '@interfaces/rule.interface';
import { LootEventMessage } from '@messages/loot-event.message';
import { LootResultMessage } from '@messages/loot-result.message';
import { InventoryService } from '@services/inventory.service';
import { ErrorResultMessage } from '@messages/error-result.message';

@Injectable()
export class LootRuleService implements RuleInterface {
  constructor(private readonly inventoryService: InventoryService) {}

  execute(
    message: LootEventMessage,
  ): Observable<LootResultMessage | ErrorResultMessage> {
    return this.inventoryService
      .loot(message.actorId, message.lootedId, message.itemId)
      .pipe(
        map((item) => {
          return {
            action: message.action,
            status: 'SUCCESS',
            actorId: message.actorId,
            item,
          };
        }),
        catchError((err) => {
          return of({
            action: message.action,
            status: 'FAILURE',
            actorId: message.actorId,
            error: err.message,
            details: {
              itemId: message.itemId,
              lootedId: message.lootedId,
            },
          });
        }),
      );
  }
}
