import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { View, Text } from "react-native";
import { IconButton } from "react-native-paper";

export default function ProgramDetail() {
  const { programId } = useLocalSearchParams();
  const {
    data: program,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['program', programId.toString()],
    queryFn: () => api.programs.programDetail(programId.toString())
  });
  console.log("program", program)

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
          title: program?.name || 'Program Details'
        }}
      />
      <ThemedView>
        <ThemedText>Program Detail</ThemedText>
      </ThemedView>
    </>
  )
}