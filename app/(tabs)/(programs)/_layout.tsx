import { Stack } from "expo-router";

export default function ProgramsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[programId]" options={{ headerShown: false }} />
    </Stack>
  );
}