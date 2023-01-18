import { Test, TestingModule } from '@nestjs/testing';

import { instance } from 'ts-mockito';

import { EquipRuleService } from '@rules/equip.rule.service';
import { InventoryService } from '@services/inventory.service';
import { mockedInventoryService } from '../shared-mocks';

describe('EquipRuleService', () => {
  let service: EquipRuleService;

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
