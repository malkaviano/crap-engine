import { WeaponDefinition } from '@definitions/weapon.definition';
import { ConsumableDefinition } from '../src/definitions/consumable.definition';

export const sword = new WeaponDefinition(
  {
    name: 'sword',
    label: 'Sword',
    description: 'Some Sword',
  },
  'PERMANENT',
  'Melee Weapon (Simple)',
  true,
  0,
  {
    effectType: 'KINETIC',
    fixed: 0,
    diceSet: {
      D4: 0,
      D6: 1,
      D8: 0,
      D10: 0,
      D12: 0,
      D20: 0,
      D100: 0,
    },
  },
);

export const firstAidKit = new ConsumableDefinition(
  {
    name: 'firstAidKit',
    label: 'First Aid Kit',
    description: 'Use to recover HP (8) on skill check success',
  },
  'DISPOSABLE',
  'First Aid',
  {
    effectType: 'REMEDY',
    amount: 8,
    energy: 0,
  },
);
