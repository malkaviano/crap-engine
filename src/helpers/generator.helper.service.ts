import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

@Injectable()
export class GeneratorHelper {
  public newId(): string {
    return v4();
  }
}
