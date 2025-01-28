import React, { useRef } from "react";
import {
  View,
  Text,
  Animated,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { Icon } from "react-native-paper";

interface HoldableButtonProps {
  label: string;
  holdTime?: number; // in milliseconds
  defaultBackgroundColor?: string;
  fillColor?: string;
  defaultLabelColor?: string;
  fillLabelColor?: string;
  onHoldComplete: () => void;
}

const HoldableProgressButton: React.FC<HoldableButtonProps> = ({
  label,
  holdTime = 2000,
  defaultBackgroundColor = "#ffd700",
  fillColor = "#c4a500",
  defaultLabelColor = "#000",
  fillLabelColor = "#fff",
  onHoldComplete,
}) => {
  const progress = useRef(new Animated.Value(0)).current;
  const isHolding = useRef(false);

  const startHold = () => {
    isHolding.current = true;
    Animated.timing(progress, {
      toValue: 1,
      duration: holdTime,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && isHolding.current) {
        onHoldComplete();
      }
    });
  };

  const resetHold = () => {
    isHolding.current = false;
    Animated.timing(progress, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const widthInterpolation = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <TouchableWithoutFeedback
      onPressIn={startHold}
      // onLongPress={()}
      onPressOut={resetHold}
    >
      <View style={[styles.button, { backgroundColor: defaultBackgroundColor }]}>
        {/* Animated Fill */}
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: fillColor, width: widthInterpolation },
          ]}
        />

        {/* Masked View for Text */}
        {/* <MaskedView
          style={styles.maskedView}
          maskElement={
            <View style={styles.maskContainer}>
              <Icon source="skip-next" size={16} />
              <Text style={[styles.label, { color: "black" }]}>{label}</Text>
            </View>
          }
        >
    
          <View style={styles.maskContainer}>
            <Icon source="skip-next" size={16} />
            <Text style={[styles.label, { color: defaultLabelColor }]}>
              {label}
            </Text>
          </View>

 
          <Animated.View style={{ width: widthInterpolation, overflow: "hidden" }}>
            <Text style={[styles.label, { color: fillLabelColor }]}>
              {label}
            </Text>
          </Animated.View>
        </MaskedView> */}
        <View style={styles.maskContainer}>
          <Icon source="skip-next" size={16} />
          <Text style={[styles.label, { color: defaultLabelColor }]}>
            {label}
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  button: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    width: "auto",
  },
  fill: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
  },
  maskedView: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  maskContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 2
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default HoldableProgressButton;