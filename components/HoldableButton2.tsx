import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, GestureResponderEvent } from 'react-native';
import { Button } from 'react-native-paper';
import Svg, { Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

type HoldableButtonProps = {
  label: string;
  icon: string;
  onHoldComplete: () => void;
  holdDuration?: number; // in milliseconds
  height?: number; // Button height
  width?: number; // Button width
  borderRadius?: number; // Button border radius
  buttonStyle?: object;
  labelStyle?: object;
  iconStyle?: object;
  pathStyle?: object;
  shadowStyle?: {
    shadowColor?: string;
    shadowOffset?: { width: number; height: number };
    shadowOpacity?: number;
    shadowRadius?: number;
    elevation?: number;
  };
};

const HoldableButtonRect: React.FC<HoldableButtonProps> = ({
  label,
  icon,
  onHoldComplete,
  holdDuration = 3000,
  height = 50,
  width = 100,
  borderRadius = 16,
  buttonStyle = {},
  labelStyle = {},
  iconStyle = {},
  pathStyle = {},
  shadowStyle = {},
}) => {
  const [holding, setHolding] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const holdTimeout = useRef<NodeJS.Timeout | null>(null);

  // Calculate the perimeter of the rounded rectangle
  const RECT_PERIMETER =
    2 * (width - 2 * borderRadius) +
    2 * (height - 2 * borderRadius) +
    2 * Math.PI * borderRadius;

  // Create the rounded rectangle path
  const createRoundedRectPath = (
    width: number,
    height: number,
    borderRadius: number
  ) => {
    return `
      M ${borderRadius},0
      H ${width - borderRadius}
      A ${borderRadius},${borderRadius} 0 0 1 ${width},${borderRadius}
      V ${height - borderRadius}
      A ${borderRadius},${borderRadius} 0 0 1 ${width - borderRadius},${height}
      H ${borderRadius}
      A ${borderRadius},${borderRadius} 0 0 1 0,${height - borderRadius}
      V ${borderRadius}
      A ${borderRadius},${borderRadius} 0 0 1 ${borderRadius},0
      Z
    `;
  };

  useEffect(() => {
    const listenerId = animation.addListener(({ value }) => {
      console.log('Current strokeDashoffset value:', value);
    });
    return () => {
      animation.removeListener(listenerId);
    };
  }, [animation]);

  const startHold = (event: GestureResponderEvent) => {
    setHolding(true);

    // Animate strokeDashoffset
    Animated.timing(animation, {
      toValue: RECT_PERIMETER,
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
    inputRange: [0, RECT_PERIMETER],
    outputRange: [RECT_PERIMETER, 0], // Correct direction for the tracing effect
  });

  return (
    <View style={[styles.container, { height, width }]}>
      <Svg
        height={height}
        width={width}
        style={[StyleSheet.absoluteFillObject, pathStyle]}
      >
        <AnimatedPath
          d={createRoundedRectPath(width, height, borderRadius)}
          stroke="blue"
          strokeWidth={12}
          strokeDasharray={`${RECT_PERIMETER} ${RECT_PERIMETER}`}
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
          { borderRadius, height, width },
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
    position: 'relative',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    borderRadius: 16,
    width: 100,
    height: 50,
    justifyContent: 'center',
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

export default HoldableButtonRect;
