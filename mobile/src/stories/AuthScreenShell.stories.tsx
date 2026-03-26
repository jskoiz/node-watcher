import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { Button, GlassView, Input } from '../design/primitives';
import { AuthFooterLinkRow, AuthScreenShell } from '../features/auth/components/AuthScreenShell';
import { lightTheme, radii } from '../theme/tokens';
import { withStoryScreenFrame } from './support';

function AuthScreenShellStory({ mode }: { mode: 'login' | 'signup' }) {
  const isLogin = mode === 'login';

  return (
    <AuthScreenShell
      hero={(
        <View style={{ gap: 12, marginBottom: 32 }}>
          <GlassView tier="light" tint={lightTheme.accentSubtle} borderRadius={999} style={{ alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 6 }}>
            <Text style={{ color: lightTheme.accent, fontSize: 10, fontWeight: '800', letterSpacing: 1.8 }}>
              {isLogin ? 'BRDG' : 'CREATE ACCOUNT'}
            </Text>
          </GlassView>
          <Text style={{ color: lightTheme.textPrimary, fontSize: 28, fontWeight: '800' }}>
            {isLogin ? 'Welcome back' : "What's your name?"}
          </Text>
          <Text style={{ color: lightTheme.textSecondary, fontSize: 16, lineHeight: 24, maxWidth: 320 }}>
            {isLogin
              ? 'Shared auth shell with backdrop, keyboard handling, and footer link.'
              : 'The same shell also supports the multi-step signup header and card layout.'}
          </Text>
        </View>
      )}
      card={(
        <GlassView tier="frosted" borderRadius={radii.xxl} specularHighlight style={{ padding: 24 }}>
          <Text style={{ color: lightTheme.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1.8, marginBottom: 8 }}>
            {isLogin ? 'SIGN IN' : 'ACCOUNT'}
          </Text>
          <Input label="Email" placeholder="you@example.com" value={isLogin ? 'lana@brdg.local' : ''} />
          {!isLogin ? <Input label="First name" placeholder="Alex" value="Lana" /> : null}
          <Button label={isLogin ? 'Sign in' : 'Continue'} onPress={() => undefined} style={{ marginTop: 8 }} />
        </GlassView>
      )}
      footer={(
        <AuthFooterLinkRow
          prompt={isLogin ? "Don't have an account? " : 'Already have an account? '}
          linkLabel={isLogin ? 'Join BRDG' : 'Sign in'}
          onPress={() => undefined}
          accessibilityLabel={isLogin ? 'Join BRDG' : 'Sign in'}
          style={{ marginTop: 32 }}
        />
      )}
      contentContainerStyle={{ justifyContent: isLogin ? 'center' : 'flex-start', paddingTop: isLogin ? 96 : 24 }}
    />
  );
}

const meta = {
  title: 'Screens/AuthShell',
  component: AuthScreenShellStory,
  decorators: [withStoryScreenFrame({ height: 920 })],
  args: {
    mode: 'login',
  },
} satisfies Meta<typeof AuthScreenShellStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LoginShell: Story = {};

export const SignupShell: Story = {
  args: {
    mode: 'signup',
  },
};
