import { Injectable } from '@nestjs/common';

import { plainToInstance } from 'class-transformer';

type ClassConstructor<T> = {
  new (...args: any[]): T;
};

class X {}

@Injectable()
export class ConverterHelper {
  // Joke language is a joke
  public inflate<T>(json: string): T | null {
    const obj = this.parseJson(json);

    if (obj) {
      return this.convert(obj, X) as T | null;
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

  private convert<T>(obj: unknown, cls: ClassConstructor<T>): T | null {
    return plainToInstance(cls, obj);
  }
}
