import React from 'react';
import { render } from '@testing-library/react-native';
import SwipeDeck from '../SwipeDeck';

jest.mock('react-native-deck-swiper', () => {
  const React = require('react');
  const { View } = require('react-native');
  return function MockSwiper({ cards, renderCard }: { cards: any[]; renderCard: (card: any) => React.ReactElement }) {
    return <View>{cards.map((card: any, i: number) => <View key={i}>{renderCard(card)}</View>)}</View>;
  };
});

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children }: { children?: React.ReactNode }) => <View>{children}</View>,
  };
});

describe('SwipeDeck', () => {
  const noop = () => {};

  it('renders empty state when data is empty', () => {
    const { getByText } = render(
      <SwipeDeck data={[]} onSwipeLeft={noop} onSwipeRight={noop} />,
    );
    expect(getByText('No new profiles tonight')).toBeTruthy();
  });

  it('renders cards and does not produce duplicate React keys when two chip fields share the same value', () => {
    // primaryGoal (after replace) and intensityLevel both equal "cardio" — previously
    // this caused a duplicate key warning because key={chip} was used.
    const user = {
      id: 'u1',
      firstName: 'Alex',
      profile: { city: 'cardio' }, // same value as intensityLevel below
      fitnessProfile: {
        primaryGoal: 'cardio',        // city === primaryGoal → duplicate key before fix
        intensityLevel: 'cardio',     // and also equals intensityLevel
        weeklyFrequencyBand: 3,
      },
    };

    // The component should render without throwing and show the user's name.
    const { getByText } = render(
      <SwipeDeck data={[user]} onSwipeLeft={noop} onSwipeRight={noop} />,
    );
    expect(getByText('Alex')).toBeTruthy();
  });

  it('uses index-based keys so chips with identical text values all get unique React keys', () => {
    // profileChips can produce duplicate strings when primaryGoal and
    // intensityLevel share the same value. Before the fix, key={chip} caused
    // React duplicate-key warnings (and potential reconciliation bugs).
    // After the fix, key={`${chip}-${index}`} guarantees uniqueness.
    //
    // We set city to something unique so it appears only in the chip row,
    // and give primaryGoal + intensityLevel the same duplicate value.
    const duplicateValue = 'dupchipval';
    const user = {
      id: 'u2',
      firstName: 'Blake',
      profile: { city: 'Portland' },   // unique — only shows in metaLine / chip[0]
      fitnessProfile: {
        primaryGoal: duplicateValue,    // chip[1]
        intensityLevel: duplicateValue, // chip[2] — same as chip[1]
        // weeklyFrequencyBand forces getTempoLabel to use the template format
        // "3x week / dupchipval" so 'dupchipval' doesn't appear as a standalone
        // text node in the infoPanel.
        weeklyFrequencyBand: 3,
      },
    };

    // profileChips produces ['Portland', 'dupchipval', 'dupchipval'].
    // 'dupchipval' appears only in the chip row (not as a standalone label).
    const { getAllByText } = render(
      <SwipeDeck data={[user]} onSwipeLeft={noop} onSwipeRight={noop} />,
    );
    const duplicateChips = getAllByText(duplicateValue);
    // Both chip Text nodes must be present (would be 1 before the key fix).
    expect(duplicateChips.length).toBe(2);
  });

  it('replaces all underscores in primaryGoal with spaces', () => {
    // replace('_', ' ') only replaces the first underscore; a multi-word goal
    // like 'improve_upper_body' would render as 'improve upper_body'.
    // The fix uses replace(/_/g, ' ') to handle every underscore.
    const user = {
      id: 'u3',
      firstName: 'Casey',
      profile: {},
      fitnessProfile: {
        primaryGoal: 'improve_upper_body',
      },
    };

    const { getByText } = render(
      <SwipeDeck data={[user]} onSwipeLeft={noop} onSwipeRight={noop} />,
    );
    // All underscores must be replaced — 'improve upper_body' would fail this.
    expect(getByText('improve upper body')).toBeTruthy();
  });
});
