import React from 'react';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { Text, TouchableOpacity, View } from 'react-native';
import { LocationField } from '../../../components/form/LocationField';
import { Input, SectionBlock } from '../../../design/primitives';
import type { CreateEventFormValues } from '../schema';
import { createStyles as styles } from './create.styles';
import { createDetailsStyles as detailStyles } from './createDetails.styles';

export function CreateDetailsSection({
  control,
  errors,
  isSubmitting,
  onChangeSpots,
  onClearError,
  spots,
  hideSpots = false,
  knownLocationSuggestions = [],
}: {
  control: Control<CreateEventFormValues>;
  errors: FieldErrors<CreateEventFormValues>;
  isSubmitting: boolean;
  knownLocationSuggestions?: import('../../locations/locationSuggestions').LocationSuggestion[];
  onChangeSpots: (value: number) => void;
  onClearError: () => void;
  spots: number;
  hideSpots?: boolean;
}) {
  return (
    <>
      <SectionBlock eyebrow="Where?" spacingMode="tight">
        <Controller
          control={control}
          name="where"
          render={({ field: { onChange, value } }) => (
            <LocationField
              kind="place"
              label="Where"
              knownSuggestions={knownLocationSuggestions}
              placeholder="Runyon Canyon, Venice Beach..."
              value={value}
              onChangeText={(nextValue) => {
                onClearError();
                onChange(nextValue);
              }}
              error={errors.where?.message}
              sheetTitle="Choose a location"
              sheetSubtitle="Search recent, known, or curated BRDG-friendly places, or keep the text you type."
            />
          )}
        />
      </SectionBlock>

      {!hideSpots ? (
      <SectionBlock eyebrow="Spots available" spacingMode="tight">
        <View style={styles.stepperRow}>
          <TouchableOpacity
            style={detailStyles.stepperBtn}
            onPress={() => onChangeSpots(Math.max(1, spots - 1))}
            activeOpacity={0.7}
            disabled={isSubmitting}
          >
            <Text style={detailStyles.stepperBtnText}>-</Text>
          </TouchableOpacity>
          <View style={styles.stepperValueWrap}>
            <Text style={styles.stepperValue}>{spots}</Text>
            <Text style={styles.stepperSub}>open spots</Text>
          </View>
          <TouchableOpacity
            style={detailStyles.stepperBtn}
            onPress={() => onChangeSpots(Math.min(10, spots + 1))}
            activeOpacity={0.7}
            disabled={isSubmitting}
          >
            <Text style={detailStyles.stepperBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </SectionBlock>
      ) : null}

      <SectionBlock eyebrow="Add a note" spacingMode="tight">
        <Controller
          control={control}
          name="note"
          render={({ field: { onBlur, onChange, value } }) => (
            <Input
              style={[detailStyles.textInput, detailStyles.textArea]}
              placeholder="Easy pace, bring water, no experience needed..."
              value={value}
              onBlur={onBlur}
              onChangeText={(nextValue) => {
                onClearError();
                onChange(nextValue);
              }}
              multiline
              numberOfLines={3}
              blurOnSubmit
              autoCapitalize="sentences"
              autoCorrect
              maxLength={280}
            />
          )}
        />
        {errors.note?.message ? <Text style={styles.inlineError}>{errors.note.message}</Text> : null}
      </SectionBlock>
    </>
  );
}
