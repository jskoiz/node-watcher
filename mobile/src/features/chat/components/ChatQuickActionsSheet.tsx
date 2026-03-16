import React from 'react';
import { Text, View } from 'react-native';
import { Button, Card } from '../../../design/primitives';
import { AppBottomSheet } from '../../../design/sheets/AppBottomSheet';
import { chatStyles as styles } from './chat.styles';

const QUICK_ACTIONS = [
  {
    key: 'suggest-activity',
    label: 'Suggest activity',
    message: 'Want to plan something active together this week?',
  },
  {
    key: 'plan-workout',
    label: 'Plan workout',
    message: "I'm down to plan a workout. What day works for you?",
  },
  {
    key: 'share-event',
    label: 'Share event idea',
    message: 'I found a BRDG event idea we could do together. Want to compare options?',
  },
] as const;

export function ChatQuickActionsSheet({
  onClose,
  onSelectMessage,
  refObject,
  visible,
}: {
  onClose: () => void;
  onSelectMessage: (message: string) => void;
  refObject: React.RefObject<any>;
  visible: boolean;
}) {
  return (
    <AppBottomSheet
      refObject={refObject}
      visible={visible}
      onClose={onClose}
      title="Quick actions"
      subtitle="Keep momentum without typing every opener from scratch."
      snapPoints={['46%']}
    >
      {QUICK_ACTIONS.map((action) => (
        <Card key={action.key} style={styles.quickActionCard}>
          <View style={styles.quickActionBody}>
            <Text style={styles.quickActionTitle}>{action.label}</Text>
            <Text style={styles.quickActionCopy}>{action.message}</Text>
            <Button label="Use message" onPress={() => onSelectMessage(action.message)} variant="secondary" />
          </View>
        </Card>
      ))}
    </AppBottomSheet>
  );
}
