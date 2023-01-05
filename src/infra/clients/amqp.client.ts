import { Injectable } from '@nestjs/common';

import { connect, Channel, Connection, ConsumeMessage } from 'amqplib';

import { ConfigValuesHelper } from '@helpers/config-values.helper.service';
import { EventMessage } from '@interfaces/event-message.interface';

@Injectable()
export class AmqpClient {
  private readonly address: string;

  private connection: Connection | null;

  private channel: Channel | null;

  constructor(private readonly configValuesHelper: ConfigValuesHelper) {
    this.address = `${this.configValuesHelper.AMQP_URL}`;

    this.connection = null;

    this.channel = null;
  }

  public async produce(queue: string, content: Buffer): Promise<void> {
    await this.channel?.checkQueue(queue);

    this.channel?.sendToQueue(queue, content);
  }

  public async consume(
    queue: string,
    f: (eventMessage: EventMessage) => void,
  ): Promise<void> {
    await this.channel?.checkQueue(queue);

    await this.channel?.consume(
      queue,
      (msg: ConsumeMessage | null) => {
        if (msg) {
          const obj = JSON.parse(msg.content.toString());

          f(obj);
        }
      },
      { noAck: true },
    );
  }

  public async close(): Promise<void> {
    await this.connection?.close();
  }

  public async open(): Promise<void> {
    this.connection = await connect(this.address);

    this.channel = await this.connection.createChannel();
  }
}
