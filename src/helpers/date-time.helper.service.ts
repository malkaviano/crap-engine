import { Injectable } from '@nestjs/common';

import { DateTime } from 'luxon';

@Injectable()
export class DateTimeHelper {
  public readonly defaultTimezone = 'America/Sao_Paulo';

  public timestamp(): string {
    return this.getDateTime().toISO().toString();
  }

  public now(): DateTime {
    return this.getDateTime();
  }

  private getDateTime(): DateTime {
    return DateTime.now().setZone(this.defaultTimezone);
  }
}
