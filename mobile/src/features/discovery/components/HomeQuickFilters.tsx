import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import AppIcon from '../../../components/ui/AppIcon';
import { homeStyles as styles } from './home.styles';
import { QUICK_FILTERS, type QuickFilterKey } from './discoveryFilters';

export function HomeQuickFilters({
  activeFilterCount,
  activeQuickFilter,
  onPressFilter,
  onPressRefine,
}: {
  activeFilterCount: number;
  activeQuickFilter: QuickFilterKey;
  onPressFilter: (filterId: QuickFilterKey) => void;
  onPressRefine: () => void;
}) {
  const refineLabelText = activeFilterCount > 0 ? String(activeFilterCount) : 'Refine';
  const refineAccessibilityLabel =
    activeFilterCount > 0
      ? `${activeFilterCount} active filters, refine your discovery feed`
      : 'Refine filters';
  const accessibilityValue = activeFilterCount > 0 ? { text: `${activeFilterCount} filters set` } : undefined;

  return (
    <View style={styles.filterBar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterPillsRow}
        style={styles.filterPillsScroll}
      >
        <Pressable
          onPress={onPressRefine}
          style={[styles.refineTrigger, { minHeight: 44 }]}
          accessibilityRole="button"
          accessibilityLabel={refineAccessibilityLabel}
          accessibilityValue={accessibilityValue}
          accessibilityHint="Opens filter options"
        >
          <AppIcon
            name="sliders"
            size={14}
            color={activeFilterCount > 0 ? '#2C2420' : '#B0A89E'}
          />
          <Text
            style={[
              styles.refineTriggerText,
              { color: activeFilterCount > 0 ? '#2C2420' : '#B0A89E' },
            ]}
          >
            {activeFilterCount > 0 ? `Refine (${refineLabelText})` : refineLabelText}
          </Text>
        </Pressable>

        {QUICK_FILTERS.map((filter) => {
          const active = activeQuickFilter === filter.id;

          return (
            <Pressable
              key={filter.id}
              onPress={() => onPressFilter(filter.id)}
              style={[styles.filterPill, active ? styles.filterPillActive : styles.filterPillInactive, { minHeight: 44, justifyContent: 'center' }]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Filter by ${filter.label}`}
            >
              <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
