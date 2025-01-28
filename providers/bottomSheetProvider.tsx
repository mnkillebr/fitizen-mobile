import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { StyleSheet, Pressable, View, Dimensions,  Keyboard, KeyboardEvent, Platform, TextInput } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  runOnJS,
  withTiming
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT * 0.2; // 50% of screen height
const MIN_TRANSLATE_Y = 0;
const SPRING_CONFIG = {
  damping: 50,
  mass: 0.3,
  stiffness: 120,
};

type BottomSheetContextType = {
  open: () => void;
  close: () => void;
  setContent: (content: React.ReactNode) => void;
};

const BottomSheetContext = createContext<BottomSheetContextType | null>(null);

export function BottomSheetProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<React.ReactNode>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [firstName, setFirstName] = useState('');
  const colorScheme = useColorScheme();
  const translateY = useSharedValue(0);
  const context = useSharedValue({ y: 0 });
  const active = useSharedValue(false);
  const keyboardHeight = useSharedValue(0);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event: KeyboardEvent) => {
        keyboardHeight.value = event.endCoordinates.height;
        // Adjust sheet position with keyboard
        if (active.value) {
          translateY.value = withTiming(
            Math.min(translateY.value - event.endCoordinates.height, MAX_TRANSLATE_Y - event.endCoordinates.height),
            { duration: Platform.OS === 'ios' ? event.duration : 250 }
          );
        }
      }
    );

    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      (event: KeyboardEvent) => {
        keyboardHeight.value = 0;
        // Reset sheet position when keyboard hides
        if (active.value) {
          translateY.value = withTiming(
            MAX_TRANSLATE_Y,
            { duration: Platform.OS === 'ios' ? event.duration : 250 }
          );
        }
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const open = useCallback(() => {
    active.value = true;
    translateY.value = withSpring(MAX_TRANSLATE_Y, SPRING_CONFIG);
  }, []);

  const close = useCallback(() => {
    // Dismiss keyboard if it's open
    Keyboard.dismiss();
    translateY.value = withSpring(MIN_TRANSLATE_Y, SPRING_CONFIG, (finished) => {
      if (finished) {
        runOnJS(setContent)(null);
        active.value = false;
      }
    });
  }, []);

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      // If keyboard is open, adjust the constraints
      const minY = keyboardHeight.value > 0 ? 
        MAX_TRANSLATE_Y - keyboardHeight.value : 
        MAX_TRANSLATE_Y;
      
      translateY.value = Math.max(
        Math.min(context.value.y + event.translationY, MIN_TRANSLATE_Y),
        minY
      );
    })
    .onEnd((event) => {
      // Consider keyboard height when determining close threshold
      const adjustedThreshold = -SCREEN_HEIGHT * 0.25 - (keyboardHeight.value / 2);
      
      if (event.velocityY > 500 || translateY.value > adjustedThreshold) {
        runOnJS(close)();
      } else {
        // Snap to appropriate position based on keyboard
        const snapPoint = keyboardHeight.value > 0 ? 
          MAX_TRANSLATE_Y - keyboardHeight.value : 
          MAX_TRANSLATE_Y;
        translateY.value = withSpring(snapPoint, SPRING_CONFIG);
      }
    });

  const rBottomSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });
  
  return (
    <BottomSheetContext.Provider value={{ open, close, setContent }}>
      {children}
      {content && (
        <>
          <Pressable style={styles.backdrop} onPress={close} />
          <GestureDetector gesture={gesture}>
            <Animated.View style={[styles.bottomSheetContainer, rBottomSheetStyle, { backgroundColor: Colors[colorScheme ?? "light"].background }]}>
              <View style={styles.handleContainer} onTouchStart={Keyboard.dismiss}>
                <View style={[styles.handle, { backgroundColor: Colors[colorScheme ?? "light"].border }]} />
              </View>
              <View style={styles.content}>
                <ThemedView>
                  <ThemedText className='px-4'>Add Notes</ThemedText>
                  <View className='px-4 pb-4'>
                    <TextInput
                      style={[styles.input, isFocused && styles.inputFocused, { color: Colors[colorScheme ?? "light"].text }]}
                      placeholder="Add note(s) for current exercise..."
                      placeholderTextColor="#78716c"
                      value={firstName}
                      multiline
                      onChangeText={setFirstName}
                      selectionColor="#fff"
                      keyboardType="default"
                      autoCapitalize="none"
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                    />
                  </View>
                </ThemedView>
              </View>
            </Animated.View>
          </GestureDetector>
        </>
      )}
    </BottomSheetContext.Provider>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  bottomSheetContainer: {
    height: SCREEN_HEIGHT,
    width: '100%',
    position: 'absolute',
    top: SCREEN_HEIGHT,
    borderRadius: 25,
  },
  handleContainer: {
    height: 30,
    justifyContent: 'center',
  },
  handle: {
    width: 50,
    height: 4,
    // backgroundColor: '#00000040',
    alignSelf: 'center',
    marginVertical: 12,
    borderRadius: 2,
  },
  input: {
    height: 80,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    borderRadius: 8,
    paddingHorizontal: 8,
    color: "#fffd"
  },
  inputFocused: {
    borderColor: '#a16207',
  },
  content: {
    flex: 1,
    // padding: 16,
  },
});

export const useBottomSheet = () => {
  const context = useContext(BottomSheetContext);
  if (!context) {
    throw new Error('useBottomSheet must be used within a BottomSheetProvider');
  }
  return context;
};
