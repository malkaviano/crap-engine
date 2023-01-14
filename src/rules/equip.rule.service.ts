import { Injectable } from '@nestjs/common';
import { InventoryService } from '@services/inventory.service';

@Injectable()
export class EquipRuleService {
  constructor(private readonly inventoryService: InventoryService) {}
}
