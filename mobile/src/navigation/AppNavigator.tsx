import React, { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import {
  DefaultTheme,
  NavigationContainer,
  type NavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Notifications from "expo-notifications";
import { useAuthStore } from "../store/authStore";
import type { RootStackParamList } from "../core/navigation/types";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import ChatScreen from "../screens/ChatScreen";
import ProfileDetailScreen from "../screens/ProfileDetailScreen";
import { ActivityIndicator, View } from "react-native";
import EventDetailScreen from "../screens/EventDetailScreen";
import MyEventsScreen from "../screens/MyEventsScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import { refreshUserLocation } from "../lib/location";

import MainTabNavigator from "./MainTabNavigator";
import { setUnauthorizedHandler } from "../api/authSession";
import { useTheme } from "../theme/useTheme";
import { TabBarVisibilityProvider } from "./TabBarVisibilityContext";
import {
  linkingConfig,
  handleNotificationNavigation,
  type NotificationData,
} from "../lib/deepLinks";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const token = useAuthStore((state) => state.token);
  const isLoading = useAuthStore((state) => state.isLoading);
  const loadToken = useAuthStore((state) => state.loadToken);
  const clearSession = useAuthStore((state) => state.clearSession);
  const theme = useTheme();
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: '#FDFBF8',
      card: '#FFFFFF',
      text: '#2C2420',
      border: '#E8E2DA',
      primary: '#C4A882',
      notification: theme.accent,
    },
  };

  useEffect(() => {
    const cleanupUnauthorizedHandler = setUnauthorizedHandler(clearSession);
    loadToken();

    return cleanupUnauthorizedHandler;
  }, [clearSession, loadToken]);

  // Handle app-killed-state launches: check the last notification response on boot.
  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (cancelled || !response) return;
      const data = response.notification.request.content.data as unknown as
        | NotificationData
        | undefined;
      if (data && navigationRef.current) {
        handleNotificationNavigation(data, navigationRef.current);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [token]);

  // Refresh user location on initial auth and whenever the app comes to the foreground.
  useEffect(() => {
    if (!token) return;

    // Fire once on mount (login / app launch).
    void refreshUserLocation();

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active") {
        void refreshUserLocation();
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [token]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <TabBarVisibilityProvider>
    <NavigationContainer ref={navigationRef} linking={linkingConfig} theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
          animation: "default",
        }}
      >
        {token ? (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen
              name="ProfileDetail"
              component={ProfileDetailScreen}
            />
            <Stack.Screen name="EventDetail" component={EventDetailScreen} />
            <Stack.Screen name="MyEvents" component={MyEventsScreen} />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
    </TabBarVisibilityProvider>
  );
}
