import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, GestureResponderEvent } from 'react-native';
import { Button } from 'react-native-paper';
import Svg, { Circle as StaticCircle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(StaticCircle);

type HoldableButtonProps = {
  label: string;
  icon: string;
  onHoldComplete: () => void;
  holdDuration?: number; // in milliseconds
  buttonStyle?: object;
  labelStyle?: object;
  iconStyle?: object;
  circleStyle?: object;
  shadowStyle?: {
    shadowColor?: string;
    shadowOffset?: { width: number; height: number };
    shadowOpacity?: number;
    shadowRadius?: number;
    elevation?: number;
  };
};

const HoldableButton: React.FC<HoldableButtonProps> = ({
  label,
  icon,
  onHoldComplete,
  holdDuration = 3000,
  buttonStyle = {},
  labelStyle = {},
  iconStyle = {},
  circleStyle = {},
  shadowStyle = {},
}) => {
  const [holding, setHolding] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const holdTimeout = useRef<NodeJS.Timeout | null>(null);

  const RADIUS = 40; // Radius of the circle
  const STROKE_WIDTH = 12;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  useEffect(() => {
    const listenerId = animation.addListener(({ value }) => {
      console.log('Current strokeDashoffset value:', value); // Log intermediate values
    });
    return () => {
      animation.removeListener(listenerId); // Cleanup listener on unmount
    };
  }, [animation]);

  const startHold = (event: GestureResponderEvent) => {
    setHolding(true);

    // Animate strokeDashoffset
    Animated.timing(animation, {
      toValue: CIRCUMFERENCE,
      duration: holdDuration,
      useNativeDriver: false,
    }).start();

    // Set hold timeout
    holdTimeout.current = setTimeout(() => {
      onHoldComplete();
      setHolding(false);
    }, holdDuration);
  };

  const cancelHold = () => {
    setHolding(false);

    // Reset animation
    Animated.timing(animation, {
      toValue: 0,
      duration: 200, // Smooth reset
      useNativeDriver: false,
    }).start();

    // Clear hold timeout
    if (holdTimeout.current) {
      clearTimeout(holdTimeout.current);
      holdTimeout.current = null;
    }
  };

  const strokeDashoffset = animation.interpolate({
    inputRange: [0, CIRCUMFERENCE],
    outputRange: [CIRCUMFERENCE, 0], // Correct direction for the drawing effect
  });

  return (
    <View style={styles.container}>
      <Svg height="100" width="100" style={[styles.svgContainer, circleStyle]}>
        <AnimatedCircle
          cx="50"
          cy="50"
          r={RADIUS}
          stroke="blue"
          strokeWidth={STROKE_WIDTH}
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeDashoffset={strokeDashoffset}
          fill="none"
        />
      </Svg>
      <Button
        mode="contained"
        icon={icon}
        onPressIn={startHold}
        onPressOut={cancelHold}
        contentStyle={[styles.buttonContent]}
        labelStyle={[styles.label, labelStyle]}
        style={[
          styles.button,
          buttonStyle,
          {
            ...styles.shadow,
            ...shadowStyle,
          },
        ]}
      >
        {label}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  svgContainer: {
    position: 'absolute',
  },
  button: {
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default HoldableButton;