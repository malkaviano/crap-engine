import { Injectable, OnModuleDestroy } from '@nestjs/common';

import { connect, Channel, Connection, ConsumeMessage } from 'amqplib';

import { EventMessage } from '@messages/event.message';

interface Channels {
  [key: string]: Channel;
}

@Injectable()
export class AmqpClient implements OnModuleDestroy {
  private readonly channels: Channels;

  private connection: Connection | null;

  constructor() {
    this.channels = {};

    this.connection = null;
  }

  public async onModuleDestroy(): Promise<void> {
    await this.connection?.close();
  }

  public async consume<T extends EventMessage>(
    address: string,
    channelName: string,
    exchange: string,
    exchangeType: string,
    queue: string,
    f: (eventMessage: T) => void,
  ): Promise<string> {
    const channel = await this.channel(channelName, address);

    await channel.assertExchange(exchange, exchangeType, {
      durable: false,
      autoDelete: true,
    });

    await channel.assertQueue(queue, {
      exclusive: true,
      autoDelete: true,
    });

    await channel.bindQueue(queue, exchange, 'events');

    const { consumerTag } = await channel.consume(
      queue,
      (msg: ConsumeMessage | null) => {
        if (msg) {
          const obj = JSON.parse(msg.content.toString());

          f(obj);

          channel.ack(msg);
        }
      },
    );

    return consumerTag;
  }

  public async publish(
    address: string,
    channelName: string,
    exchange: string,
    exchangeType: string,
    content: Buffer,
  ): Promise<boolean> {
    const channel = await this.channel(channelName, address);

    await channel.assertExchange(exchange, exchangeType, {
      durable: false,
      autoDelete: true,
    });

    return channel.publish(exchange, '', content);
  }

  private async channel(name: string, address: string): Promise<Channel> {
    if (!this.connection) {
      this.connection = await connect(address);
    }

    if (!this.channels[name]) {
      const channel = await this.connection.createChannel();

      this.channels[name] = channel;
    }

    return this.channels[name];
  }
}
