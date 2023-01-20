import { Injectable } from '@nestjs/common';

import { plainToInstance } from 'class-transformer';

import { WeaponDefinition } from '@definitions/weapon.definition';
import { ConsumableDefinition } from '@definitions/consumable.definition';
import { ReadableDefinition } from '@definitions/readable.definition';
import { WeaponEntity } from '@entities/weapon.entity';
import { ConsumableEntity } from '@entities/consumable.entity';
import { ReadableEntity } from '@entities/readable.entity';

@Injectable()
export class ConverterHelper {
  public inflateItemDefinition<
    T extends WeaponDefinition | ConsumableDefinition | ReadableDefinition,
  >(obj: { readonly category: string }): T | null {
    let item: T | null = null;

    if (obj['category'] === 'WEAPON') {
      const instance = plainToInstance(WeaponDefinition, obj);

      if (instance instanceof WeaponDefinition) {
        item = instance as T;
      }
    } else if (obj['category'] === 'CONSUMABLE') {
      const instance = plainToInstance(ConsumableDefinition, obj);

      if (instance instanceof ConsumableDefinition) {
        item = instance as T;
      }
    } else if (obj['category'] === 'READABLE') {
      const instance = plainToInstance(ReadableDefinition, obj);

      if (instance instanceof ReadableDefinition) {
        item = instance as T;
      }
    }

    return item;
  }

  public inflateItemEntity<
    T extends WeaponEntity | ConsumableEntity | ReadableEntity,
  >(obj: { readonly id: string; readonly category: string }): T | null {
    let item: T | null = null;

    if (obj['category'] === 'WEAPON') {
      const instance = plainToInstance(WeaponEntity, obj);

      if (instance instanceof WeaponEntity) {
        item = instance as T;
      }
    } else if (obj['category'] === 'CONSUMABLE') {
      const instance = plainToInstance(ConsumableEntity, obj);

      if (instance instanceof ConsumableEntity) {
        item = instance as T;
      }
    } else if (obj['category'] === 'READABLE') {
      const instance = plainToInstance(ReadableEntity, obj);

      if (instance instanceof ReadableEntity) {
        item = instance as T;
      }
    }

    return item;
  }

  public parseJson(json: string): unknown {
    try {
      return JSON.parse(json);
    } catch (error) {
      return null;
    }
  }
}
