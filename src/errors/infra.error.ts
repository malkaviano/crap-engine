import { CustomError } from 'ts-custom-error';

export class InfraError extends CustomError {
  public constructor(message?: string) {
    super(message);
  }
}
