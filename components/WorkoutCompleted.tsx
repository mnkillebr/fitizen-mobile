import LottieView from "lottie-react-native"
import { View } from "react-native"
import { IconButton } from "react-native-paper"
import { ThemedText } from "./ThemedText"
import { Colors } from "@/constants/Colors"
import { useColorScheme } from "@/hooks/useColorScheme"
import { useEffect, useRef } from "react"

export interface WorkoutCompleteHandle extends LottieView {}

interface WorkoutCompletedProps {
  workoutName: string;
  closeDialog: () => void;
}

export function WorkoutCompleted({ workoutName, closeDialog }: WorkoutCompletedProps) {
  const colorScheme = useColorScheme();
  const animationRef = useRef<LottieView>(null);
  useEffect(() => {
    animationRef.current?.play(6, 54);
  }, []);
  return (
    <View className="flex-col items-center">
      <View className="absolute -top-28">
        <View
          className="absolute inset-x-full z-10"
        >
          <IconButton
            icon="close"
            iconColor="black"
            style={{ backgroundColor: Colors[colorScheme ?? 'light'].tint }}
            onPress={closeDialog}
          />
        </View>
        <LottieView
          ref={animationRef}
          source={require("@/assets/animations/high_five_animation.lottie")}
          style={{width: 200, height: 200, }}
          autoPlay
          // loop={false}
        />
      </View>
      <View className="items-center mt-28">
        <ThemedText className="text-xl font-semibold mb-2">Congrats!</ThemedText>
        <ThemedText className="text-center mb-2">You completed {workoutName}</ThemedText>
        <ThemedText className="">Keep it up! 💪</ThemedText>
      </View>
    </View>
  )
}