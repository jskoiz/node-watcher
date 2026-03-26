import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { captureException, logDevOnly } from '../core/observability/sentry';
import { lightTheme } from '../theme/tokens';

interface Props { children: ReactNode; fallback?: ReactNode; name?: string; }
interface State { hasError: boolean; error?: Error; }

function getRecoveryMessage(name?: string): string {
  if (name === 'root') {
    return 'Reload BRDG. If this keeps happening, close and reopen the app.';
  }

  return 'Try reloading this screen. If the problem continues, go back and try again.';
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    captureException(error, {
      tags: { source: 'error-boundary', ...(this.props.name ? { boundary: this.props.name } : {}) },
      extra: {
        errorName: error.name,
        errorMessage: error.message,
        componentStack: errorInfo.componentStack,
      },
    });
    logDevOnly('error', 'ErrorBoundary caught:', { error, errorInfo });
  }

  handleRetry = () => { this.setState({ hasError: false, error: undefined }); };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>{getRecoveryMessage(this.props.name)}</Text>
          {__DEV__ && this.state.error?.message ? (
            <Text style={styles.detail}>{this.state.error.message}</Text>
          ) : null}
          <Pressable style={styles.button} onPress={this.handleRetry}>
            <Text style={styles.buttonText}>Reload screen</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  message: { fontSize: 14, color: '#666', marginBottom: 20, textAlign: 'center' },
  detail: { fontSize: 12, color: '#666', marginBottom: 20, textAlign: 'center' },
  button: { backgroundColor: lightTheme.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
