import { Injectable } from '@nestjs/common';

import { plainToInstance } from 'class-transformer';

import { WeaponDefinition } from '@definitions/weapon.definition';
import { ConsumableDefinition } from '@definitions/consumable.definition';
import { ReadableDefinition } from '@definitions/readable.definition';
import { WeaponEntity } from '@entities/weapon.entity';
import { ConsumableEntity } from '@entities/consumable.entity';
import { ReadableEntity } from '@entities/readable.entity';

type ClassConstructor<T> = {
  new (...args: any[]): T;
};

@Injectable()
export class ConverterHelper {
  public inflateItemDefinition<
    T extends WeaponDefinition | ConsumableDefinition | ReadableDefinition,
  >(json: string): T | null {
    const obj = this.parseJson(json);

    if (obj) {
      const p = Object.getOwnPropertyDescriptor(obj, 'category');

      if (p?.value) {
        if (p.value === 'WEAPON') {
          return this.convert(obj, WeaponDefinition) as T;
        } else if (p.value === 'CONSUMABLE') {
          return this.convert(obj, ConsumableDefinition) as T;
        } else if (p.value === 'READABLE') {
          return this.convert(obj, ReadableDefinition) as T;
        }
      }
    }

    return null;
  }

  public inflateItemEntity<
    T extends WeaponEntity | ConsumableEntity | ReadableEntity,
  >(json: string): T | null {
    const obj = this.parseJson(json);

    if (obj) {
      const p = Object.getOwnPropertyDescriptor(obj, 'category');

      if (p?.value) {
        if (p.value === 'WEAPON') {
          return this.convert(obj, WeaponEntity) as T;
        } else if (p.value === 'CONSUMABLE') {
          return this.convert(obj, ConsumableEntity) as T;
        } else if (p.value === 'READABLE') {
          return this.convert(obj, ReadableEntity) as T;
        }
      }
    }

    return null;
  }

  public parseJson(json: string): unknown {
    try {
      return JSON.parse(json);
    } catch (error) {
      return null;
    }
  }

  private convert<T>(obj: unknown, cls: ClassConstructor<T>): T | null {
    const instance = plainToInstance(cls, obj);

    if (instance instanceof cls) {
      return instance;
    }

    return null;
  }
}
