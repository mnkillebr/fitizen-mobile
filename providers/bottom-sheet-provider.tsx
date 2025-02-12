// providers/bottom-sheet-provider.tsx
import React, { createRef, useCallback, useEffect, useMemo, useState } from 'react';
import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Keyboard, KeyboardEvent, Platform, Pressable, ScrollView, StyleSheet, Text, View,  } from 'react-native';
import { Snackbar, TextInput } from 'react-native-paper';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useDispatch, useSelector } from 'react-redux';
import { saveProgramSet } from '@/redux/slices/programWorkoutLogSlice';
import { RootState } from '@/redux/store';
import { setClearBottomSheet } from '@/redux/slices/uiSlice';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { ThemedText } from '@/components/ThemedText';
import { saveSet } from '@/redux/slices/workoutLogSlice';

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
  const [currentLoad, setCurrentLoad] = useState('');
  const [currentReps, setCurrentReps] = useState('')
  const [snackOpen, setSnackOpen] = useState(false);
  // Configure the snap points
  const snapPoints = useMemo(() => ['30%'], []);
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
        setCurrentLoad('')
        setCurrentReps('')
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
          setCurrentLoad('')
          setCurrentReps('')
        } else if (logSets?.find(set => set.set === currentProgramExercise.currentSet)) {
          const existingLogSet = logSets.find(set => set.set === currentProgramExercise.currentSet)
          setText(existingLogSet?.notes)
          setCurrentLoad(existingLogSet?.load)
          setCurrentReps(existingLogSet?.actualReps)
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
        setCurrentLoad('')
        setCurrentReps('')
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
          setCurrentLoad('')
          setCurrentReps('')
        } else if (logSets?.find(set => set.set === currentExercise.currentSet)) {
          const existingLogSet = logSets.find(set => set.set === currentExercise.currentSet)
          setText(existingLogSet?.notes)
          setCurrentLoad(existingLogSet?.load)
          setCurrentReps(existingLogSet?.actualReps)
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
          {currentExercise ? (
            <View className='flex-row justify-between mb-2'>
              <Text className='text-lg font-bold text-[#eeeeec] w-2/3' style={styles.textShadow}>{currentExercise.name}</Text>
              <View className='flex-row w-1/3 justify-end' style={{ justifyContent: "flex-end" }}>
                <Text className='text-lg text-[#eeeeec] mr-1' style={{ marginRight: 4 }}>Set</Text>
                {currentExercise.currentSet === parseInt(currentExercise.sets) ?
                  <Text className='text-lg font-bold text-[#ffd700]' style={{ color: Colors[colorScheme ?? "light"].tint }}>{currentExercise.currentSet} of </Text> :
                  <Text className='text-lg text-[#eeeeec]'>{currentExercise.currentSet} of </Text>}
                <Text className='text-lg font-bold text-[#ffd700]' style={{ color: Colors[colorScheme ?? "light"].tint }}>{currentExercise.sets}</Text>
              </View>
            </View>
          ) : null}
          {currentProgramExercise ? (
            <View className='flex-row justify-between mb-2'>
              <Text className='text-lg font-bold text-[#eeeeec] w-2/3' style={styles.textShadow}>{currentProgramExercise.name}</Text>
              <View className='flex-row w-1/3 justify-end' style={{ justifyContent: "flex-end" }}>
                <Text className='text-lg text-[#eeeeec] mr-1' style={{ marginRight: 4 }}>Set</Text>
                {currentProgramExercise.currentSet === parseInt(currentProgramExercise.sets) ?
                  <Text className='text-lg font-bold text-[#ffd700]' style={{ color: Colors[colorScheme ?? "light"].tint }}>{currentProgramExercise.currentSet} of </Text> :
                  <Text className='text-lg text-[#eeeeec]'>{currentProgramExercise.currentSet} of </Text>}
                <Text className='text-lg font-bold text-[#ffd700]' style={{ color: Colors[colorScheme ?? "light"].tint }}>{currentProgramExercise.sets}</Text>
              </View>
            </View>
          ) : null}
          <View className='flex-row gap-2 mb-2'>
            <View className='flex-col flex-1'>
              <Text className='font-medium text-sm text-[#eeeeec]' style={styles.textShadow}>Load Used</Text>
              <BottomSheetTextInput
                // onTouchStart={(e) => e.stopPropagation()}
                maxLength={4}
                placeholder='Enter load'
                placeholderTextColor="gray"
                caretHidden
                inputMode="numeric"
                // underlineStyle={{ display: "none" }}
                // contentStyle={{ color: "#e8e5dc", backgroundColor: "#565656", }}
                keyboardType="numeric"
                // dense
                style={[styles.numberInput, { color: Colors[colorScheme ?? "light"].text, borderColor: Colors[colorScheme ?? "light"].border, backgroundColor: Colors[colorScheme ?? "light"].background }]}
                selectionColor='#ffd700'
                value={currentLoad}
                onChangeText={setCurrentLoad}
              />
            </View>
            <View className='flex-col flex-1'>
              <Text className='font-medium text-sm text-[#eeeeec]' style={styles.textShadow}>Reps Completed</Text>
              <BottomSheetTextInput
                // onTouchStart={(e) => e.stopPropagation()}
                maxLength={4}
                placeholder='Enter reps'
                placeholderTextColor="gray"
                caretHidden
                inputMode="numeric"
                // underlineStyle={{ display: "none" }}
                // contentStyle={{ color: "#e8e5dc", backgroundColor: "#565656", }}
                keyboardType="number-pad"
                // dense
                style={[styles.numberInput, { color: Colors[colorScheme ?? "light"].text, borderColor: Colors[colorScheme ?? "light"].border, backgroundColor: Colors[colorScheme ?? "light"].background }]}
                selectionColor='#ffd700'
                value={currentReps}
                onChangeText={setCurrentReps}
              />
            </View>
          </View>
          <Text className='font-medium text-sm text-[#eeeeec]' style={styles.textShadow}>Notes</Text>
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
                dispatch(saveProgramSet({
                  notes: text,
                  reps: currentReps,
                  load: currentLoad,
                }))
              }
              if (currentExercise) {
                dispatch(saveSet({
                  notes: text,
                  reps: currentReps,
                  load: currentLoad,
                }))
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
          Set saved.
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
    paddingHorizontal: 16,
    paddingBottom: 16,
    flex: 1,
    // width: "100%",
  },
  input: {
    // flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
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
  textShadow: {
    textShadowColor: "#000",
    textShadowOffset: {
      width: 0.75,
      height: 0.75,
    },
    textShadowRadius: 2,
  },
  numberInput: {
    // height: 28,
    // width: 84,
    fontSize: 14,
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
    // marginBottom: 8,
  }
});