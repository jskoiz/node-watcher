import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import CreateScreen from '../screens/CreateScreen';
import MatchesScreen from '../screens/MatchesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Text, View, Platform } from 'react-native';
import { useTheme } from '../theme/useTheme';

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  Discover: { active: '✦', inactive: '✧' },
  Explore:  { active: '◈', inactive: '◇' },
  Create:   { active: '⊕', inactive: '⊕' },
  Inbox:    { active: '✉', inactive: '✉' },
  You:      { active: '◉', inactive: '○' },
};

function TabIcon({ routeName, focused }: { routeName: string; focused: boolean }) {
  const theme = useTheme();
  const icons = TAB_ICONS[routeName] ?? { active: '•', inactive: '·' };
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text
        style={{
          fontSize: focused ? 18 : 16,
          color: focused ? theme.primary : theme.textMuted,
          lineHeight: 22,
          // Subtle glow via text shadow not directly supported, but opacity differentiation works
        }}
      >
        {focused ? icons.active : icons.inactive}
      </Text>
    </View>
  );
}

export default function MainTabNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          // Shadow instead of top border
          shadowColor: '#000000',
          shadowOpacity: 0.30,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: -4 },
          elevation: 16,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.2,
          marginTop: 2,
        },
        tabBarIcon: ({ focused }) => <TabIcon routeName={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Discover" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Create" component={CreateScreen} />
      <Tab.Screen name="Inbox" component={MatchesScreen} />
      <Tab.Screen name="You" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
