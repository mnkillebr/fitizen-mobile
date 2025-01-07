import CountdownTimer, { CountdownHandle } from '@/components/Countdown';
import Stopwatch, { StopwatchHandle } from '@/components/Stopwatch';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedSafeAreaView } from '@/components/ThemeSafeAreaView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { api } from '@/lib/api';
import { resetWorkoutLog, recordSet, cancelWorkout, finishWorkout } from '@/redux/slices/workoutLogSlice';
import { RootState } from '@/redux/store';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Dialog } from '@rneui/themed';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, ImageBackground, Keyboard, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { FAB, IconButton, TextInput, } from 'react-native-paper';
import { useDispatch, useSelector } from "react-redux";

export default function WorkoutFlowScreen() {
  const { workoutId } = useLocalSearchParams();
  const [workoutPaused, setWorkoutPaused] = useState(false)
  const colorScheme = useColorScheme();
  const tabBarHeight = useBottomTabBarHeight();
  const stopwatchRef = useRef<StopwatchHandle>(null);
  const countdownRef = useRef<CountdownHandle>(null);
  const [currentLoad, setCurrentLoad] = useState<string | undefined>(undefined);
  const [currentReps, setCurrentReps] = useState<string | undefined>(undefined);
  const dispatch = useDispatch()

  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['workout', workoutId.toString()],
    queryFn: () => api.workouts.workoutDetail(workoutId.toString())
  });
  const { workout, exerciseDetails } = useMemo(() => {
    if (data) {
      return {
        workout: data.workout,
        exerciseDetails: data.exerciseDetails,
      }
    } else {
      return {
        workout: undefined,
        exerciseDetails: [],
      }
    }
  }, [data])
  const restMappedDetails = useMemo(() => {
    if (exerciseDetails.length) {
      return exerciseDetails.flatMap((ex, exIdx) => {
        if (ex.circuitId) {
          const sets = parseInt(ex.sets)
          // const circuits = Array(sets).fill([
          //   ...ex.exercises.map(ex_item => ({...ex_item, circuitId: ex.circuitId})),
          //   {circuitId: ex.circuitId, rest: ex.rest},
          // ])
          const circuits = [...Array(sets)].map((set, setIdx) => {
            if (setIdx+1 === sets && exIdx + 1 === exerciseDetails.length) {
              return [
                ...ex.exercises.map(ex_item => ({...ex_item, circuitId: ex.circuitId, currentSet: setIdx+1 }))
              ]
            } else {
              return [
                ...ex.exercises.map(ex_item => ({...ex_item, circuitId: ex.circuitId, currentSet: setIdx+1 })),
                {circuitId: ex.circuitId, rest: ex.rest, img: "https://res.cloudinary.com/dqrk3drua/image/upload/f_auto,q_auto/v1/fitizen/rdwc8bymfmy537xdewjf" },
              ]
            }
          })
          return circuits.flat()
        } else {
          const sets = parseInt(ex.sets)
          if (ex.rest !== "None") {
            const flatSets = [...Array(sets)].map((set, setIdx) => {
              if (setIdx+1 === sets && exIdx + 1 === exerciseDetails.length) {
                return [{...ex, currentSet: setIdx+1}]
              }
              return [{...ex, currentSet: setIdx+1}, { rest: ex.rest, img: "https://res.cloudinary.com/dqrk3drua/image/upload/f_auto,q_auto/v1/fitizen/rdwc8bymfmy537xdewjf" }]
            })
            return flatSets.flat()
          } else {
            const flatSets = [...Array(sets)].map((set, setIdx) => {
              return {...ex, currentSet: setIdx+1}
            })
            return flatSets.flat()
          }
        }
      })
    } else {
      return []
    }
  }, [exerciseDetails])

  const handleStopwatchStateChange = (running: boolean) => {
    setWorkoutPaused(!running);
  };

  const handleCountdownStateChange = (running: boolean) => {
    setWorkoutPaused(!running);
  };

  const handleTogglePause = () => {
    if (workoutPaused) {
      stopwatchRef.current?.resume();
      countdownRef.current?.resume();
    } else {
      stopwatchRef.current?.pause();
      countdownRef.current?.pause();
    }
  }
  const handleResetCountdown = (time: number) => {
    countdownRef.current?.reset(time);
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showStopwatch, setShowStopwatch] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [countdownRunning, setCountdownRunning] = useState(false);

  const currentImage = restMappedDetails[currentIndex].gif || restMappedDetails[currentIndex].img
  const nextImage = restMappedDetails[currentIndex+1] ? (restMappedDetails[currentIndex+1].gif || restMappedDetails[currentIndex+1].img) : undefined
  // console.log("details", logs, logs.length, currentWorkout)
  // console.log("on workout screen first", showStopwatch, restMappedDetails[currentIndex].thumbnail)

  return (
    // <ImageBackground
    //   source={{ uri: testGif }}
    //   style={styles.backgroundImage}
    // >
      
    // </ImageBackground>
    <ThemedSafeAreaView className='flex-1 relative'>
      <ThemedView className='p-4' onTouchStart={Keyboard.dismiss}>
        <View className='absolute top-0 z-20'>
          <IconButton
            icon="arrow-left"
            // iconColor={Colors[colorScheme ?? 'light'].tint}
            iconColor="black"
            style={{ backgroundColor: Colors[colorScheme ?? 'light'].tint }}
            onPress={() => setOpenDialog(true)}
          />
        </View>
        <Text className='absolute top-4 inset-x-0 z-10 font-bold text-2xl text-center text-[#eeeeec]' style={styles.textShadow}>{workout.name}</Text>
        <Image
          key={currentImage}
          source={{ uri: currentImage }}
          style={{ width: "100%", height: 640, borderRadius: 4, alignSelf: 'center', opacity: showStopwatch ? 1 : 0.5 }}
        />
        <View className="absolute top-0 inset-x-0">
          {showStopwatch ? (
            <Stopwatch
              ref={stopwatchRef}
              autoStart={true}
              label='Elapsed Time'
              onStateChange={handleStopwatchStateChange}
            />
          ) : (
            <CountdownTimer
              ref={countdownRef}
              showPresetTimes={false}
              autoStart={true}
              showCustomInput={false}
              showControls={false}
              showSound={true}
              label="Get Ready!"
              defaultTime={1}
              onStateChange={handleCountdownStateChange}
              onCountdownEnd={() => setShowStopwatch(true)}
            />
          )}
        </View>
        {!restMappedDetails[currentIndex].gif && restMappedDetails[currentIndex].rest !== "None" ? (
          <View className="absolute bottom-48 inset-x-0">
            <CountdownTimer
              ref={countdownRef}
              showPresetTimes={false}
              autoStart={true}
              showCustomInput={false}
              showControls={false}
              showSound={true}
              onCountdownEnd={() => {
                setCurrentIndex(currentIndex+1)
                if (restMappedDetails[currentIndex+1].time) {
                  const newTime = restMappedDetails[currentIndex+1].time.includes("min") ? parseInt(restMappedDetails[currentIndex+1].time) * 60 : parseInt(restMappedDetails[currentIndex+1].time)
                  // handleResetCountdown(newTime)
                  handleResetCountdown(5)
                  countdownRef.current?.resume();
                }
              }}
              defaultTime={1}
              // defaultTime={restMappedDetails[currentIndex].rest.includes("min") ? parseInt(restMappedDetails[currentIndex].rest) * 60 : parseInt(restMappedDetails[currentIndex].rest)}
            />
            <Text className='text-3xl font-semibold text-center text-[#eeeeec]' style={styles.textShadow}>Rest Period</Text>
          </View>
        ) : (
          <View className="absolute bottom-8 inset-x-0">
            {restMappedDetails[currentIndex].target === "time" && restMappedDetails[currentIndex].time !== "None" ? (
              <CountdownTimer
                ref={countdownRef}
                showPresetTimes={false}
                autoStart={true}
                showCustomInput={false}
                showControls={false}
                showSound={true}
                onStateChange={setCountdownRunning}
                defaultTime={1}
                // defaultTime={restMappedDetails[currentIndex].time.includes("min") ? parseInt(restMappedDetails[currentIndex].time) * 60 : parseInt(restMappedDetails[currentIndex].time)}
              />
            ) : null}
            <Text className='text-lg font-semibold ml-8 text-[#eeeeec]' style={styles.textShadow}>Current Exercise:</Text>
            <Text className='text-lg font-bold ml-8 text-[#eeeeec]' style={styles.textShadow}>{restMappedDetails[currentIndex].name}</Text>
            
            <View className='flex-row gap-x-4 gap-y-2 ml-8 flex-wrap w-2/3'>
              <View className='flex-col'>
                <Text className='font-medium text-sm text-[#eeeeec]' style={styles.textShadow}>Sets</Text>
                <Text className='text-[#eeeeec]'>{restMappedDetails[currentIndex].currentSet}/{restMappedDetails[currentIndex].sets}</Text>
              </View>
              <View className='flex-col'>
                <Text className='font-medium text-sm text-[#eeeeec]' style={styles.textShadow}>Target</Text>
                <Text className='text-[#eeeeec]'>{restMappedDetails[currentIndex].target === "reps" ? `${restMappedDetails[currentIndex].reps} reps`: restMappedDetails[currentIndex].time}</Text>
              </View>
              <View className={`flex-col min-w-20 ${restMappedDetails[currentIndex].notes ? "" : "invisible"}`}>
                <Text className='font-medium text-sm text-[#eeeeec]' style={styles.textShadow}>Notes</Text>
                <Text className='text-[#eeeeec]'>{restMappedDetails[currentIndex].notes}</Text>
              </View>
              <View className='flex-col'>
                <Text className='font-medium text-sm text-[#eeeeec]' style={styles.textShadow}>Load Used</Text>
                <TextInput
                  onTouchStart={(e) => e.stopPropagation()}
                  maxLength={4}
                  placeholder='Enter load'
                  placeholderTextColor="#fff"
                  caretHidden
                  inputMode="numeric"
                  underlineStyle={{ display: "none" }}
                  contentStyle={{ color: "#e8e5dc", backgroundColor: "#565656", }}
                  keyboardType="numeric"
                  // dense
                  style={{ height: 28, width: 84, fontSize: 14, paddingHorizontal: 8 }}
                  selectionColor='#ffd700'
                  value={currentLoad}
                  onChangeText={setCurrentLoad}
                />
              </View>
              <View className='flex-col'>
                <Text className='font-medium text-sm text-[#eeeeec]' style={styles.textShadow}>Reps Completed</Text>
                <TextInput
                  onTouchStart={(e) => e.stopPropagation()}
                  maxLength={4}
                  placeholder='Enter reps'
                  placeholderTextColor="#fff"
                  caretHidden
                  inputMode="numeric"
                  underlineStyle={{ display: "none" }}
                  contentStyle={{ color: "#e8e5dc", backgroundColor: "#565656", }}
                  keyboardType="number-pad"
                  // dense
                  style={{ height: 28, width: 84, fontSize: 14, paddingHorizontal: 8 }}
                  selectionColor='#ffd700'
                  value={currentReps}
                  onChangeText={setCurrentReps}
                />
              </View>
            </View>
          </View>
        )}
        {nextImage && (
          <View className="absolute bottom-6 right-4">
            <Text className='relative top-6 z-10 text-lg font-semibold text-[#eeeeec]' style={styles.textShadow}>Up Next:</Text>
            <Image
              key={nextImage}
              source={{ uri: nextImage }}
              style={{ width: 100, aspectRatio: 4/3, borderRadius: 4, alignSelf: 'center', opacity: 0.7 }}
            />
          </View>
        )}
      </ThemedView>
      <View className="flex-row w-full px-3 justify-between absolute" style={{ bottom: tabBarHeight+12 }}>
        <FAB
          icon="restart"
          size="medium"
          label="Restart"
          style={{
            ...styles.restartButton,
            backgroundColor: Colors[colorScheme ?? 'light'].background,
            shadowColor: colorScheme === "dark" ? "#fff" : "unset",
          }}
          color={Colors[colorScheme ?? 'light'].text}
          onPress={() => {
            setCurrentIndex(0)
            setShowStopwatch(false)
            dispatch(resetWorkoutLog())
          }}
        />
        <FAB
          icon={workoutPaused ? "play" : "pause"}
          size="medium"
          label={workoutPaused ? "Resume" : "Pause"}
          style={{
            ...styles.cancelButton,
            backgroundColor: Colors[colorScheme ?? 'light'].background,
            shadowColor: colorScheme === "dark" ? "#fff" : "unset",
          }}
          color={Colors[colorScheme ?? 'light'].text}
          onPress={handleTogglePause}
        />
        <FAB
          icon={nextImage ? "chevron-right" : "check"}
          size="medium"
          label={nextImage ? "Next" : "Finish"}
          style={{ ...styles.nextButton, backgroundColor: Colors[colorScheme ?? 'light'].tint }}
          color="black"
          disabled={((!restMappedDetails[currentIndex].gif && restMappedDetails[currentIndex].rest !== "None") || countdownRunning || !showStopwatch)}
          onPress={() => {
            // console.log("current time", stopwatchRef.current?.getCurrentTime())
            const currentSetData = {
              circuitId: restMappedDetails[currentIndex].circuitId,
              exerciseId: restMappedDetails[currentIndex].exerciseId,
              exerciseName: restMappedDetails[currentIndex].name,
              exerciseThumbnail: restMappedDetails[currentIndex].thumbnail,
              orderInRoutine: restMappedDetails[currentIndex].orderInRoutine,
              set: {
                set: restMappedDetails[currentIndex].currentSet,
                actualReps: currentReps,
                load: currentLoad ? parseInt(currentLoad) : undefined,
                unit: "pound",
              },
              target: restMappedDetails[currentIndex].target,
              targetReps: restMappedDetails[currentIndex].reps ?? undefined,
              time: restMappedDetails[currentIndex].time ?? undefined,
            }
            // console.log(currentSetData)
            dispatch(recordSet(currentSetData))
            if (restMappedDetails[currentIndex+1]) {
              setCurrentIndex(currentIndex+1)
              setCurrentLoad("")
              setCurrentReps("")
            } else {
              const workoutDuration = `${stopwatchRef.current?.getCurrentTime()}`
              dispatch(finishWorkout(workoutDuration))
              router.push({
                pathname: "/(tabs)/(workouts)/reviewWorkout",
                params: {
                  workoutId,
                  previewImgUri: workout.s3ImageKey,
                  workoutName: workout.name,
                }
              })
            }
          }}
        />
      </View>
      <Dialog
        isVisible={openDialog}
        onBackdropPress={() => setOpenDialog(false)}
        overlayStyle={{ backgroundColor: Colors[colorScheme ?? 'light'].background, borderWidth: 1, borderColor: '#4d4d53' }}
      >
        <Dialog.Title title="Cancel Workout" titleStyle={{ color: Colors[colorScheme ?? 'light'].text }} />
        <ThemedText>Are you sure you want to cancel the workout?</ThemedText>
        <Dialog.Actions>
          <View className='flex-row'>
            <Dialog.Button
              type="clear"
              titleStyle={{ color: Colors[colorScheme ?? 'light'].text }}
              onPress={() => setOpenDialog(false)}
            >
              No
            </Dialog.Button>
            <Dialog.Button
              titleStyle={{ color: "black" }}
              buttonStyle={{ backgroundColor: Colors[colorScheme ?? 'light'].tint, borderRadius: 4 }}
              onPress={() => {
                dispatch(resetWorkoutLog())
                dispatch(cancelWorkout())
                router.back()
              }}
            >
              Yes
            </Dialog.Button>
          </View>
        </Dialog.Actions>
      </Dialog>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    // backgroundSize: "cover",
    // backgroundPosition: "center",
    height: 640,
    width: "100%"
  },
  textShadow: {
    textShadowColor: "#000",
    textShadowOffset: {
      width: 0.75,
      height: 0.75,
    },
    textShadowRadius: 2,
  },
  cancelButton: {
    width: "auto",
    height: 50,
    // position: "absolute",
    // bottom: -12,
    // left: 12,
    justifyContent: "center",
  },
  restartButton: {
    width: "auto",
    height: 50,
    // position: "absolute",
    // bottom: -12,
    // left: "33%",
    justifyContent: "center",
    // right: "50%",
  },
  nextButton: {
    width: "auto",
    height: 50,
    // position: "absolute",
    // bottom: -12,
    // right: 12,
    justifyContent: "center",
  },
})