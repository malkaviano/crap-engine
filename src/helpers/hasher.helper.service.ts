import { Injectable } from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { ConfigValuesHelper } from '@root/helpers/config-values.helper.service';

@Injectable()
export class HasherHelper {
  constructor(private readonly config: ConfigValuesHelper) {}

  async secureHash(str: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.config.BCRYPT_SALT_ROUNDS);

    return bcrypt.hash(str, salt);
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
