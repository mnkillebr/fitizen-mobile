import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/useColorScheme';
import { QueryProvider } from '@/providers/query-provider';
import { store } from '@/redux/store';
import { AuthProvider } from '@/providers/auth-provider';
import DeepLinkHandler from '@/providers/deep-links';
import { BottomSheetProvider } from '@/providers/bottom-sheet-provider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <QueryProvider>
          <AuthProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <BottomSheetProvider>
                <DeepLinkHandler />
                <Slot />
                <StatusBar style="auto" />
              </BottomSheetProvider>
            </GestureHandlerRootView>
          </AuthProvider>
        </QueryProvider>
      </ThemeProvider>
    </Provider>
  );
}
