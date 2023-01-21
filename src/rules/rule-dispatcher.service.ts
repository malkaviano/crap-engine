import { Injectable, Inject } from '@nestjs/common';

import { filter, mergeMap } from 'rxjs';

import { RuleInterface } from '@interfaces/rule.interface';
import { MessageBrokerInterface } from '@interfaces/message-broker.interface';
import { MESSAGE_BROKER_TOKEN } from '@root/tokens';
import { CustomLoggerHelper } from '@helpers/custom-logger.helper.service';
import { EquipRuleService } from '@rules/equip.rule.service';
import { LootRuleService } from './loot.rule.service';
import { EventMessage } from '../messages/event.message';

@Injectable()
export class RuleDispatcherService {
  public readonly rules: { [key: string]: RuleInterface };

  constructor(
    @Inject(MESSAGE_BROKER_TOKEN)
    private readonly messageBroker: MessageBrokerInterface,
    private readonly customLoggerHelper: CustomLoggerHelper,
    lootRule: LootRuleService,
    equipRule: EquipRuleService,
  ) {
    this.rules = {
      EQUIP: equipRule,
      LOOT: lootRule,
    };
  }

  public listen(): void {
    this.messageBroker.eventMessageConsumed$
      .pipe(
        filter((msg) => this.isValid(msg)),
        mergeMap((event) => {
          this.customLoggerHelper.log(RuleDispatcherService.name, event);

          return this.rules[event.action]?.execute(event);
        }),
        mergeMap((message) => {
          this.customLoggerHelper.log(RuleDispatcherService.name, message);

          return this.messageBroker.publish(
            Buffer.from(JSON.stringify(message)),
          );
        }),
      )
      .subscribe({
        next: (result) => {
          if (!result) {
            this.customLoggerHelper.error(
              RuleDispatcherService.name,
              new Error('Message not published'),
            );
          }
        },
        error: (error) => {
          this.customLoggerHelper.error(RuleDispatcherService.name, error);
        },
        complete: () => {
          this.customLoggerHelper.log(RuleDispatcherService.name, {
            msg: 'Broker finished',
          });
        },
      });
  }

  private isValid(msg: EventMessage): boolean {
    return !!msg.action;
  }
}
