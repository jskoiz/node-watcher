import React from 'react';
import { Controller, type Control, type FieldPathByValue, type FieldValues } from 'react-hook-form';
import { Input } from '../../design/primitives';

type InputProps = React.ComponentProps<typeof Input>;

type ControlledInputFieldProps<TFieldValues extends FieldValues> = Omit<
  InputProps,
  'editable' | 'error' | 'onBlur' | 'onChangeText' | 'value'
> & {
  control: Control<TFieldValues>;
  name: FieldPathByValue<TFieldValues, string>;
  disabled?: boolean;
  onChangeTextTransform?: (
    nextValue: string,
    onChange: (value: string) => void,
  ) => void;
};

export function ControlledInputField<TFieldValues extends FieldValues>({
  control,
  disabled,
  name,
  onChangeTextTransform,
  ...inputProps
}: ControlledInputFieldProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
        <Input
          {...inputProps}
          value={value}
          onBlur={onBlur}
          onChangeText={(nextValue) => {
            if (onChangeTextTransform) {
              onChangeTextTransform(nextValue, onChange);
              return;
            }
            onChange(nextValue);
          }}
          editable={!disabled}
          error={error?.message}
        />
      )}
    />
  );
}
