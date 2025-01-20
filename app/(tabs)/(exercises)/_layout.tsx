import { Stack } from "expo-router";

export default function ExercisesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[exerciseId]" options={{ headerShown: false, /*presentation: 'card'*/ }} />
    </Stack>
  );
}