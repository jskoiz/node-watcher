import { installGlobalErrorHandler } from '../globalErrorHandler';
import { useToastStore } from '../../../store/toastStore';

jest.mock('../sentry', () => ({
  captureException: jest.fn(),
  logDevOnly: jest.fn(),
}));

const mockPreviousHandler = jest.fn();
const mockSetGlobalHandler = jest.fn();

jest.mock('react-native', () => ({
  ErrorUtils: {
    getGlobalHandler: () => mockPreviousHandler,
    setGlobalHandler: (...args: unknown[]) => mockSetGlobalHandler(...args),
  },
}));

beforeEach(() => {
  useToastStore.setState({ toasts: [] });
  mockPreviousHandler.mockReset();
  mockSetGlobalHandler.mockReset();
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
});
