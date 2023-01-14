import { Module } from '@nestjs/common';

import { EquipRuleService } from '@rules/equip.rule.service';

@Module({
  providers: [EquipRuleService],
  exports: [EquipRuleService],
})
export class RulesModule {}
