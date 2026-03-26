import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { useStepFlow } from '../useStepFlow';

function StepFlowHarness() {
  const { goBack, goNext, goToStep, isFirstStep, isLastStep, step, totalSteps } = useStepFlow({
    totalSteps: 3,
  });

  return (
    <View>
      <Text>{`step:${step}`}</Text>
      <Text>{`total:${totalSteps}`}</Text>
      <Text>{`first:${String(isFirstStep)}`}</Text>
      <Text>{`last:${String(isLastStep)}`}</Text>
      <Pressable onPress={goBack}>
        <Text>back</Text>
      </Pressable>
      <Pressable onPress={goNext}>
        <Text>next</Text>
      </Pressable>
      <Pressable onPress={() => goToStep(10)}>
        <Text>jump-end</Text>
      </Pressable>
      <Pressable onPress={() => goToStep(-3)}>
        <Text>jump-start</Text>
      </Pressable>
    </View>
  );
}

function DynamicStepFlowHarness({ totalSteps }: { totalSteps: number }) {
  const { goBack, goNext, goToStep, isFirstStep, isLastStep, step, totalSteps: total } = useStepFlow({
    totalSteps,
  });

  return (
    <View>
      <Text>{`step:${step}`}</Text>
      <Text>{`total:${total}`}</Text>
      <Text>{`first:${String(isFirstStep)}`}</Text>
      <Text>{`last:${String(isLastStep)}`}</Text>
      <Pressable onPress={goBack}>
        <Text>back</Text>
      </Pressable>
      <Pressable onPress={goNext}>
        <Text>next</Text>
      </Pressable>
      <Pressable onPress={() => goToStep(10)}>
        <Text>jump-end</Text>
      </Pressable>
      <Pressable onPress={() => goToStep(-3)}>
        <Text>jump-start</Text>
      </Pressable>
    </View>
  );
}

describe('useStepFlow', () => {
  it('clamps navigation to the first and last step', () => {
    render(<StepFlowHarness />);

    expect(screen.getByText('step:0')).toBeTruthy();
    expect(screen.getByText('first:true')).toBeTruthy();
    expect(screen.getByText('last:false')).toBeTruthy();

    fireEvent.press(screen.getByText('back'));
    expect(screen.getByText('step:0')).toBeTruthy();

    fireEvent.press(screen.getByText('next'));
    fireEvent.press(screen.getByText('next'));

    expect(screen.getByText('step:2')).toBeTruthy();
    expect(screen.getByText('first:false')).toBeTruthy();
    expect(screen.getByText('last:true')).toBeTruthy();

    fireEvent.press(screen.getByText('next'));
    expect(screen.getByText('step:2')).toBeTruthy();

    fireEvent.press(screen.getByText('jump-start'));
    expect(screen.getByText('step:0')).toBeTruthy();

    fireEvent.press(screen.getByText('jump-end'));
    expect(screen.getByText('step:2')).toBeTruthy();
  });

  it('treats totalSteps <= 0 as last step', () => {
    render(<DynamicStepFlowHarness totalSteps={0} />);

    expect(screen.getByText('step:0')).toBeTruthy();
    expect(screen.getByText('last:true')).toBeTruthy();
    expect(screen.getByText('first:true')).toBeTruthy();
  });

  it('clamps step when totalSteps shrinks below current step', () => {
    const { rerender } = render(<DynamicStepFlowHarness totalSteps={5} />);

    fireEvent.press(screen.getByText('jump-end'));
    expect(screen.getByText('step:4')).toBeTruthy();

    rerender(<DynamicStepFlowHarness totalSteps={2} />);
    expect(screen.getByText('step:1')).toBeTruthy();
    expect(screen.getByText('last:true')).toBeTruthy();
  });
});
