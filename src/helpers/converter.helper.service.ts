import { Injectable } from '@nestjs/common';

import { WeaponEntity } from '@entities/weapon.entity';
import { ConsumableEntity } from '@entities/consumable.entity';
import { ReadableEntity } from '@entities/readable.entity';
import { WeaponDefinition } from '@definitions/weapon.definition';
import { ConsumableDefinition } from '@definitions/consumable.definition';
import { ReadableDefinition } from '@definitions/readable.definition';

@Injectable()
export class ConverterHelper {
  public inflate(json: string): unknown | null {
    return this.parseJson(json);
  }

  public inflateItem(json: string): unknown | null {
    let obj = this.parseJson(json);

    if (obj) {
      const category = Object.getOwnPropertyDescriptor(obj, 'category');

      if (category?.value === 'WEAPON') {
        return this.inflateWeapon(obj);
      }

      if (category?.value === 'CONSUMABLE') {
        return this.inflateConsumable(obj);
      }

      if (category?.value === 'READABLE') {
        return this.inflateReadable(obj);
      }
    }

    return null;
  }

  private inflateWeapon(obj: unknown): unknown | null {
    const id = Object.getOwnPropertyDescriptor(obj, 'id');

    const formed = id?.value
      ? Object.setPrototypeOf(obj, WeaponEntity.prototype)
      : Object.setPrototypeOf(obj, WeaponDefinition.prototype);

    if (formed instanceof WeaponEntity || formed instanceof WeaponDefinition) {
      return formed;
    }

    return null;
  }

  private inflateConsumable(obj: unknown): unknown | null {
    const id = Object.getOwnPropertyDescriptor(obj, 'id');

    const formed = id?.value
      ? Object.setPrototypeOf(obj, ConsumableEntity.prototype)
      : Object.setPrototypeOf(obj, ConsumableDefinition.prototype);

    if (
      formed instanceof ConsumableEntity ||
      formed instanceof ConsumableDefinition
    ) {
      return formed;
    }

    return null;
  }

  private inflateReadable(obj: unknown): unknown | null {
    const id = Object.getOwnPropertyDescriptor(obj, 'id');

    const formed = id?.value
      ? Object.setPrototypeOf(obj, ReadableEntity.prototype)
      : Object.setPrototypeOf(obj, ReadableDefinition.prototype);

    if (
      formed instanceof ReadableEntity ||
      formed instanceof ReadableDefinition
    ) {
      return formed;
    }

    return null;
  }

  private parseJson(json: string): unknown {
    try {
      return JSON.parse(json);
    } catch (error) {
      return null;
    }
  }
}
