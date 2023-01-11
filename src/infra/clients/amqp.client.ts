import { Injectable, OnModuleDestroy } from '@nestjs/common';

import { connect, Channel, Connection, ConsumeMessage } from 'amqplib';

import { ConfigValuesHelper } from '@helpers/config-values.helper.service';

interface Channels {
  [key: string]: Channel;
}

@Injectable()
export class AmqpClient implements OnModuleDestroy {
  private readonly address: string;

  private readonly channels: Channels;

  private connection: Connection | null;

  constructor(private readonly configValuesHelper: ConfigValuesHelper) {
    this.address = `${this.configValuesHelper.AMQP_URL}`;

    this.channels = {};

    this.connection = null;
  }

  public async onModuleDestroy(): Promise<void> {
    await this.connection?.close();
  }

  public async produce(
    channelName: string,
    queue: string,
    content: Buffer,
  ): Promise<boolean> {
    const channel = await this.channel(channelName);

    await channel.assertQueue(queue);

    return channel.sendToQueue(queue, content);
  }

  public async consume<T>(
    channelName: string,
    queue: string,
    f: (eventMessage: T) => void,
  ): Promise<string> {
    const channel = await this.channel(channelName);

    await channel.assertQueue(queue);

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

  private async channel(name: string): Promise<Channel> {
    if (!this.connection) {
      this.connection = await connect(this.address);
    }

    if (!this.channels[name]) {
      const channel = await this.connection.createChannel();

      this.channels[name] = channel;
    }

    return this.channels[name];
  }
}
