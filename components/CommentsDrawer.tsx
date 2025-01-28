// CommentsDrawer.tsx
import { useCallback, useRef, useEffect } from 'react';
import { View, Text, Keyboard, Dimensions, TextInput as RNTextInput } from 'react-native';
import { IconButton, TextInput } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler, GestureEvent, PanGestureHandlerEventPayload } from 'react-native-gesture-handler';
import { useDispatch } from 'react-redux';
import { setToggleHideTabs } from '@/redux/slices/uiSlice';

const DRAWER_HEIGHT = Dimensions.get('window').height * 0.4;
const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
};

interface CommentsDrawerProps {
  isVisible: boolean;
  onClose: () => void;
  // imageId: string;
}

export const CommentsDrawer = ({ isVisible, onClose }: CommentsDrawerProps) => {
  const dispatch = useDispatch();
  const translateY = useSharedValue(DRAWER_HEIGHT);
  const inputRef = useRef<RNTextInput>(null);
  
  const closeDrawer = useCallback(() => {
    translateY.value = withSpring(DRAWER_HEIGHT, SPRING_CONFIG, () => {
      onClose()
      dispatch(setToggleHideTabs());
    });
  }, [onClose, dispatch]);

  useEffect(() => {
    if (isVisible) {
      translateY.value = withSpring(0, SPRING_CONFIG);
      dispatch(setToggleHideTabs());
    }
  }, [isVisible, dispatch]);

  const onGestureEvent = (event: GestureEvent<PanGestureHandlerEventPayload>) => {
    const translationY = event.nativeEvent.translationY;
    translateY.value = Math.max(0, translationY);

    if (event.nativeEvent.state === 4) { // State.END
      if (translationY > DRAWER_HEIGHT * 0.3) {
        closeDrawer();
      } else {
        translateY.value = withSpring(0, SPRING_CONFIG);
      }
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <PanGestureHandler onGestureEvent={onGestureEvent}>
      <Animated.View 
        style={[
          {
            position: 'absolute',
            bottom: DRAWER_HEIGHT,
            left: 0,
            right: 0,
            height: DRAWER_HEIGHT,
            backgroundColor: 'white',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          },
          animatedStyle,
        ]}
      >
        {/* Rest of the component remains the same */}
        <View className="items-center pt-2">
          <View className="w-10 h-1 rounded-full bg-gray-300" />
        </View>

        <View className="flex-row justify-between items-center px-4 py-3">
          <Text className="text-lg font-semibold">Comments</Text>
          <IconButton
            icon="close"
            size={24}
            onPress={closeDrawer}
          />
        </View>

        <View className="flex-1 px-4">
          {/* Comments list placeholder */}
        </View>

        <View className="px-4 pb-6 pt-2 flex-row items-center border-t border-gray-200">
          <TextInput
            ref={inputRef}
            mode="outlined"
            placeholder="Add a comment..."
            className="flex-1 mr-2"
            dense
          />
          <IconButton
            icon="send"
            size={24}
            onPress={() => {
              Keyboard.dismiss();
            }}
          />
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
};