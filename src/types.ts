import { isNotNullable } from 'effect/Predicate';

export interface BaseErrorParams {
  message?: string;
  cause?: unknown;
  meta?: Record<string, unknown>;
}

export abstract class BaseError extends Error {
  readonly meta?: Record<string, unknown>;

  constructor({ message = '', cause, meta }: BaseErrorParams = {}) {
    super(message, { cause });
    this.name = this.constructor.name;

    if (isNotNullable(meta)) this.meta = meta;
  }
}

export class NotionError extends BaseError {
  readonly _tag = 'NotionError';
}
