import { Injectable, Scope } from '@nestjs/common';

@Injectable()
export class ConfigValuesHelper {
  public readonly DB_USER: string;
  public readonly DB_PASSWORD: string;
  public readonly BCRYPT_SALT_ROUNDS: number;
  public readonly JWT_SECRET: string;
  public readonly ENGINE_LOOP_MS: number;

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

    this.ENGINE_LOOP_MS = parseInt(process.env.ENGINE_LOOP_MS ?? '');

    if (!this.ENGINE_LOOP_MS) {
      throw new Error('ENGINE_LOOP_MS is required');
    }
  }
}
