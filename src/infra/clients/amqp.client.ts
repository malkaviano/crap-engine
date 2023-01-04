import { Injectable } from '@nestjs/common';

import client, { Channel, Connection } from 'amqplib';

import { ConfigValuesHelper } from '@helpers/config-values.helper.service';

@Injectable()
export class AmqpClient {
  private readonly address: string;

  constructor(private readonly configValuesHelper: ConfigValuesHelper) {
    this.address = `${this.configValuesHelper.AMQP_URL}:${this.configValuesHelper.AMQP_PORT}`;
  }

  public async channel(queue: string): Promise<client.Channel> {
    const connection: Connection = await client.connect(this.address);

    const channel: Channel = await connection.createChannel();

    await channel.assertQueue(queue);

    return channel;
  }
}
