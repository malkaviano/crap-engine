import { Module } from '@nestjs/common';

import { EquipRuleService } from '@rules/equip.rule.service';
import { RuleDispatcherService } from '@rules/rule-dispatcher.service';
import { ServicesModule } from '@services/services.module';
import { LootRuleService } from '@rules/loot.rule.service';

@Module({
  imports: [ServicesModule],
  providers: [EquipRuleService, RuleDispatcherService, LootRuleService],
  exports: [RuleDispatcherService],
})
export class RulesModule {}
