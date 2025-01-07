import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { colorScheme } from 'nativewind';

type Lap = {
  id: number;
  time: string;
};

interface StopwatchProps {
  autoStart?: boolean;
  label?: string;
  showMS?: boolean;
  showLaps?: boolean;
  showButtons?: boolean;
  onStateChange?: (isRunning: boolean) => void;
}

export interface StopwatchHandle {
  pause: () => void;
  resume: () => void;
  reset: () => void;
  getCurrentTime: () => number;
}

const Stopwatch = forwardRef<StopwatchHandle, StopwatchProps>((props, ref) => {
  const {
    autoStart = false,
    label,
    showMS = false,
    showLaps = false,
    showButtons = false,
    onStateChange,
  } = props
  const colorScheme = useColorScheme();
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [laps, setLaps] = useState<Lap[]>([]);

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
    reset: () => {
      setTime(0);
      setLaps([]);
    },
    getCurrentTime: () => time
  }));

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1000);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const formatTime = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const ms = milliseconds % 1000;

    if (showMS) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms
        .toString()
        .padStart(3, '0')}`;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsRunning(!isRunning);
  };

  const handleStop = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
  };

  const handleReset = () => {
    setTime(0);
    setLaps([]);
  };

  const handleLap = () => {
    setLaps((prevLaps) => [
      ...prevLaps,
      { id: prevLaps.length + 1, time: formatTime(time) },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text
        style={{
          ...styles.timeText,
          color: "#fff",
          textShadowColor: "#000",
          // color: Colors[colorScheme ?? "light"].text,
          // textShadowColor: colorScheme === "light" ? "#fff" : "#000"
        }}
      >
        {formatTime(time)}
      </Text>
      {label ? (
        <Text
          className="text-xl text-center font-medium"
          style={{
            ...styles.labelText,
            color: "#fff",
            textShadowColor: "#000",
            // color: Colors[colorScheme ?? "light"].text,
            // textShadowColor: colorScheme === "light" ? "#fff" : "#000"
          }}
        >
          {label}
        </Text>
      ) : null}
      {showButtons ? (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handlePlayPause}
            style={[styles.button, styles.playPauseButton]}
          >
            <MaterialIcons
              name={isRunning ? 'pause' : 'play-arrow'}
              size={24}
              color="white"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleStop}
            style={[styles.button, styles.stopButton]}
          >
            <MaterialIcons name="stop" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleReset}
            style={[styles.button, styles.resetButton]}
          >
            <MaterialIcons name="refresh" size={24} color="white" />
          </TouchableOpacity>

          {showLaps ? (
            <TouchableOpacity
              onPress={handleLap}
              style={[styles.button, styles.lapButton]}
            >
              <MaterialIcons name="flag" size={24} color="white" />
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {laps.length > 0 && (
        <ScrollView style={styles.lapsContainer}>
          <Text style={styles.lapsTitle}>Laps</Text>
          {laps.map((lap) => (
            <View key={lap.id} style={styles.lapItem}>
              <Text style={styles.lapText}>Lap {lap.id}</Text>
              <Text style={styles.lapTime}>{lap.time}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  labelText: {
    textShadowOffset: {
      width: 0.75,
      height: 0.75,
    },
    textShadowRadius: 2,
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    // marginBottom: 30,
    textShadowOffset: {
      width: 0.75,
      height: 0.75,
    },
    textShadowRadius: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 10,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  playPauseButton: {
    backgroundColor: '#2196F3',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  resetButton: {
    backgroundColor: '#FFC107',
  },
  lapButton: {
    backgroundColor: '#4CAF50',
  },
  lapsContainer: {
    width: '100%',
    maxHeight: 200,
  },
  lapsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  lapItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  lapText: {
    fontSize: 16,
  },
  lapTime: {
    fontSize: 16,
    fontFamily: 'monospace',
  },
});

export default Stopwatch;