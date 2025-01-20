import { Redirect, Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/providers/auth-provider';
import { ThemedView } from '@/components/ThemedView';
import * as Linking from 'expo-linking';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { loading, session } = useAuth();
  // const link = Linking.useLinkingURL()
  // const parsed = Linking.parse(link)
  // console.log("parsed", parsed)
  // useEffect(() => {
  //   const handleDeepLink = async (event) => {
  //     const { url } = event;
  //     const parsedUrl = Linking.parse(url);
  //     console.log(parsedUrl)
  //     // const encryptedData = parsedUrl.queryParams?.data;

  //     // if (encryptedData) {
  //     //   await validateMagicLink(encryptedData);
  //     // }
  //   };

  //   Linking.addEventListener('url', handleDeepLink);

  //   // return () => {
  //   //   Linking.removeEventListener('url', handleDeepLink);
  //   // };
  // }, []);

  // if (loading) {
  //   return (
  //     <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //       <ActivityIndicator size="large" />
  //     </ThemedView>
  //   );
  // }

  if (session === null) {
    return <Redirect href="/sign-in" />
  }

  return (
    <GestureHandlerRootView>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: 'absolute',
            },
            default: {},
          }),
        }}
        initialRouteName="(programs)"
      >
        <Tabs.Screen name="index" options={{ href: null }} redirect={true} />
        <Tabs.Screen
          name="(programs)"
          options={{
            title: 'Programs',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="table.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="(workouts)"
          options={{
            title: 'Workouts',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="figure.highintensity.intervaltraining" color={color} />,
          }}
        />
        <Tabs.Screen
          name="(exercises)"
          options={{
            title: 'Exercises',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.pages.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
            // href: null
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}
