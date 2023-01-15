import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigValuesHelper {
  public readonly BCRYPT_SALT_ROUNDS: number;
  public readonly JWT_SECRET: string;
  public readonly JWT_EXPIRES_IN: number;
  public readonly ENGINE_LOOP_MS: number;
  public readonly ASTRA_TOKEN: string;
  public readonly ASTRA_DB_KEYSPACE: string;
  public readonly ASTRA_DB_REGION: string;
  public readonly ASTRA_DB_ID: string;
  public readonly AMQP_URL: string;
  public readonly AMQP_EVENT_QUEUE: string;
  public readonly AMQP_RESULT_EXCHANGE: string;
  public readonly AMQP_EVENT_EXCHANGE: string;
  public readonly AMQP_EVENT_EXCHANGE_TYPE: string;
  public readonly AMQP_RESULT_EXCHANGE_TYPE: string;
  public readonly AMQP_EVENT_ROUTE_KEY: string;
  public readonly AMQP_RESULT_ROUTE_KEY: string;

  constructor() {
    this.BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '');

    this.JWT_SECRET = process.env.JWT_SECRET ?? '';

    this.JWT_EXPIRES_IN = parseInt(process.env.JWT_EXPIRES_IN ?? '');

    this.ENGINE_LOOP_MS = parseInt(process.env.ENGINE_LOOP_MS ?? '');

    this.ASTRA_TOKEN = process.env.ASTRA_TOKEN ?? '';

    this.ASTRA_DB_REGION = process.env.ASTRA_DB_REGION ?? '';

    this.ASTRA_DB_ID = process.env.ASTRA_DB_ID ?? '';

    this.ASTRA_DB_KEYSPACE = process.env.ASTRA_DB_KEYSPACE ?? '';

    this.AMQP_URL = process.env.AMQP_URL ?? '';

    this.AMQP_EVENT_QUEUE = process.env.AMQP_EVENT_QUEUE ?? '';

    this.AMQP_RESULT_EXCHANGE = process.env.AMQP_FANOUT_EXCHANGE ?? '';

    this.AMQP_EVENT_EXCHANGE = process.env.AMQP_EVENT_EXCHANGE ?? '';

    this.AMQP_EVENT_EXCHANGE_TYPE = process.env.AMQP_EVENT_EXCHANGE_TYPE ?? '';

    this.AMQP_RESULT_EXCHANGE_TYPE =
      process.env.AMQP_RESULT_EXCHANGE_TYPE ?? '';

    this.AMQP_EVENT_ROUTE_KEY = process.env.AMQP_EVENT_ROUTE_KEY ?? '';

    this.AMQP_RESULT_ROUTE_KEY = process.env.AMQP_RESULT_ROUTE_KEY ?? '';

    this.validate();
  }

  private validate(): void {
    if (!this.BCRYPT_SALT_ROUNDS) {
      throw new Error('BCRYPT_SALT_ROUNDS is required');
    }

    if (!this.JWT_SECRET?.length) {
      throw new Error('JWT_SECRET is required');
    }

    if (!this.JWT_EXPIRES_IN) {
      throw new Error('JWT_EXPIRES_IN is required');
    }

    if (!this.ENGINE_LOOP_MS) {
      throw new Error('ENGINE_LOOP_MS is required');
    }

    if (!this.ASTRA_TOKEN?.length) {
      throw new Error('ASTRA_TOKEN is required');
    }

    if (!this.ASTRA_DB_REGION?.length) {
      throw new Error('ASTRA_DB_REGION is required');
    }

    if (!this.ASTRA_DB_ID?.length) {
      throw new Error('ASTRA_DB_ID is required');
    }

    if (!this.ASTRA_DB_KEYSPACE?.length) {
      throw new Error('ASTRA_DB_KEYSPACE is required');
    }

    if (!this.AMQP_URL?.length) {
      throw new Error('AMQP_URL is required');
    }

    if (!this.AMQP_EVENT_QUEUE?.length) {
      throw new Error('AMQP_EVENT_QUEUE is required');
    }

    if (!this.AMQP_RESULT_EXCHANGE?.length) {
      throw new Error('AMQP_FANOUT_EXCHANGE is required');
    }

    if (!this.AMQP_EVENT_EXCHANGE?.length) {
      throw new Error('AMQP_EVENT_EXCHANGE is required');
    }

    if (!this.AMQP_EVENT_EXCHANGE_TYPE?.length) {
      throw new Error('AMQP_EVENT_EXCHANGE_TYPE is required');
    }

    if (!this.AMQP_RESULT_EXCHANGE_TYPE?.length) {
      throw new Error('AMQP_RESULT_EXCHANGE_TYPE is required');
    }

    if (!this.AMQP_EVENT_ROUTE_KEY?.length) {
      throw new Error('AMQP_EVENT_ROUTE_KEY is required');
    }

    if (!this.AMQP_RESULT_ROUTE_KEY?.length) {
      throw new Error('AMQP_RESULT_ROUTE_KEY is required');
    }
  }
}
