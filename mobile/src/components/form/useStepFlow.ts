import { useEffect, useMemo, useState } from 'react';

type UseStepFlowOptions = {
  totalSteps: number;
  initialStep?: number;
};

function clampStep(step: number, totalSteps: number) {
  if (totalSteps <= 0) return 0;
  return Math.min(Math.max(step, 0), totalSteps - 1);
}

export function useStepFlow({ initialStep = 0, totalSteps }: UseStepFlowOptions) {
  const [step, setStep] = useState(() => clampStep(initialStep, totalSteps));

  // Re-clamp when totalSteps changes after mount
  useEffect(() => {
    setStep((current) => clampStep(current, totalSteps));
  }, [totalSteps]);

  const api = useMemo(
    () => ({
      step,
      totalSteps,
      isFirstStep: step === 0,
      isLastStep: totalSteps <= 0 ? true : step === totalSteps - 1,
      goBack: () => setStep((current) => clampStep(current - 1, totalSteps)),
      goNext: () => setStep((current) => clampStep(current + 1, totalSteps)),
      goToStep: (nextStep: number) => setStep(clampStep(nextStep, totalSteps)),
    }),
    [step, totalSteps],
  );

  return api;
}
