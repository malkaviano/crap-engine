import { Injectable, OnModuleInit } from '@nestjs/common';

import { mergeMap, Observable, share, Subject } from 'rxjs';

import { AmqpClient } from '@infra/clients/amqp.client';
import { EventMessage } from '@messages/event.message';
import { ConfigValuesHelper } from '@helpers/config-values.helper.service';
import { MessageBrokerInterface } from '@interfaces/message-broker.interface';
import { ResultMessage } from '@messages/result.message';

@Injectable()
export class AmqpBroker implements MessageBrokerInterface, OnModuleInit {
  private readonly address: string;

  private readonly resultExchange: string;

  private readonly eventExchange: string;

  private readonly eventQueue: string;

  private readonly channelName: string;

  private readonly resultExchangeType: string;

  private readonly eventExchangeType: string;

  private readonly eventRouteKey: string;

  private readonly resultRouteKey: string;

  private readonly eventMessageConsumed: Subject<EventMessage>;

  public readonly eventMessageConsumed$: Observable<EventMessage>;

  constructor(
    private readonly configValuesHelper: ConfigValuesHelper,
    private readonly amqpClient: AmqpClient,
  ) {
    this.address = this.configValuesHelper.AMQP_URL;

    this.resultExchange = this.configValuesHelper.AMQP_RESULT_EXCHANGE;

    this.eventExchange = this.configValuesHelper.AMQP_EVENT_EXCHANGE;

    this.eventQueue = this.configValuesHelper.AMQP_EVENT_QUEUE;

    this.resultExchangeType = this.configValuesHelper.AMQP_RESULT_EXCHANGE_TYPE;

    this.eventExchangeType = this.configValuesHelper.AMQP_EVENT_EXCHANGE_TYPE;

    this.eventRouteKey = this.configValuesHelper.AMQP_EVENT_ROUTE_KEY;

    this.resultRouteKey = this.configValuesHelper.AMQP_RESULT_ROUTE_KEY;

    this.channelName = AmqpBroker.name;

    this.eventMessageConsumed = new Subject();

    this.eventMessageConsumed$ = this.eventMessageConsumed.pipe(share());
  }

  public async onModuleInit(): Promise<void> {
    await this.consume();
  }

  public async publish(content: Buffer): Promise<boolean> {
    return this.amqpClient.publish(
      this.address,
      this.channelName,
      this.resultExchange,
      this.resultExchangeType,
      this.resultRouteKey,
      content,
    );
  }

  private async consume(): Promise<string> {
    const tag = await this.amqpClient.consume(
      this.address,
      this.channelName,
      this.eventExchange,
      this.eventExchangeType,
      this.eventQueue,
      this.eventRouteKey,
      (eventMessage: EventMessage) => {
        this.eventMessageConsumed.next(eventMessage);
      },
    );

    return tag;
  }
}
