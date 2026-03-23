import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';

/**
 * Wraps a screen component with an ErrorBoundary so a crash in one section
 * does not take down the entire app.
 */
export function withBoundary(Screen: React.ComponentType<any>, name: string) {
  function Wrapped(props: any) {
    return (
      <ErrorBoundary name={name}>
        <Screen {...props} />
      </ErrorBoundary>
    );
  }
  Wrapped.displayName = `Bounded(${name})`;
  return Wrapped;
}
