import { useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { normalizeApiError } from '../../../api/errors';
import { useAuthStore } from '../../../store/authStore';
import { signupSchema, type SignupFormValues } from '../schema';

const STEPS = 3;
const fieldsByStep: Array<Array<keyof SignupFormValues>> = [
  ['firstName'],
  ['email', 'password'],
  ['birthdate', 'gender'],
];

export function useSignupFlow() {
  const [step, setStep] = useState(0);
  const signup = useAuthStore((state) => state.signup);
  const {
    control,
    handleSubmit,
    trigger,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    defaultValues: {
      birthdate: '',
      email: '',
      firstName: '',
      gender: '',
      password: '',
    },
    resolver: zodResolver(signupSchema),
  });

  const firstName = watch('firstName');
  const email = watch('email');
  const password = watch('password');
  const birthdate = watch('birthdate');
  const gender = watch('gender');

  const canProceed = useMemo(() => {
    if (step === 0) return !!firstName.trim();
    if (step === 1) return !!email.trim() && !!password.trim();
    if (step === 2) return !!birthdate && !!gender.trim();
    return false;
  }, [birthdate, email, firstName, gender, password, step]);

  const handleSubmitStep = async () => {
    const isValid = await trigger(fieldsByStep[step], { shouldFocus: true });
    if (!isValid) return;

    if (step < STEPS - 1) {
      setStep((current) => current + 1);
      return;
    }

    await handleSubmit(async (values) => {
      try {
        await signup({
          email: values.email.trim().toLowerCase(),
          password: values.password,
          firstName: values.firstName.trim(),
          birthdate: values.birthdate,
          gender: values.gender,
        });
      } catch (error) {
        Alert.alert("Couldn't create account", normalizeApiError(error).message);
      }
    })();
  };

  const handleBack = () => {
    setStep((current) => Math.max(0, current - 1));
  };

  return {
    birthdate,
    canProceed,
    control,
    errors,
    gender,
    handleBack,
    handleSubmitStep,
    isSubmitting,
    step,
  };
}
