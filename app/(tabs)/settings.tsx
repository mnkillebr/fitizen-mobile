import { Image, StyleSheet, Platform, Text, View, TextInput, Keyboard } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedSafeAreaView } from '@/components/ThemeSafeAreaView';
import LottieView from 'lottie-react-native';
import { useEffect, useRef, useState } from 'react';
import { Button } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '@/providers/auth-provider';
import HoldableButton from '@/components/HoldableButton';
import HoldableButtonRect from '@/components/HoldableButton2';
import HoldableProgressButton from '@/components/HoldableProgressButton';
import { useBottomSheet } from '@/providers/bottom-sheet-provider';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function SettingsScreen() {
  const { signOut } = useAuth()
  const { open, setContent } = useBottomSheet()
  const colorScheme = useColorScheme()
  const [isFocused, setIsFocused] = useState(false);
  const [firstName, setFirstName] = useState('');
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
  const handleReviewProgramWorkout = () => {
    router.push({
      pathname: "/(tabs)/(programs)/reviewProgramWorkout",
      params: {
        programId: "cm5nd6lud0005xilpb371955v",
        previewImgUri: "https://res.cloudinary.com/dqrk3drua/image/upload/f_auto,q_auto/v1/fitizen/qihappk1bjsgt7wvyec6",
        programName: "Intro Athletic Conditioning",
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
        <HoldableButton label="skip" icon="skip-next" holdDuration={1000} onHoldComplete={() => {
          // setContent(
          //   <ThemedView onTouchStart={Keyboard.dismiss}>
          //     <ThemedText className='px-4'>Testing</ThemedText>
          //     <View className='px-4 pb-4'>
          //       <TextInput
          //         style={[styles.input, isFocused && styles.inputFocused, { color: Colors[colorScheme ?? "light"].text }]}
          //         placeholder="First Name"
          //         placeholderTextColor="#78716c"
          //         value={firstName}
          //         onChangeText={setFirstName}
          //         selectionColor="#fff"
          //         keyboardType="default"
          //         autoCapitalize="none"
          //         onFocus={() => setIsFocused(true)}
          //         onBlur={() => setIsFocused(false)}
          //       />
          //     </View>
          //   </ThemedView>
          // )
          // setContent(true)
          open()
        }} />
        <HoldableButtonRect label="skip" icon="skip-next" onHoldComplete={() => console.log("Execute Order 66")}/>
        <HoldableProgressButton label='skip to my lou' onHoldComplete={() => console.log("Execute Order 66")} />
        <Button onPress={handleReview}>
          Review Workout
        </Button>
        <Button onPress={handleReviewProgramWorkout}>
          Review Program Workout
        </Button>
        <Button onPress={signOut} style={{ backgroundColor: '#ffd700', borderRadius: 8, }} textColor='black'>
          Sign Out
        </Button>
      </ThemedView>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  button: {
    backgroundColor: "#ffd700",
    borderRadius: 8,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  inputFocused: {
    borderColor: '#a16207',
  },
  message: {
    marginTop: 12,
    textAlign: 'center',
    color: 'red'
  },
});