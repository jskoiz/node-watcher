import { ErrorUtils } from 'react-native';
import { captureException, logDevOnly } from './sentry';
import { showToast } from '../../store/toastStore';

/**
 * Installs a global handler for uncaught JS errors so they are logged to
 * Sentry and surfaced as a toast instead of crashing silently.
 *
 * Call once during app bootstrap (e.g. inside AppProviders).
 */
export function installGlobalErrorHandler() {
  const previousHandler = ErrorUtils.getGlobalHandler();

  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    captureException(error, {
      tags: { source: 'global-error-handler', fatal: String(Boolean(isFatal)) },
    });

    logDevOnly('error', '[global-error-handler]', { error, isFatal });

    showToast(
      isFatal
        ? 'An unexpected error occurred. Please restart the app.'
        : 'Something went wrong.',
      'error',
    );

    // Invoke the previous handler so Sentry/LogBox still work as expected.
    previousHandler?.(error, isFatal);
  });
}
