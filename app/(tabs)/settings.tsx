import { Image, StyleSheet, Platform, Text } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedSafeAreaView } from '@/components/ThemeSafeAreaView';

export default function SettingsScreen() {
  return (
    <ThemedSafeAreaView className='flex-1'>
      <ThemedView className='p-4'>
        <ThemedText className='font-bold'>Settings</ThemedText>
      </ThemedView>
    </ThemedSafeAreaView>
  );
}
