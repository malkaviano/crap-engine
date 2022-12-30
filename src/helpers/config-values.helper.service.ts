import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigValuesHelper {
  public readonly DB_USER: string;
  public readonly DB_PASSWORD: string;
  public readonly BCRYPT_SALT_ROUNDS: number;
  public readonly JWT_SECRET: string;
  public readonly JWT_EXPIRES_IN: number;
  public readonly ENGINE_LOOP_MS: number;
  public readonly ASTRA_TOKEN: string;
  public readonly ASTRA_DB_KEYSPACE: string;
  public readonly ASTRA_DB_REGION: string;
  public readonly ASTRA_DB_ID: string;

  constructor() {
    // Stops the server boot if any required config is missing

    this.DB_USER = process.env.DB_USER ?? '';

    if (!this.DB_USER.length) {
      throw new Error('DB_USER is required');
    }

    this.DB_PASSWORD = process.env.DB_PASSWORD ?? '';

    if (!this.DB_PASSWORD.length) {
      throw new Error('DB_PASSWORD is required');
    }

    this.BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '');

    if (!this.BCRYPT_SALT_ROUNDS) {
      throw new Error('BCRYPT_SALT_ROUNDS is required');
    }

    this.JWT_SECRET = process.env.JWT_SECRET ?? '';

    if (!this.JWT_SECRET.length) {
      throw new Error('JWT_SECRET is required');
    }

    this.JWT_EXPIRES_IN = parseInt(process.env.JWT_EXPIRES_IN ?? '');

    if (!this.JWT_EXPIRES_IN) {
      throw new Error('JWT_EXPIRES_IN is required');
    }

    this.ENGINE_LOOP_MS = parseInt(process.env.ENGINE_LOOP_MS ?? '');

    if (!this.ENGINE_LOOP_MS) {
      throw new Error('ENGINE_LOOP_MS is required');
    }

    this.ASTRA_TOKEN = process.env.ASTRA_TOKEN ?? '';

    if (!this.ASTRA_TOKEN.length) {
      throw new Error('ASTRA_TOKEN is required');
    }

    this.ASTRA_DB_REGION = process.env.ASTRA_DB_REGION ?? '';

    if (!this.ASTRA_DB_REGION.length) {
      throw new Error('ASTRA_DB_REGION is required');
    }

    this.ASTRA_DB_ID = process.env.ASTRA_DB_ID ?? '';

    if (!this.ASTRA_DB_ID.length) {
      throw new Error('ASTRA_DB_ID is required');
    }

    this.ASTRA_DB_KEYSPACE = process.env.ASTRA_DB_KEYSPACE ?? '';

    if (!this.ASTRA_DB_KEYSPACE.length) {
      throw new Error('ASTRA_DB_KEYSPACE is required');
    }
  }
}
