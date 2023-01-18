import { Injectable } from '@nestjs/common';

import { Observable } from 'rxjs';

import { InventoryService } from '@services/inventory.service';
import { RuleInterface } from '@interfaces/rule.interface';
import { EventMessage } from '@messages/event.message';
import { ResultMessage } from '@messages/result.message';

@Injectable()
export class EquipRuleService implements RuleInterface {
  constructor(private readonly inventoryService: InventoryService) {}

  public execute(message: EventMessage): Observable<ResultMessage> {
    throw new Error('Method not implemented.');
  }
}
