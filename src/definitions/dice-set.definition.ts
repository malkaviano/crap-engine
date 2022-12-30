import { DiceLiteral } from '@literals/dice.literal';

export type DiceSet = {
  readonly [key in DiceLiteral]: number;
};
