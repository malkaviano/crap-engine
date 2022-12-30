import { CustomError } from 'ts-custom-error';

export class ApplicationError extends CustomError {
  public constructor(message?: string) {
    super(message);
  }
}
