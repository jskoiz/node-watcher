import type { ApiErrorKind } from '../../api/errors';
import { logApiFailure, type ApiDomain, type ApiFailureLogOptions } from '../../api/observability';

type ErrorLoggingInput = Record<string, unknown> | ErrorLoggingOptions | undefined;

export interface ErrorLoggingOptions extends ApiFailureLogOptions {
  ignoreErrorKinds?: ApiErrorKind[];
}

function resolveOptions(input: ErrorLoggingInput): ErrorLoggingOptions {
  if (!input) {
    return {};
  }

  if ('context' in input || 'ignoreErrorKinds' in input) {
    return input;
  }

  return { context: input as Record<string, unknown> };
}

export async function withErrorLogging<T>(
  domain: ApiDomain,
  action: string,
  fn: () => Promise<T>,
  input?: ErrorLoggingInput,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    logApiFailure(domain, action, error, resolveOptions(input));
    throw error;
  }
}
