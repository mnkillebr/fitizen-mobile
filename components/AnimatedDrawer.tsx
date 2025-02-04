import React, { ReactNode, useEffect, useRef } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  StatusBar,
  Platform,
  ViewStyle,
} from 'react-native';
export type DrawerMode = 'drawer' | 'sidebar';
export type DrawerSide = 'left' | 'right';

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
  mode?: DrawerMode;
  side?: DrawerSide;
  position?: DrawerPosition;
  drawerWidth?: number;
  backgroundColor?: string;
  showOverlay?: boolean;
  overlayColor?: string;
  animationDuration?: number;
  style?: ViewStyle;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight || 0;

const AnimatedDrawer: React.FC<AnimatedDrawerProps> = ({
  children,
  isOpen,
  onClose,
  mode = 'drawer',
  side = 'right',
  position,
  drawerWidth = mode === 'sidebar' ? SCREEN_WIDTH * 0.8 : SCREEN_WIDTH,
  backgroundColor = '',
  showOverlay = true,
  overlayColor = 'rgba(0, 0, 0, 0.5)',
  animationDuration = 300,
  style,
}) => {
  const translateX = useRef(
    new Animated.Value(side === 'right' ? SCREEN_WIDTH : -drawerWidth)
  ).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const isVisible = useRef(false);

  const getInitialTranslateX = () => {
    if (side === 'right') return SCREEN_WIDTH;
    return -drawerWidth;
  };

  const getFinalTranslateX = () => {
    if (side === 'right') return SCREEN_WIDTH;
    return -drawerWidth;
  };

  useEffect(() => {
    if (isOpen && !isVisible.current) {
      isVisible.current = true;
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
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: getFinalTranslateX(),
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

  const drawerStyle = mode === 'sidebar' 
    ? styles.sidebar 
    : {
        ...styles.drawer,
        ...position,
      };

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

      {/* Drawer/Sidebar */}
      <Animated.View
        style={[
          drawerStyle,
          {
            transform: [{ translateX }],
            width: drawerWidth,
            backgroundColor,
            [side]: 0,
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
    shadowColor: '#000',
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    height: SCREEN_HEIGHT,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default AnimatedDrawer;

// Usage Example for Sidebar:
/*
import { TouchableOpacity } from 'react-native';
import { Menu } from 'your-icon-library'; // Use your preferred icon library

const ParentRoute = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    // Implement logout logic
    setIsSidebarOpen(false);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Header with Menu Button *//*}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => setIsSidebarOpen(true)}
          style={styles.menuButton}
        >
          <Menu size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>My App</Text>
      </View>

      {/* Main Content *//*}
      <View style={styles.content}>
        {/* Your route content *//*}
      </View>
      
      {/* Sidebar *//*}
      <AnimatedDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        mode="sidebar"
        side="left"
        drawerWidth={SCREEN_WIDTH * 0.8}
      >
        <View style={styles.sidebarContent}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>Menu</Text>
          </View>
          
          {/* Navigation Items *//*}
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              // Navigate to Home
              setIsSidebarOpen(false);
            }}
          >
            <Text>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              // Navigate to Profile
              setIsSidebarOpen(false);
            }}
          >
            <Text>Profile</Text>
          </TouchableOpacity>
          
          {/* Logout Option *//*}
          <TouchableOpacity 
            style={[styles.menuItem, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </AnimatedDrawer>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  menuButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  sidebarContent: {
    flex: 1,
    paddingTop: STATUSBAR_HEIGHT,
  },
  sidebarHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logoutButton: {
    marginTop: 'auto',
    backgroundColor: '#f8f8f8',
  },
  logoutText: {
    color: 'red',
  },
});
*/