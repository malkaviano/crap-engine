import { Injectable } from '@nestjs/common';

import { Account } from '@root/auth/account.model';

@Injectable()
export class AccountsRepository {
  private readonly accounts: Account[] = [
    {
      username: 'john',
      password: '$2b$10$YEF0seljXSVn8dUCCzOVcuLsuWsAmY0Ost8RWazO6qO7bk2wBTg.i',
    },
  ];

  async findOne(username: string): Promise<Account | undefined> {
    return Promise.resolve(this.accounts.find((a) => a.username === username));
  }
}
