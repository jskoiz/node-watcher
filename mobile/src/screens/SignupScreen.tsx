import React from 'react';
import type { RootStackScreenProps } from '../core/navigation/types';
import { SignupFlow } from '../features/auth/components/SignupFlow';
import { useSignupFlow } from '../features/auth/hooks/useSignupFlow';

export { SignupFlow as SignupScreenView } from '../features/auth/components/SignupFlow';

export default function SignupScreen({
  navigation,
}: RootStackScreenProps<'Signup'>) {
  const flow = useSignupFlow();

  return (
    <SignupFlow
      {...flow}
      handleBack={() => {
        if (flow.step > 0) {
          flow.handleBack();
          return;
        }
        navigation.goBack();
      }}
      onNavigateLogin={() => navigation.goBack()}
    />
  );
}
