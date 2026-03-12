# BRDG mobile testing

The mobile workspace now has a real Jest + React Native Testing Library foundation for app-level screen and navigation coverage.

## What is covered first

Initial suite focus:
- `AppNavigator` auth gating
- `SignupScreen` multi-step validation and submission flow

This gives us meaningful protection around a core user journey without requiring simulators, Detox, or backend services in CI.

## Run locally

From `mobile/`:

```bash
npm test
```

Other useful checks:

```bash
npm run typecheck
npm run check
```

## Notes

- Tests use `jest-expo` and `@testing-library/react-native`
- Network/store boundaries are mocked where needed so the suite stays deterministic
- This is intended as a foundation for expanding into login, onboarding, discovery feed, and profile flows

## Recommended next targets

1. `LoginScreen` success + API failure states
2. `HomeScreen` empty/error/feed states with mocked discovery API
3. onboarding completion path
4. auth store persistence behavior (`loadToken`, invalid token fallback)
