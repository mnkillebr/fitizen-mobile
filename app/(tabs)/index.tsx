import { Redirect } from "expo-router";

export default function Index() {
  // Redirect to the programs index page
  return <Redirect href="/(programs)" />;
}
