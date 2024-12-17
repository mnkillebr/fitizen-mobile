import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { View, Text } from "react-native";
import { IconButton } from "react-native-paper";

export default function ExerciseDetail() {
  const { exerciseId } = useLocalSearchParams();
  const {
    data: exercise,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['exercise', exerciseId.toString()],
    queryFn: () => api.exercises.exerciseDetail(exerciseId.toString())
  });
  console.log("exercise id", exerciseId, exercise)

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
          title: exercise?.name || 'Exercise Details'
        }}
      />
      <ThemedView>
        <ThemedText>Exercise Detail</ThemedText>
      </ThemedView>
    </>
  )
}