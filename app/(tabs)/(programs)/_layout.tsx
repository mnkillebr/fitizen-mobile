import { Stack } from "expo-router";

export default function ProgramsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[programId]" options={{ headerShown: false }} />
      <Stack.Screen name="programWorkout" options={{ headerShown: false }} />
      <Stack.Screen name="reviewProgramWorkout" options={{ headerShown: false }} />
      <Stack.Screen name="viewLog" options={{ headerShown: false }} />
    </Stack>
  );
}