import { installGlobalErrorHandler } from '../globalErrorHandler';
import { useToastStore } from '../../../store/toastStore';
import { logDevOnly } from '../sentry';

jest.mock('../sentry', () => ({
  captureException: jest.fn(),
  logDevOnly: jest.fn(),
}));

const mockPreviousHandler = jest.fn();
const mockSetGlobalHandler = jest.fn();

beforeEach(() => {
  useToastStore.setState({ toasts: [] });
  mockPreviousHandler.mockReset();
  mockSetGlobalHandler.mockReset();
  Object.assign(globalThis, {
    ErrorUtils: {
      getGlobalHandler: () => mockPreviousHandler,
      setGlobalHandler: (...args: unknown[]) => mockSetGlobalHandler(...args),
    },
  });
});

afterEach(() => {
  delete (globalThis as typeof globalThis & { ErrorUtils?: unknown }).ErrorUtils;
});

describe('installGlobalErrorHandler', () => {
  it('installs a global handler via ErrorUtils', () => {
    installGlobalErrorHandler();
    expect(mockSetGlobalHandler).toHaveBeenCalledWith(expect.any(Function));
  });

  it('shows an error toast and calls previous handler for non-fatal errors', () => {
    installGlobalErrorHandler();
    const handler = mockSetGlobalHandler.mock.calls[0][0];

    const error = new Error('boom');
    handler(error, false);

    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].variant).toBe('error');
    expect(mockPreviousHandler).toHaveBeenCalledWith(error, false);
  });

  it('shows a restart message for fatal errors', () => {
    installGlobalErrorHandler();
    const handler = mockSetGlobalHandler.mock.calls[0][0];

    handler(new Error('fatal'), true);

    const toasts = useToastStore.getState().toasts;
    expect(toasts[0].message).toContain('restart');
  });

  it('logs and exits when ErrorUtils is unavailable', () => {
    delete (globalThis as typeof globalThis & { ErrorUtils?: unknown }).ErrorUtils;

    installGlobalErrorHandler();

    expect(mockSetGlobalHandler).not.toHaveBeenCalled();
    expect(logDevOnly).toHaveBeenCalledWith(
      'warn',
      '[global-error-handler] ErrorUtils unavailable',
    );
  });
});
