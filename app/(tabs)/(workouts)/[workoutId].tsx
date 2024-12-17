import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { View, Text } from "react-native";
import { IconButton } from "react-native-paper";

export default function WorkoutDetail() {
  const { workoutId } = useLocalSearchParams();
  const {
    data: workout,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['workout', workoutId.toString()],
    queryFn: () => api.workouts.workoutDetail(workoutId.toString())
  });
  console.log("workout", workout)

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerLeft: () => (
            <IconButton
              icon="arrow-left"
              onPress={() => router.back()}
            />
          ),
          title: workout?.name || 'Workout Details'
        }}
      />
      <ThemedView>
        <ThemedText>Workout Detail</ThemedText>
      </ThemedView>
    </>
  )
}