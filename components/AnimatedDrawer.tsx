import React, { ReactNode, useEffect, useRef } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  ViewStyle,
} from 'react-native';

export interface DrawerPosition {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

export interface AnimatedDrawerProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  position?: DrawerPosition;
  drawerWidth?: number;
  backgroundColor?: string;
  showOverlay?: boolean;
  overlayColor?: string;
  animationDuration?: number;
  style?: ViewStyle;
}


const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AnimatedDrawer: React.FC<AnimatedDrawerProps> = ({
  children,
  isOpen,
  onClose,
  position = { bottom: 300 },
  drawerWidth = SCREEN_WIDTH,
  backgroundColor = '',
  showOverlay = true,
  overlayColor = 'rgba(0, 0, 0, 0.5)',
  animationDuration = 300,
  style,
}) => {
  const translateX = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const isVisible = useRef(false);

  useEffect(() => {
    if (isOpen && !isVisible.current) {
      isVisible.current = true;
      // Animate drawer in
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (!isOpen && isVisible.current) {
      // Animate drawer out
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: SCREEN_WIDTH,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ]).start(() => {
        isVisible.current = false;
      });
    }
  }, [isOpen, animationDuration]);

  if (!isOpen && !isVisible.current) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Overlay */}
      {showOverlay && (
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View
            style={[
              styles.overlay,
              {
                backgroundColor: overlayColor,
                opacity: overlayOpacity,
              },
            ]}
          />
        </TouchableWithoutFeedback>
      )}

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX }],
            width: drawerWidth,
            backgroundColor,
            ...position,
          },
          style,
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  drawer: {
    position: 'absolute',
    right: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default AnimatedDrawer;
