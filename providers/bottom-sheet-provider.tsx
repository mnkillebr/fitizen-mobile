// providers/bottom-sheet-provider.tsx
import React, { createRef, useCallback, useEffect, useMemo, useState } from 'react';
import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Keyboard, KeyboardEvent, Platform, Pressable, ScrollView, StyleSheet, Text, View,  } from 'react-native';
import { Snackbar, TextInput } from 'react-native-paper';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useDispatch, useSelector } from 'react-redux';
import { saveProgramNote } from '@/redux/slices/programWorkoutLogSlice';
import { RootState } from '@/redux/store';
import { setClearBottomSheet } from '@/redux/slices/uiSlice';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { ThemedText } from '@/components/ThemedText';
import { saveNote } from '@/redux/slices/workoutLogSlice';

const bottomSheetRef = createRef<BottomSheet>();

export const useBottomSheet = () => {
  const open = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const close = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  return { open, close };
};

export function BottomSheetProvider({ children }: { children: React.ReactNode }) {
  const [text, setText] = useState('');
  const [snackOpen, setSnackOpen] = useState(false);
  // Configure the snap points
  const snapPoints = useMemo(() => ['20%'], []);
  const colorScheme = useColorScheme();
  const dispatch = useDispatch();
  const clearBottomSheet = useSelector((state: RootState) => state.ui.clearBottomSheet)
  const currentProgramExercise = useSelector((state: RootState) => state.programWorkoutLog.currentExercise)
  const programWorkoutExerciseLogs = useSelector((state: RootState) => state.programWorkoutLog.exerciseLogs)
  const currentExercise = useSelector((state: RootState) => state.workoutLog.currentExercise)
  const workoutExerciseLogs = useSelector((state: RootState) => state.workoutLog.exerciseLogs)
  
  // console.log("current exercise", currentExercise, "logs", workoutExerciseLogs)

  useEffect(() => {
    if (currentProgramExercise && programWorkoutExerciseLogs.length) {
      if (!programWorkoutExerciseLogs.find(log => {
        return log.programBlockId === currentProgramExercise.programBlockId
          && log.exerciseId === currentProgramExercise.exerciseId
          && log.orderInBlock === currentProgramExercise.orderInBlock
      })) {
        setText('')
      } else if (programWorkoutExerciseLogs.find(log => {
        return log.programBlockId === currentProgramExercise.programBlockId
          && log.exerciseId === currentProgramExercise.exerciseId
          && log.orderInBlock === currentProgramExercise.orderInBlock
      })) {
        const exerciseLog = programWorkoutExerciseLogs.find(log => {
          return log.programBlockId === currentProgramExercise.programBlockId
            && log.exerciseId === currentProgramExercise.exerciseId
            && log.orderInBlock === currentProgramExercise.orderInBlock
        })
        const logSets = exerciseLog?.sets
        if (!logSets?.find(set => set.set === currentProgramExercise.currentSet)) {
          setText('')
        }
      }
    }
    if (currentExercise && workoutExerciseLogs.length) {
      if (!workoutExerciseLogs.find(log => {
        return log.circuitId === currentExercise.circuitId
          && log.exerciseId === currentExercise.exerciseId
          && log.orderInRoutine === currentExercise.orderInRoutine
      })) {
        setText('')
      } else if (workoutExerciseLogs.find(log => {
        return log.circuitId === currentExercise.circuitId
          && log.exerciseId === currentExercise.exerciseId
          && log.orderInRoutine === currentExercise.orderInRoutine
      })) {
        const exerciseLog = workoutExerciseLogs.find(log => {
          return log.circuitId === currentExercise.circuitId
            && log.exerciseId === currentExercise.exerciseId
            && log.orderInRoutine === currentExercise.orderInRoutine
        })
        const logSets = exerciseLog?.sets
        if (!logSets?.find(set => set.set === currentExercise.currentSet)) {
          setText('')
        }
      }
    }
  },
  [
    currentProgramExercise,
    programWorkoutExerciseLogs,
    currentExercise,
    workoutExerciseLogs,
  ])

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        onPress={Keyboard.dismiss}
      />
    ),
    []
  );

  return (
    <BottomSheetModalProvider>
      {children}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        // keyboardBehavior='interactive'
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.indicator}
        backgroundStyle={{ backgroundColor: Colors[colorScheme ?? "light"].background }}
      >
        <BottomSheetView style={styles.contentContainer}>
          <BottomSheetTextInput
            value={text}
            onChangeText={(val) => {
              setText(val)
              // if (val.length) {
              //   dispatch(setClearBottomSheet(false))
              // } 
            }}
            placeholder="Add note ... 40 char max"
            placeholderTextColor="gray"
            keyboardType="default"
            style={[styles.input, { color: Colors[colorScheme ?? "light"].text, borderColor: Colors[colorScheme ?? "light"].border, backgroundColor: Colors[colorScheme ?? "light"].background }]}
            // textColor={Colors[colorScheme ?? "light"].text}
            selectionColor={Colors[colorScheme ?? "light"].tint}
            // underlineStyle={{ display: 'none' }}
            returnKeyType="done" // Adds "Done" button on iOS
            maxLength={42} // Set max character limit
            scrollEnabled={true} // Enable vertical scrolling
            // textAlignVertical="top"
            // multiline
          />
          <Pressable 
            style={[styles.button, { backgroundColor: Colors[colorScheme ?? "light"].tint }]}
            onPress={() => {
              if (currentProgramExercise) {
                dispatch(saveProgramNote(text))
              }
              if (currentExercise) {
                dispatch(saveNote(text))
              }
              setSnackOpen(true)
              Keyboard.dismiss()
            }}
            // disabled={mutation.isPending}
          >
            <Text style={styles.buttonText}>
              {'Save'}
            </Text>
          </Pressable>
        </BottomSheetView>
      </BottomSheet>
      <Snackbar
        visible={snackOpen}
        duration={2000}
        onDismiss={() => setSnackOpen(false)}
        // action={{
        //   label: 'Close',
        //   onPress: () => {
        //     // Do something
        //   },
        // }}
      >
        <ThemedText>
          Note saved.
        </ThemedText>
      </Snackbar>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#FFFFFF',
  },
  indicator: {
    backgroundColor: '#A0A0A0',
    width: 50,
  },
  contentContainer: {
    padding: 16,
    flex: 1,
  },
  input: {
    // flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    // height: 100,
    overflow: 'scroll',
  },
  button: {
    // backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14
  },

});