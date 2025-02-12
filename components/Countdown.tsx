import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Animated, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

const presetTimes = [5, 10, 15, 20];

interface CountdownTimerProps {
  autoStart?: boolean;
  defaultTime?: number;
  label?: string;
  showPresetTimes?: boolean;
  showCustomInput?: boolean;
  showControls?: boolean;
  showPlay?: boolean;
  showReset?: boolean;
  showSound?: boolean;
  align?: "baseline" | "center" | "flex-start" | "flex-end" | "stretch"
  onCountdownEnd?: () => void;
  onStateChange?: (isRunning: boolean) => void;
};

export interface CountdownHandle {
  pause: () => void;
  resume: () => void;
  reset: (resetTime: number) => void;
  // getTime: () => number;
}

const CountdownTimer = forwardRef<CountdownHandle, CountdownTimerProps>((props, ref) => {
  const {
    autoStart = false,
    defaultTime = 15,
    label,
    showPresetTimes = true,
    showCustomInput = true,
    showPlay = true,
    showControls = true,
    showReset = true,
    showSound = false,
    align,
    onCountdownEnd = () => {},
    onStateChange,
  } = props;
  const colorScheme = useColorScheme();
  const [time, setTime] = useState(defaultTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [customMinutes, setCustomMinutes] = useState('');
  const [customSeconds, setCustomSeconds] = useState('');
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [showCustom, setShowCustom] = useState(defaultTime === 0);
  const [customTime, setCustomTime] = useState("");
  const soundRef = useRef<Audio.Sound | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    onStateChange?.(isRunning);
  }, [isRunning, onStateChange]);

  useImperativeHandle(ref, () => ({
    pause: () => {
      setIsRunning(false);
    },
    resume: () => {
      setIsRunning(true);
    },
    reset: (resetTime) => {
      setTime(resetTime);
    },
    // getTime: () => time,
  }));

  useEffect(() => {
    async function loadSound() {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/sounds/boxing-bell.mp3')
        );
        soundRef.current = sound;
      } catch (error) {
        console.error('Error loading sound', error);
      }
    }

    loadSound();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0 && isRunning) {
      setIsRunning(false);
      playBell();
      onCountdownEnd();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, time]);

  useEffect(() => {
    if (time <= 10 && time > 0) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [time]);

  const playBell = async () => {
    if (isSoundEnabled && soundRef.current) {
      try {
        await soundRef.current.setPositionAsync(0);
        await soundRef.current.playAsync();
      } catch (error) {
        console.error('Error playing sound', error);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (seconds <= 10 && seconds > 0) {
      return seconds.toString();
    }
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (customTime) {
      if (customTime.length === 5) {
        const customMinutes = parseInt(customTime.split(":")[0]) || 0
        const customSeconds = parseInt(customTime.split(":")[1]) || 0
        const totalSeconds = customMinutes * 60 + customSeconds;
        if (totalSeconds > 0) {
          setTime(totalSeconds);
        }
      } else if (customTime.length <= 2) {
        const customSeconds = parseInt(customTime)
        if (customSeconds > 0) {
          setTime(customSeconds);
        }
      }
      setShowCustom(false);
      setIsRunning(true);
    }
    if (time > 0) {
      setIsRunning(true);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setTime(0);
  };

  const handleReset = () => {
    setIsRunning(true);
    if (customTime) {
      if (customTime.length === 5) {
        const customMinutes = parseInt(customTime.split(":")[0]) || 0
        const customSeconds = parseInt(customTime.split(":")[1]) || 0
        const totalSeconds = customMinutes * 60 + customSeconds;
        if (totalSeconds > 0) {
          setTime(totalSeconds);
        }
      } else if (customTime.length <= 2) {
        const customSeconds = parseInt(customTime)
        if (customSeconds > 0) {
          setTime(customSeconds);
        }
      }
    } else {
      setTime(defaultTime);
    }
    setCustomMinutes('');
    setCustomSeconds('');
  };

  const handlePresetSelect = (minutes: number) => {
    setTime(minutes * 60);
    setCustomMinutes('');
    setCustomSeconds('');
  };

  const handleCustomTimeSubmit = () => {
    const minutes = parseInt(customMinutes) || 0;
    const seconds = parseInt(customSeconds) || 0;
    const totalSeconds = minutes * 60 + seconds;
    if (totalSeconds > 0) {
      setTime(totalSeconds);
      setCustomMinutes('');
      setCustomSeconds('');
    }
  };

  const handleChange = (text: string) => {
    // Allow only numbers and one colon
    let formattedText = text.replace(/[^0-9:]/g, "");

    // Ensure only one colon is present
    const colonCount = (formattedText.match(/:/g) || []).length;
    if (colonCount > 1) {
      return;
    }

    // Automatically insert colon after two digits if missing
    if (formattedText.length > 2 && !formattedText.includes(":")) {
      formattedText = formattedText.slice(0, 2) + ":" + formattedText.slice(2);
    }

    // Restrict length to 5 characters (MM:SS)
    if (formattedText.length > 5) {
      return;
    }

    setCustomTime(formattedText);
  };

  return (
    <View style={[styles.container, { alignItems: align ? align : "center", }]}>
      {label ? (
        <Text style={styles.labelText}>{label}</Text>
      ) : null}
      {showCustom ? (
        <TextInput
          style={styles.timeText}
          value={customTime}
          onChangeText={handleChange}
          selectionColor="#ffd700"
          keyboardType="numeric"
          placeholder="MM:SS"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          maxLength={5}
          onBlur={() => {
            if (customTime.length === 5) {
              const customMinutes = parseInt(customTime.split(":")[0]) || 0
              const customSeconds = parseInt(customTime.split(":")[1]) || 0
              const totalSeconds = customMinutes * 60 + customSeconds;
              if (totalSeconds > 0) {
                setTime(totalSeconds);
                setShowCustom(false);
              }
            } else if (customTime.length <= 2) {
              const customSeconds = parseInt(customTime)
              if (customSeconds > 0) {
                setTime(customSeconds);
                setShowCustom(false);
              }
            }
          }}
        />
      ) : (
        <Animated.Text
          style={[
            styles.timeText,
            {
              transform: [{ scale: time <= 10 ? scaleAnim : 1 }],
            },
          ]}
          onPress={() => {
            if (!isRunning) {
              setShowCustom(true)
              const setMin = Math.floor(time / 60)
              const setSec = time % 60
              const timeString =  `${setMin === 0 ? "00" : setMin < 10 ? `0${setMin}` : setMin}:${setSec === 0 ? "00" : setSec < 10 ? `0${setSec}` : setSec}`
              setCustomTime(timeString)
            }
          }}
        >
          {formatTime(time)}
        </Animated.Text>
      )}

      {showPresetTimes ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.presetsContainer}
        >
          {presetTimes.map((preset) => (
            <TouchableOpacity
              key={preset}
              onPress={() => handlePresetSelect(preset)}
              style={styles.presetButton}
            >
              <Text style={styles.presetButtonText}>{preset} min</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : null}

      {showCustomInput ? (
        <View style={styles.customInputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Min"
            keyboardType="number-pad"
            value={customMinutes}
            onChangeText={setCustomMinutes}
          />
          <TextInput
            style={styles.input}
            placeholder="Sec"
            keyboardType="number-pad"
            value={customSeconds}
            onChangeText={setCustomSeconds}
          />
          <TouchableOpacity
            style={styles.setButton}
            onPress={handleCustomTimeSubmit}
          >
            <Text style={styles.setButtonText}>Set</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.buttonContainer}>
        {showPlay ? (
          <TouchableOpacity
            onPress={isRunning ? handlePause : handleStart}
            // disabled={isRunning}
            style={[styles.button, styles.playButton, {backgroundColor: Colors[colorScheme ?? 'light'].tint}]}
            >
            <MaterialIcons name={isRunning ? "pause" :"play-arrow"} size={20} color="black" />
          </TouchableOpacity>
        ) : null}
        {showControls ? (
          <>
            <TouchableOpacity
              onPress={handlePause}
              disabled={!isRunning}
              style={[styles.button, styles.pauseButton, !isRunning && styles.disabled]}
            >
              <MaterialIcons name="pause" size={20} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleStop}
              style={[styles.button, styles.stopButton]}
            >
              <MaterialIcons name="stop" size={20} color="white" />
            </TouchableOpacity>
          </>
        ) : null}
        {showReset ? (
          <TouchableOpacity
            onPress={handleReset}
            style={[styles.button, {backgroundColor: Colors[colorScheme ?? 'light'].tint}]}
          >
            <MaterialIcons
              name="refresh"
              size={20}
              color="black"
            />
          </TouchableOpacity>
        ) : null}

        {showSound ? (
          <TouchableOpacity
            onPress={() => setIsSoundEnabled(!isSoundEnabled)}
            style={[styles.button, {backgroundColor: Colors[colorScheme ?? 'light'].tint}]}
          >
            <MaterialIcons
              name={isSoundEnabled ? 'volume-up' : 'volume-off'}
              size={20}
              color="black"
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* <Text style={styles.soundStatus}>
        {isSoundEnabled ? 'Sound is enabled' : 'Tap the speaker icon to enable sound'}
      </Text> */}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#f5f5f5',
    paddingTop: 50,
    // paddingHorizontal: 20,
  },
  labelText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: "#fff",
    textShadowColor: "#000",
    textShadowOffset: {
      width: 0.75,
      height: 0.75,
    },
    textShadowRadius: 2,
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: "#fff",
    textShadowColor: "#000",
    textShadowOffset: {
      width: 0.75,
      height: 0.75,
    },
    textShadowRadius: 2,
    // marginBottom: 30,
    // fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  presetsContainer: {
    maxHeight: 50,
    marginBottom: 20,
  },
  presetButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginHorizontal: 5,
  },
  presetButtonText: {
    color: 'white',
    fontSize: 16,
  },
  customInputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  input: {
    backgroundColor: 'white',
    width: 70,
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  setButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 10,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  playButton: {
    backgroundColor: '#2196F3',
  },
  pauseButton: {
    backgroundColor: '#FFC107',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  resetButton: {
    backgroundColor: '#9E9E9E',
  },
  soundButton: {
    backgroundColor: '#673AB7',
  },
  disabled: {
    opacity: 0.5,
  },
  soundStatus: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
});

export default CountdownTimer;