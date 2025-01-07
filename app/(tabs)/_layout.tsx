import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
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
          // title: 'Settings',
          // tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
          href: null
        }}
      />
    </Tabs>
  );
}
