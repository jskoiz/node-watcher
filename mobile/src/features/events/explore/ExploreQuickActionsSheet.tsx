import React from 'react';
import { Text, View } from 'react-native';
import { Button, Chip } from '../../../design/primitives';
import { AppBottomSheet } from '../../../design/sheets/AppBottomSheet';
import type { ExploreCategory } from './explore.data';
import { CATEGORIES } from './explore.data';
import { exploreStyles as styles } from './explore.styles';

export function ExploreQuickActionsSheet({
  activeCategory,
  onClose,
  onOpenCreate,
  onOpenMyEvents,
  onSelectCategory,
  refObject,
  visible,
}: {
  activeCategory: ExploreCategory;
  onClose: () => void;
  onOpenCreate: () => void;
  onOpenMyEvents: () => void;
  onSelectCategory: (category: ExploreCategory) => void;
  refObject: React.RefObject<any>;
  visible: boolean;
}) {
  return (
    <AppBottomSheet
      refObject={refObject}
      visible={visible}
      onClose={onClose}
      title="Explore actions"
      subtitle="Jump between browse modes and event actions."
      snapPoints={['58%']}
    >
      <View>
        <Text style={styles.sheetSectionLabel}>Category</Text>
        <View style={styles.sheetChipWrap}>
          {CATEGORIES.map((category) => (
            <Chip
              key={category}
              label={category}
              active={activeCategory === category}
              onPress={() => onSelectCategory(category)}
              accentColor="#7C6AF7"
            />
          ))}
        </View>
      </View>
      <View style={styles.sheetActionStack}>
        <Button label="Create event" onPress={onOpenCreate} variant="accent" />
        <Button label="My events" onPress={onOpenMyEvents} variant="secondary" />
      </View>
    </AppBottomSheet>
  );
}
