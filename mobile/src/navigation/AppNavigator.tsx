import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthStore } from "../store/authStore";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import ChatScreen from "../screens/ChatScreen";
import ProfileDetailScreen from "../screens/ProfileDetailScreen";
import { ActivityIndicator, View } from "react-native";
import EventDetailScreen from "../screens/EventDetailScreen";
import MyEventsScreen from "../screens/MyEventsScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import AppBackdrop from "../components/ui/AppBackdrop";
import { useTheme } from "../theme/useTheme";
import CodexPreviewScreen from "../screens/CodexPreviewScreen";

import MainTabNavigator from "./MainTabNavigator";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const theme = useTheme();
  const screenshotMode = process.env.EXPO_PUBLIC_SCREENSHOT_MODE === "1";
  const previewSurfacesMode =
    __DEV__ && process.env.EXPO_PUBLIC_PREVIEW_SURFACES === "1";
  const token = useAuthStore((state) => state.token);
  const isLoading = useAuthStore((state) => state.isLoading);
  const loadToken = useAuthStore((state) => state.loadToken);

  useEffect(() => {
    if (screenshotMode || previewSurfacesMode) {
      return;
    }
    loadToken();
  }, [loadToken, previewSurfacesMode, screenshotMode]);

  if (screenshotMode || previewSurfacesMode) {
    return (
      <NavigationContainer>
        {previewSurfacesMode ? <CodexPreviewScreen /> : <MainTabNavigator previewMode />}
      </NavigationContainer>
    );
  }

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
        <AppBackdrop />
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
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
  );
}
