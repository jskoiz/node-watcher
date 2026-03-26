import { captureException, logDevOnly } from './sentry';
import { showToast } from '../../store/toastStore';

type ErrorHandler = (error: Error, isFatal?: boolean) => void;

type ErrorUtilsLike = {
  getGlobalHandler?: () => ErrorHandler | undefined;
  setGlobalHandler?: (handler: ErrorHandler) => void;
};

const getErrorUtils = (): ErrorUtilsLike | undefined => {
  const globalScope = globalThis as typeof globalThis & {
    ErrorUtils?: ErrorUtilsLike;
  };

  return globalScope.ErrorUtils;
};

let installed = false;

export function resetGlobalErrorHandlerForTests(): void {
  installed = false;
}

/**
 * Installs a global handler for uncaught JS errors so they are logged to
 * Sentry and surfaced as a toast instead of crashing silently.
 *
 * Call once during app bootstrap (e.g. inside AppProviders).
 */
export function installGlobalErrorHandler() {
  if (installed) {
    return;
  }

  const errorUtils = getErrorUtils();
  const previousHandler = errorUtils?.getGlobalHandler?.();

  if (!errorUtils?.setGlobalHandler) {
    logDevOnly('warn', '[global-error-handler] ErrorUtils unavailable');
    return;
  }

  errorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    captureException(error, {
      tags: { source: 'global-error-handler', fatal: String(Boolean(isFatal)) },
      extra: {
        name: error.name,
        message: error.message,
      },
    });

    logDevOnly('error', '[global-error-handler]', { error, isFatal });

    showToast(
      isFatal
        ? 'BRDG hit a fatal error. Close and reopen the app to continue.'
        : 'Something went wrong. Please try that again.',
      'error',
      undefined,
      { dedupeKey: isFatal ? 'global-error:fatal' : 'global-error:nonfatal' },
    );

    // Invoke the previous handler so Sentry/LogBox still work as expected.
    previousHandler?.(error, isFatal);
  });
  installed = true;
}
