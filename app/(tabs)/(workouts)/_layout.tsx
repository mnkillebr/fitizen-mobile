import { Stack } from "expo-router";

export default function WorkoutsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[workoutId]" options={{ headerShown: false, /*presentation: 'card'*/ }} />
    </Stack>
  );
}