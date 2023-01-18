import { ResultMessage } from '@messages/result.message';

export type ErrorResultMessage = ResultMessage & {
  readonly error: string;
  readonly details: unknown;
};
