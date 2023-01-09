import { WeaponDefinition } from '@definitions/weapon.definition';
import { ConsumableDefinition } from '@definitions/consumable.definition';
import { ReadableDefinition } from '@definitions/readable.definition';
import { WeaponEntity } from '@entities/weapon.entity';
import { ConsumableEntity } from '@entities/consumable.entity';
import { ReadableEntity } from '@entities/readable.entity';

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
  'REMEDY',
  8,
  0,
);

export const friendNote = new ReadableDefinition(
  {
    name: 'friendNote',
    label: "Friend's Note",
    description: 'Small Handwritten Note',
  },
  'PERMANENT',
  null,
  'LATE!!!',
  ['GG', 'GG2', 'GG3'],
);

export const swordEntity = new WeaponEntity(
  'sword1',
  sword.info,
  sword.usability,
  sword.skillName,
  sword.dodgeable,
  sword.energyActivation,
  sword.damage,
);

export const knifeEntity = new WeaponEntity(
  'knife1',
  {
    name: 'huntingKnife',
    label: 'Hunting Knife',
    description: 'A knife used by hunters mostly. 1D6+1 kinetic damage',
  },
  'PERMANENT',
  'Melee Weapon (Simple)',
  true,
  0,
  {
    diceSet: {
      D4: 0,
      D6: 1,
      D8: 0,
      D10: 0,
      D12: 0,
      D20: 0,
      D100: 0,
    },
    fixed: 1,
    effectType: 'KINETIC',
  },
);

export const firstAidKitEntity = new ConsumableEntity(
  'firstAidKit1',
  firstAidKit.info,
  firstAidKit.usability,
  firstAidKit.skillName,
  firstAidKit.effectType,
  firstAidKit.amount,
  firstAidKit.energy,
);

export const friendNoteEntity = new ReadableEntity(
  'note1',
  friendNote.info,
  friendNote.usability,
  friendNote.skillName,
  friendNote.title,
  friendNote.paragraphs,
);
