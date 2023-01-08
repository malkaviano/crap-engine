import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

import { Observable, Subject } from 'rxjs';
import { Channel } from 'amqplib';

import { EventBrokerInterface } from '@interfaces/event-broker.interface';
import { AmqpClient } from '@infra/clients/amqp.client';
import { ConfigValuesHelper } from '@helpers/config-values.helper.service';
import { EventMessage } from '@interfaces/event-message.interface';

@Injectable()
export class EventBroker
  implements OnModuleInit, OnModuleDestroy, EventBrokerInterface
{
  private readonly eventMessageReceived: Subject<EventMessage>;

  private channel: Channel;

  public readonly eventMessageReceived$: Observable<EventMessage>;

  constructor(
    private readonly amqpClient: AmqpClient,
    private readonly configValuesHelper: ConfigValuesHelper,
  ) {
    this.eventMessageReceived = new Subject();

    this.eventMessageReceived$ = this.eventMessageReceived.asObservable();
  }

  public async onModuleInit(): Promise<void> {
    this.channel = await this.amqpClient.channel();

    await this.consume();
  }

  public async onModuleDestroy() {
    await this.channel.close();
  }

  public async produce(content: Buffer): Promise<void> {
    await this.amqpClient.produce(
      this.channel,
      this.configValuesHelper.AMQP_EVENT_QUEUE,
      content,
    );
  }

  public async consume(): Promise<void> {
    await this.amqpClient.consume(
      this.channel,
      this.configValuesHelper.AMQP_EVENT_QUEUE,
      (eventMessage: EventMessage) =>
        this.eventMessageReceived.next(eventMessage),
    );
  }
}
