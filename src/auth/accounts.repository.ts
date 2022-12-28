import { Injectable } from '@nestjs/common';

import { Account } from '@root/auth/account.model';

@Injectable()
export class AccountsRepository {
  private readonly accounts: Account[] = [
    {
      username: 'john',
      password: '$2b$10$AMWyDVoo8TIy6xHHSoHGneALteNWoPjzzI7WuNKAXnSZP77yo0Fi.',
    },
  ];

  async findOne(username: string): Promise<Account | undefined> {
    return Promise.resolve(this.accounts.find((a) => a.username === username));
  }
}
