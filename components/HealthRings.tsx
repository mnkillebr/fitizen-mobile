import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Image } from 'expo-image';

// Type definitions
interface Ring {
  value: number;
  color: string;
}

interface HealthRingsProps {
  rings: Ring[];
  size?: number;
  strokeWidth?: number;
  centerImage?: string;
  imageSize?: number;
  animationDuration?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const HealthRings: React.FC<HealthRingsProps> = ({
  rings = [],
  size = 200,
  strokeWidth = 20,
  centerImage,
  imageSize = 60,
  animationDuration = 1000,
}) => {
  // Validate and process rings
  const validRings = rings.slice(0, 3).map((ring) => ({
    ...ring,
    value: Math.min(Math.max(ring.value, 0), 1), // Clamp value between 0 and 1
  }));

  // Create animated values for each ring
  const animatedValues = useRef(
    validRings.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (validRings.length === 0) return;
    
    const animations = validRings.map((ring, index) =>
      Animated.timing(animatedValues[index], {
        toValue: ring.value,
        duration: animationDuration,
        useNativeDriver: true,
      })
    );

    Animated.parallel(animations).start();
  }, [validRings, animationDuration]);

  const center = size / 2;

  // Calculate ring positions
  // For concentric rings, we'll make the outer ring the largest and inner rings progressively smaller
  const calculateRadius = (index: number): number => {
    const maxRadius = (size - strokeWidth) / 2;
    // Each inner ring is smaller by one strokeWidth
    return maxRadius - (index * strokeWidth);
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {validRings.map((ring, index) => {
          const radius = calculateRadius(index);
          const circumference = 2 * Math.PI * radius;

          return (
            <G key={index} rotation="-90" origin={`${center}, ${center}`}>
              {/* Background circle */}
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={ring.color}
                strokeWidth={strokeWidth}
                opacity={0.2}
                fill="none"
              />
              {/* Animated progress circle */}
              <AnimatedCircle
                cx={center}
                cy={center}
                r={radius}
                stroke={ring.color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={animatedValues[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [circumference, 0],
                })}
              />
            </G>
          );
        })}
      </Svg>
      
      {/* Center image */}
      {centerImage && (
        <View style={[
          styles.imageContainer,
          {
            width: imageSize,
            height: imageSize,
            left: (size - imageSize) / 2,
            top: (size - imageSize) / 2,
          }
        ]}>
          <Image
            source={centerImage}
            style={styles.centerImage}
            contentFit="cover"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    position: 'absolute',
    borderRadius: 1000, // Large value to ensure circle
    overflow: 'hidden',
    // backgroundColor: '#fff',
  },
  centerImage: {
    width: '100%',
    height: '100%',
  },
});

export default HealthRings;
