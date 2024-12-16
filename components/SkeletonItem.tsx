import { Animated, StyleSheet, View } from 'react-native';
import { Surface } from 'react-native-paper';
import { useEffect, useRef } from 'react';

export function SkeletonItem() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View style={{ opacity }}>
      <Surface style={styles.skeleton} elevation={0}><View /></Surface>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    height: 224,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: '#E1E1E1',
  },
});