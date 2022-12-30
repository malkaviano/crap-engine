import { Injectable } from '@nestjs/common';

import { DiceSet } from '@definitions/dice-set.definition';

@Injectable()
export class DiceSetHelper {
  createSet(
    options: {
      D4?: number;
      D6?: number;
      D8?: number;
      D10?: number;
      D12?: number;
      D20?: number;
      D100?: number;
    } = {},
  ): DiceSet {
    return {
      D4: options['D4'] ?? 0,
      D6: options['D6'] ?? 0,
      D8: options['D8'] ?? 0,
      D10: options['D10'] ?? 0,
      D12: options['D12'] ?? 0,
      D20: options['D20'] ?? 0,
      D100: options['D100'] ?? 0,
    };
  }
}
