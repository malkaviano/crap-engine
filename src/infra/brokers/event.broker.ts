import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

import { Observable, Subject } from 'rxjs';

import { EventBrokerInterface } from '@interfaces/event-broker.interface';
import { AmqpClient } from '@infra/clients/amqp.client';
import { ConfigValuesHelper } from '@helpers/config-values.helper.service';
import { EventMessage } from '@interfaces/event-message.interface';

@Injectable()
export class EventBroker
  implements OnModuleInit, OnModuleDestroy, EventBrokerInterface
{
  private readonly eventMessageReceived: Subject<EventMessage>;

  public readonly eventMessageReceived$: Observable<EventMessage>;

  constructor(
    private readonly amqpClient: AmqpClient,
    private readonly configValuesHelper: ConfigValuesHelper,
  ) {
    this.eventMessageReceived = new Subject();

    this.eventMessageReceived$ = this.eventMessageReceived.asObservable();
  }

  public async onModuleInit(): Promise<void> {
    await this.amqpClient.open();

    await this.consume();
  }

  public async onModuleDestroy() {
    await this.amqpClient.close();
  }

  public async produce(content: Buffer): Promise<void> {
    await this.amqpClient.produce(
      this.configValuesHelper.AMQP_EVENT_QUEUE,
      content,
    );
  }

  public async consume(): Promise<void> {
    await this.amqpClient.consume(
      this.configValuesHelper.AMQP_EVENT_QUEUE,
      (eventMessage: EventMessage) =>
        this.eventMessageReceived.next(eventMessage),
    );
  }
}
