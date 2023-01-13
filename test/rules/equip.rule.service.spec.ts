import { Test, TestingModule } from '@nestjs/testing';

import { instance, mock } from 'ts-mockito';

import { EquipRuleService } from '@rules/equip.rule.service';
import { InventoryService } from '@services/inventory.service';

describe('EquipRuleService', () => {
  let service: EquipRuleService;

  const mockedInventoryService = mock(InventoryService);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EquipRuleService,
        {
          provide: InventoryService,
          useValue: instance(mockedInventoryService),
        },
      ],
    }).compile();

    service = module.get<EquipRuleService>(EquipRuleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
