import React from 'react';
import { View } from 'react-native';
import { SheetSelectField } from '../../../../components/form/SheetSelectField';
import { Card, SectionBlock } from '../../../../design/primitives';
import {
  INTENSITY_OPTIONS,
  PRIMARY_GOAL_OPTIONS,
  SCHEDULE_OPTIONS,
  WEEKLY_FREQUENCY_OPTIONS,
} from '../profile.helpers';
import { EditableField, TagPill } from '../ProfileSections';
import { profileStyles as styles } from '../profile.styles';

export function ProfileFitnessProfileSection({
  editMode,
  intensityLevel,
  onSetIntensityLevel,
  onSetPrimaryGoal,
  onSetWeeklyFrequencyBand,
  primaryGoal,
  weeklyFrequencyBand,
}: {
  editMode: boolean;
  intensityLevel: string;
  onSetIntensityLevel: (value: string) => void;
  onSetPrimaryGoal: (value: string) => void;
  onSetWeeklyFrequencyBand: (value: string) => void;
  primaryGoal: string;
  weeklyFrequencyBand: string;
}) {
  return (
    <SectionBlock eyebrow="Fitness profile">
      <Card style={styles.fieldsCard}>
        {editMode ? (
          <SheetSelectField
            label="Intensity"
            placeholder="Choose an intensity"
            options={INTENSITY_OPTIONS}
            value={intensityLevel}
            onSelect={onSetIntensityLevel}
            sheetTitle="Choose your training intensity"
          />
        ) : (
          <EditableField
            label="Intensity"
            value={intensityLevel}
            onChangeText={onSetIntensityLevel}
            placeholder="moderate"
            editMode={false}
          />
        )}
        <View style={styles.fieldDivider} />
        {editMode ? (
          <SheetSelectField
            label="Days / week"
            placeholder="Choose your weekly rhythm"
            options={WEEKLY_FREQUENCY_OPTIONS}
            value={weeklyFrequencyBand}
            onSelect={onSetWeeklyFrequencyBand}
            sheetTitle="How often do you move?"
          />
        ) : (
          <EditableField
            label="Days / week"
            value={weeklyFrequencyBand}
            onChangeText={onSetWeeklyFrequencyBand}
            placeholder="3-4"
            editMode={false}
          />
        )}
        <View style={styles.fieldDivider} />
        {editMode ? (
          <SheetSelectField
            label="Primary goal"
            placeholder="Choose your primary goal"
            options={PRIMARY_GOAL_OPTIONS}
            value={primaryGoal}
            onSelect={onSetPrimaryGoal}
            sheetTitle="Choose your primary goal"
          />
        ) : (
          <EditableField
            label="Primary goal"
            value={primaryGoal}
            onChangeText={onSetPrimaryGoal}
            placeholder="health"
            editMode={false}
          />
        )}
      </Card>
    </SectionBlock>
  );
}

export function ProfileScheduleSection({
  editMode,
  onSetSelectedSchedule,
  selectedSchedule,
}: {
  editMode: boolean;
  onSetSelectedSchedule: (value: string) => void;
  selectedSchedule: string[];
}) {
  return (
    <SectionBlock eyebrow="Schedule">
      <View style={styles.tagCloud}>
        {SCHEDULE_OPTIONS.map((tag) => (
          <TagPill
            key={tag}
            label={tag}
            selected={selectedSchedule.includes(tag)}
            onPress={() => editMode && onSetSelectedSchedule(tag)}
            color="#8BAA7A"
            interactive={editMode}
          />
        ))}
      </View>
    </SectionBlock>
  );
}
