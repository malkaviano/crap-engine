import { Injectable, OnModuleDestroy } from '@nestjs/common';

import { connect, Channel, Connection, ConsumeMessage } from 'amqplib';

import { ConfigValuesHelper } from '@helpers/config-values.helper.service';

@Injectable()
export class AmqpClient implements OnModuleDestroy {
  private readonly address: string;

  private connection: Connection;

  constructor(private readonly configValuesHelper: ConfigValuesHelper) {
    this.address = `${this.configValuesHelper.AMQP_URL}`;
  }

  public async onModuleDestroy(): Promise<void> {
    await this.connection?.close();
  }

  public async produce(
    channel: Channel,
    queue: string,
    content: Buffer,
  ): Promise<boolean> {
    await channel.assertQueue(queue);

    return channel.sendToQueue(queue, content);
  }

  public async consume<T>(
    channel: Channel,
    queue: string,
    f: (eventMessage: T) => void,
  ): Promise<string> {
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

  public async channel(): Promise<Channel> {
    if (!this.connection) {
      this.connection = await connect(this.address);
    }

    return this.connection.createChannel();
  }
}
