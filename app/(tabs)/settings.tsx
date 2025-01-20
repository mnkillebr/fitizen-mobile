import { Image, StyleSheet, Platform, Text } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedSafeAreaView } from '@/components/ThemeSafeAreaView';
import LottieView from 'lottie-react-native';
import { useEffect, useRef } from 'react';
import { Button } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '@/providers/auth-provider';
import HoldableButton from '@/components/HoldableButton';
import HoldableButtonRect from '@/components/HoldableButton2';
import HoldableProgressButton from '@/components/HoldableProgressButton';

export default function SettingsScreen() {
  const { signOut } = useAuth()
  const animationRef = useRef<LottieView>(null);
  useEffect(() => {
    animationRef.current?.play();

    // Or set a specific startFrame and endFrame with:
    animationRef.current?.play(6, 54);
    // animationRef.current?.pause()
  }, []);
  const handleReview = () => {
    router.push({
      pathname: "/(tabs)/(workouts)/reviewWorkout",
      params: {
        workoutId: "cm5nd6oxg001qxilp7zg10vxf",
        previewImgUri: null,
        workoutName: "Full body sampler",
      }
    })
  }
  return (
    <ThemedSafeAreaView className='flex-1'>
      <ThemedView className='p-4'>
        <ThemedText className='font-bold'>Settings</ThemedText>
        {/* <LottieView
          ref={animationRef}
          source={require("@/assets/animations/high_five_animation.lottie")}
          style={{width: 200, height: 200}}
          autoPlay
          loop={false}
        /> */}
        <HoldableButton label="skip" icon="skip-next" onHoldComplete={() => console.log("Execute Order 66")} />
        <HoldableButtonRect label="skip" icon="skip-next" onHoldComplete={() => console.log("Execute Order 66")}/>
        <HoldableProgressButton label='skip to my lou' onHoldComplete={() => console.log("Execute Order 66")} />
        <Button onPress={handleReview}>
          Review Workout
        </Button>
        <Button onPress={signOut} style={{ backgroundColor: '#ffd700', borderRadius: 8 }} textColor='black'>
          Sign Out
        </Button>
      </ThemedView>
    </ThemedSafeAreaView>
  );
}
