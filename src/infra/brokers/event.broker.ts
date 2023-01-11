import { Injectable } from '@nestjs/common';

import { Observable, Subject } from 'rxjs';

import { EventBrokerInterface } from '@interfaces/event-broker.interface';
import { AmqpClient } from '@infra/clients/amqp.client';
import { ConfigValuesHelper } from '@helpers/config-values.helper.service';
import { EventMessage } from '@messages/event.message';

@Injectable()
export class EventBroker implements EventBrokerInterface {
  private readonly channelName: string;

  private readonly eventMessageReceived: Subject<EventMessage>;

  public readonly eventMessageReceived$: Observable<EventMessage>;

  constructor(
    private readonly amqpClient: AmqpClient,
    private readonly configValuesHelper: ConfigValuesHelper,
  ) {
    this.channelName = EventBroker.name;

    this.eventMessageReceived = new Subject();

    this.eventMessageReceived$ = this.eventMessageReceived.asObservable();
  }

  public async produce(content: Buffer): Promise<void> {
    await this.amqpClient.produce(
      this.channelName,
      this.configValuesHelper.AMQP_EVENT_QUEUE,
      content,
    );
  }

  public async consume(): Promise<string> {
    const tag = await this.amqpClient.consume(
      this.channelName,
      this.configValuesHelper.AMQP_EVENT_QUEUE,
      (eventMessage: EventMessage) =>
        this.eventMessageReceived.next(eventMessage),
    );

    return tag;
  }
}
