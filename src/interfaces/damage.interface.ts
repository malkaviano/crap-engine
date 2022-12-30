import { DiceSet } from '@definitions/dice-set.definition';

export interface DamageInterface {
  readonly diceSet: DiceSet;
  readonly fixed: number;
  readonly effectType: string;
}
