import React from 'react';
import { Text, View } from 'react-native';
import { Chip, SectionBlock } from '../../../design/primitives';
import { createStyles as styles } from './create.styles';
import { SKILL_OPTIONS, TIME_OPTIONS, WHEN_OPTIONS } from './create.helpers';

export function CreateTimingSection({
  onChangeSpots,
  onSelectSkill,
  onSelectTime,
  onSelectWhen,
  selectedTime,
  selectedWhen,
  skillLevel,
  spots,
  timingError,
}: {
  onChangeSpots?: (value: number) => void;
  onSelectSkill: (value: string) => void;
  onSelectTime: (value: string) => void;
  onSelectWhen: (value: string) => void;
  selectedTime: string;
  selectedWhen: string;
  skillLevel: string;
  spots?: number;
  timingError?: string;
}) {
  return (
    <>
      <SectionBlock eyebrow="When?" spacingMode="tight">
        <View style={styles.pillRow}>
          {WHEN_OPTIONS.map((option) => (
            <Chip
              key={option}
              label={option}
              active={selectedWhen === option}
              onPress={() => onSelectWhen(option)}
            />
          ))}
        </View>
        <View style={[styles.pillRow, { marginTop: 12 }]}>
          {TIME_OPTIONS.map((option) => (
            <Chip
              key={option}
              label={option}
              active={selectedTime === option}
              onPress={() => onSelectTime(option)}
            />
          ))}
        </View>
        {timingError ? <Text style={styles.inlineError}>{timingError}</Text> : null}
      </SectionBlock>

      <SectionBlock eyebrow="Skill level" spacingMode="tight">
        <View style={styles.pillRow}>
          {SKILL_OPTIONS.map((option) => (
            <Chip
              key={option}
              label={option}
              active={skillLevel === option}
              onPress={() => onSelectSkill(option)}
            />
          ))}
        </View>
      </SectionBlock>
      {typeof spots === 'number' && onChangeSpots ? (
        <SectionBlock eyebrow="Spots available" spacingMode="tight">
          <View style={styles.stepperRow}>
            <Chip label="Less" onPress={() => onChangeSpots(Math.max(1, spots - 1))} />
            <View style={styles.stepperValueWrap}>
              <Text style={styles.stepperValue}>{spots}</Text>
              <Text style={styles.stepperSub}>open spots</Text>
            </View>
            <Chip label="More" onPress={() => onChangeSpots(Math.min(10, spots + 1))} />
          </View>
        </SectionBlock>
      ) : null}
    </>
  );
}
