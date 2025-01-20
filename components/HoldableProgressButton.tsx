import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Text,
  GestureResponderEvent,
  TouchableOpacity,
} from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';

type HoldableProgressButtonProps = {
  label: string;
  onHoldComplete: () => void;
  holdDuration?: number; // in milliseconds
  backgroundColor?: string;
  progressColor?: string;
  textColor?: string;
  invertedTextColor?: string;
  buttonStyle?: object;
  labelStyle?: object;
};

const HoldableProgressButton: React.FC<HoldableProgressButtonProps> = ({
  label,
  onHoldComplete,
  holdDuration = 3000,
  backgroundColor = 'yellow',
  progressColor = 'black',
  textColor = 'black',
  invertedTextColor = 'yellow',
  buttonStyle = {},
  labelStyle = {},
}) => {
  const animation = useRef(new Animated.Value(0)).current;
  const holdTimeout = useRef<NodeJS.Timeout | null>(null);

  const startHold = (event: GestureResponderEvent) => {
    // Animate progress
    Animated.timing(animation, {
      toValue: 1,
      duration: holdDuration,
      useNativeDriver: false,
    }).start();

    // Trigger callback after hold duration
    holdTimeout.current = setTimeout(() => {
      onHoldComplete();
    }, holdDuration);
  };

  const cancelHold = () => {
    // Stop and reset the animation
    Animated.timing(animation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();

    if (holdTimeout.current) {
      clearTimeout(holdTimeout.current);
      holdTimeout.current = null;
    }
  };

  const progressWidth = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={startHold}
      onPressOut={cancelHold}
      style={[styles.button, { backgroundColor }, buttonStyle]}
    >
      {/* Progress Overlay */}
      <Animated.View
        style={[
          styles.progressOverlay,
          { backgroundColor: progressColor, width: progressWidth },
        ]}
      />

      {/* Masked Text */}
      <MaskedView
        style={StyleSheet.absoluteFillObject}
        maskElement={
          <View style={StyleSheet.absoluteFillObject}>
            <Animated.View
              style={[styles.textMask, { width: progressWidth }]}
            />
            <Text
          style={[
            styles.text,
            { color: invertedTextColor, position: 'absolute', top: 15 },
            labelStyle,
          ]}
        >
          {label}
        </Text>
          </View>
        }
      >
        
        {/* Inverted Text */}
      </MaskedView>
        

      {/* Normal Text */}
      <Text
        style={[
          styles.text,
          { color: textColor, position: 'absolute' },
          labelStyle,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 200,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressOverlay: {
    ...StyleSheet.absoluteFillObject,
    // zIndex: 1,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    zIndex: 2,
  },
  textMask: {
    height: '100%',
    backgroundColor: 'black',
  },
});

export default HoldableProgressButton;
