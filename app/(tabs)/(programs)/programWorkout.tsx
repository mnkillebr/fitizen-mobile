import CountdownTimer, { CountdownHandle } from '@/components/Countdown';
import Stopwatch, { StopwatchHandle } from '@/components/Stopwatch';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedSafeAreaView } from '@/components/ThemeSafeAreaView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { api, apiClient } from '@/lib/api';
import { RootState } from '@/redux/store';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Dialog } from '@rneui/themed';
import { useQuery } from '@tanstack/react-query';
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, ImageBackground, Keyboard, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { Image } from 'expo-image';
import { FAB, IconButton, TextInput, } from 'react-native-paper';
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from '@/providers/auth-provider';
import { setClearBottomSheet, setToggleHideTabs } from '@/redux/slices/uiSlice';
import { CommentsDrawer } from '@/components/CommentsDrawer';
import { useBottomSheet } from '@/providers/bottom-sheet-provider';
import { finishProgramWorkout, recordProgramSet, setCurrentExercise } from '@/redux/slices/programWorkoutLogSlice';
import AnimatedDrawer from '@/components/AnimatedDrawer';

const { height, width } = Dimensions.get("window")

type BlockExercise = {
  programBlockId: string;
  exercise: any;
  exerciseId: string;
  orderInBlock: Number;
  sets: number;
  target: "reps" | "time";
  reps: number;
  time: number;
  notes: string;
  rest: number;
}

function transformArray(input: BlockExercise[]): BlockExercise[] {
  const result: BlockExercise[] = [];
  const repeatTracker = new Map<number, number>(input.map(item => [item.orderInBlock, 0])); // Track repetitions

  let completed = false;

  while (!completed) {
    completed = true;

    for (const item of input) {
      const count = repeatTracker.get(item.orderInBlock) || 0;

      if (count < item.sets) {
        result.push({
          ...item,
          ...item.exercise,
          exerciseId: item.exercise.id,
          currentSet: count+1
        });
        repeatTracker.set(item.orderInBlock, count + 1);
        completed = false; // Keep going until all repeats are satisfied
      }
    }
  }

  return result;
}

const DialogButton = ({ 
  title = 'Button',
  onPress = () => {},
  buttonStyle = {},
  titleStyle = {},
  ...otherProps 
}) => (
  <Dialog.Button
    title={title}
    onPress={onPress}
    buttonStyle={[styles.buttonBase, buttonStyle]}
    titleStyle={[styles.buttonText, titleStyle]}
    {...otherProps}
  />
)

export default function WorkoutFlowScreen() {
  const { signOut } = useAuth();

  // hooks
  const { programId } = useLocalSearchParams();
  const [workoutPaused, setWorkoutPaused] = useState(false)
  const colorScheme = useColorScheme();
  const tabBarHeight = useBottomTabBarHeight();
  const stopwatchRef = useRef<StopwatchHandle>(null);
  const countdownRef = useRef<CountdownHandle>(null);
  const [currentLoad, setCurrentLoad] = useState<string | undefined>(undefined);
  const [currentReps, setCurrentReps] = useState<string | undefined>(undefined);
  const [currentNotes, setCurrentNotes] = useState<string | undefined>(undefined);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showStopwatch, setShowStopwatch] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [countdownRunning, setCountdownRunning] = useState(false);
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const { open, setContent } = useBottomSheet();
  const dispatch = useDispatch()

  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['programWorkout', programId.toString()],
    queryFn: () => apiClient.programs.programWorkout(programId.toString())
  });

  if (!isLoading && error) {
    const errorMessage = error?.message
    // console.log("error message", errorMessage)
    const alertPrompt = errorMessage === "Unauthorized"
      ? "Unauthorized Request"
      : errorMessage === "Invalid token"
      ? "Session expired" : "Unauthorized"
    Alert.alert(alertPrompt, 'You will be signed out', [
      {
        text: 'OK',
        onPress: signOut 
      },
    ]);
  }

  const {
    currentProgramWorkout,
    program,
    programLength,
    programDay,
    programWeek,
    movementPrep,
    warmup,
    cooldown,
    mainExercises,
    allExercises,
  } = useMemo(() => {
    if (data) {
      return {
        ...data,
        movementPrep: Object.values(data.movementPrep)
          .filter(prep => prep.order)
          .sort((a,b) => a.order - b.order)
          .flatMap(prep => prep.exercises.map(ex => ({...ex, ...ex.exercise, type: prep.type}))),
        warmup: Object.values(data.warmup)
          .filter(prep => prep.order)
          .sort((a,b) => a.order - b.order)
          .flatMap(prep => prep.exercises.map(ex => ({...ex, ...ex.exercise, type: prep.type}))),
        cooldown: data.cooldown.exercises.map(ex => ({...ex, ...ex.exercise})),
        mainExercises: data.currentProgramWorkout.blocks.flatMap(block => transformArray(block.exercises)),
        allExercises: [
          ...Object.values(data.movementPrep)
            .filter(prep => prep.order)
            .sort((a,b) => a.order - b.order)
            .flatMap(prep => prep.exercises.map(ex => ({...ex, ...ex.exercise, type: prep.type}))),
          ...Object.values(data.warmup)
            .filter(prep => prep.order)
            .sort((a,b) => a.order - b.order)
            .flatMap(prep => prep.exercises.map(ex => ({...ex, ...ex.exercise, type: prep.type}))),
          ...data.currentProgramWorkout.blocks.flatMap(block => transformArray(block.exercises)),
          ...data.cooldown.exercises.map(ex => ({...ex, ...ex.exercise})),
        ]
        // currentProgramWorkout: data.currentProgramWorkout.flatMap(block => transformArray(block.exercises)),
      }
    } else {
      return {
        currentProgramWorkout: {},
        program: {},
        programLength: 0,
        programDay: 0,
        programWeek: 0,
        movementPrep: [],
        warmup: [],
        cooldown: [],
        mainExercises: [],
        allExercises: [],
      }
    }
  }, [data])

  useEffect(() => {
    if (allExercises.length) {
      preloadImages();
    }
  }, [currentIndex, allExercises]);
  
   // Preload adjacent images
   const preloadImages = () => {
    const preloadUris = [currentIndex, currentIndex + 1, currentIndex - 1]
      .filter((index) => allExercises[index])
      .map((index) => allExercises[index].gif);

    preloadUris.forEach((uri) => Image.prefetch(uri));
  };

  // console.log("current program", currentProgramWorkout.blocks && transformArray(currentProgramWorkout.blocks[0].exercises), currentProgramWorkout)
  // console.log("main exercises", mainExercises)
  // console.log("all exercises", allExercises)

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

  const currentImage = allExercises.length ? (allExercises[currentIndex].gif || allExercises[currentIndex].img) : undefined
  const nextImage = allExercises[currentIndex+1] ? (allExercises[currentIndex+1].gif || allExercises[currentIndex+1].img) : undefined
  // console.log("current index", allExercises[currentIndex])
  // console.log("details", exerciseDetails)

  if (isLoading) {
    return (
      <ThemedSafeAreaView className='flex-1 relative'>
        <ActivityIndicator />
      </ThemedSafeAreaView>
    )
  }

  if (allExercises.length) {
    return (
      // <ImageBackground
      //   source={{ uri: testGif }}
      //   style={styles.backgroundImage}
      // >
        
      // </ImageBackground>
      // <ThemedSafeAreaView className='flex-1 relative'></ThemedSafeAreaView>
      <ThemedSafeAreaView className='flex-1 relative'>
        <ThemedView className='' onTouchStart={Keyboard.dismiss}>
          <View className='absolute top-0 z-20'>
            <IconButton
              icon="arrow-left"
              // iconColor={Colors[colorScheme ?? 'light'].tint}
              iconColor="black"
              style={{ backgroundColor: Colors[colorScheme ?? 'light'].tint }}
              onPress={() => setOpenDialog(true)}
            />
          </View>
          <View className='absolute top-1 inset-x-0 z-10'>
            <Text className='font-bold text-2xl text-center text-[#eeeeec]' style={styles.textShadow}>{program.name}</Text>
            <Text className='font-bold text-lg text-center text-[#eeeeec]' style={styles.textShadow}>Week {programWeek} - Day {programDay}</Text>
          </View>
          <Image
            key={currentImage}
            source={{ uri: currentImage }}
            style={{ width: "100%", aspectRatio: 9/16, borderRadius: 4, alignSelf: 'center', opacity: showStopwatch ? 1 : 0.5 }}
            contentFit="cover"
            transition={100}
          />
          <View className="absolute top-2 inset-x-0">
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
                showReset={false}
                showSound={true}
                label="Get Ready!"
                showPlay={false}
                // defaultTime={1}
                onStateChange={handleCountdownStateChange}
                onCountdownEnd={() => setShowStopwatch(true)}
              />
            )}
          </View>
          {!allExercises[currentIndex].gif && allExercises[currentIndex].rest ? (
            <View className="absolute bottom-28 inset-x-0">
              <CountdownTimer
                ref={countdownRef}
                showPresetTimes={false}
                autoStart={true}
                showCustomInput={false}
                showControls={false}
                showReset={false}
                showSound={true}
                showPlay={false}
                onCountdownEnd={() => {
                  setCurrentIndex(currentIndex+1)
                  if (allExercises[currentIndex+1].time) {
                    const newTime = allExercises[currentIndex+1].time
                    handleResetCountdown(newTime)
                    // handleResetCountdown(5)
                    countdownRef.current?.resume();
                  }
                }}
                // defaultTime={1}
                defaultTime={allExercises[currentIndex].rest}
              />
              <Text className='text-3xl font-semibold text-center text-[#eeeeec]' style={styles.textShadow}>Rest Period</Text>
            </View>
          ) : (
            <View className="absolute -bottom-2 inset-x-0">
              {/* {allExercises[currentIndex].time ? (
                <CountdownTimer
                  ref={countdownRef}
                  showPresetTimes={false}
                  autoStart={true}
                  showCustomInput={false}
                  showControls={false}
                  showSound={true}
                  showPlay={false}
                  onStateChange={setCountdownRunning}
                  // defaultTime={1}
                  defaultTime={allExercises[currentIndex].time}
                />
              ) : null} */}
              <Text className='text-lg font-semibold ml-4 text-[#eeeeec]' style={styles.textShadow}>
                {allExercises[currentIndex].movementPrepId ? 'Movement Prep' : allExercises[currentIndex].warmupId ? 'Warmup' : allExercises[currentIndex].cooldownId ? 'Cooldown' : 'Current Exercise'}:
              </Text>
              <Text className='text-lg font-bold ml-4 text-[#eeeeec]' style={styles.textShadow}>{allExercises[currentIndex].name}</Text>
              <View className='flex-col gap-y-2 ml-4 w-2/3'>
                <View className='flex-row gap-x-4'>
                  {allExercises[currentIndex].sets ? (
                    <View className='flex-col'>
                      <Text className='font-medium text-sm text-[#eeeeec]' style={styles.textShadow}>Sets</Text>
                      <Text className='text-[#eeeeec]'>{allExercises[currentIndex].currentSet}/{allExercises[currentIndex].sets}</Text>
                    </View>
                  ) : null}
                  <View className='flex-col'>
                    <Text className='font-medium text-sm text-[#eeeeec]' style={styles.textShadow}>Target</Text>
                    <Text className='text-[#eeeeec]'>{allExercises[currentIndex].reps ? `${allExercises[currentIndex].reps} reps`: allExercises[currentIndex].time}</Text>
                  </View>
                  {allExercises[currentIndex].time ? (
                    <View className='flex-col'>
                      <Text className='font-medium text-sm text-[#eeeeec]' style={styles.textShadow}>Time</Text>
                      <Text className='text-[#eeeeec]'>{allExercises[currentIndex].time} sec</Text>
                    </View>)
                  : null}
                </View>
                {allExercises[currentIndex].notes ? (
                  <View className={`flex-col min-w-20 ${allExercises[currentIndex].notes ? "" : "invisible"}`}>
                  <Text className='font-medium text-sm text-[#eeeeec]' style={styles.textShadow}>Notes</Text>
                  <Text className='text-[#eeeeec]'>{allExercises[currentIndex].notes}</Text>
                  </View>
                ) : null}
                {allExercises[currentIndex].programBlockId ? (
                  <View className='flex-row gap-x-4'>
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
                ) : null}
              </View>
            </View>
          )}
          {nextImage && (
            <View className="absolute -bottom-2 right-4">
              <Text className='relative top-6 z-10 text-lg font-semibold text-[#eeeeec]' style={styles.textShadow}>Up Next:</Text>
              <Image
                key={nextImage}
                source={{ uri: nextImage }}
                style={{ width: 100, aspectRatio: 4/3, borderRadius: 4, alignSelf: 'center', opacity: 0.7 }}
                contentFit="cover"
                transition={200}
              />
            </View>
          )}
          <View className="absolute top-1/2 right-0 z-10">
            <IconButton
              icon="timer"
              iconColor={openDrawer ? Colors[colorScheme ?? "light"].tint : "#eeeeec"}
              onPress={() => {
                // console.log("show timer")
                setOpenDrawer(!openDrawer)
              }}
            />
            {allExercises[currentIndex].programBlockId ? (
              <IconButton
                icon="comment-processing"
                iconColor="#eeeeec"
                onPress={() => {
                  // setContent(true)
                  open()
                }}
              />
            ) : null}
          </View>
        </ThemedView>
        <View className="flex-row w-full px-3 justify-between absolute" style={{ bottom: tabBarHeight ? tabBarHeight+12 : 32 }}>
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
              // setShowStopwatch(false)
              // dispatch(resetWorkoutLog())
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
            icon={nextImage ? "chevron-right" : "flag-checkered"}
            size="medium"
            label={nextImage ? "Next" : "Finish"}
            style={{ ...styles.nextButton, backgroundColor: Colors[colorScheme ?? 'light'].tint }}
            color="black"
            disabled={((!allExercises[currentIndex].gif && allExercises[currentIndex].rest !== "None") || countdownRunning || !showStopwatch)}
            onPress={() => {
              // console.log("current time", stopwatchRef.current?.getCurrentTime())
              setOpenDrawer(false)
              if (allExercises[currentIndex].programBlockId) {
                const currentSetData = {
                  programBlockId: allExercises[currentIndex].programBlockId,
                  exerciseId: allExercises[currentIndex].exerciseId,
                  exerciseName: allExercises[currentIndex].name,
                  // exerciseThumbnail: allExercises[currentIndex].gif,
                  orderInBlock: allExercises[currentIndex].orderInBlock,
                  set: {
                    set: allExercises[currentIndex].currentSet,
                    actualReps: currentReps,
                    load: currentLoad ? parseInt(currentLoad) : undefined,
                    notes: currentNotes,
                    unit: "pound",
                  },
                  // target: restMappedDetails[currentIndex].target,
                  targetReps: allExercises[currentIndex].reps ?? undefined,
                  time: allExercises[currentIndex].time ?? undefined,
                }
                dispatch(recordProgramSet(currentSetData))
                // dispatch(setClearBottomSheet(true))
              }
              // console.log(currentSetData)
              if (allExercises[currentIndex+1]) {
                setCurrentIndex(currentIndex+1)
                setCurrentLoad("")
                setCurrentReps("")
                setCurrentNotes("")
                if (allExercises[currentIndex+1].programBlockId) {
                  dispatch(setCurrentExercise(allExercises[currentIndex+1]))
                }
              }
              else {
                const workoutDuration = `${stopwatchRef.current?.getCurrentTime()}`
                dispatch(finishProgramWorkout(workoutDuration))
                router.push({
                  pathname: "/(tabs)/(programs)/reviewProgramWorkout",
                  params: {
                    programId,
                    previewImgUri: program.s3ImageKey,
                    programName: program.name,
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
              <DialogButton
                type="clear"
                titleStyle={{ color: Colors[colorScheme ?? 'light'].text }}
                onPress={() => setOpenDialog(false)}
              >
                No
              </DialogButton>
              <DialogButton
                titleStyle={{ color: "black" }}
                buttonStyle={{ backgroundColor: Colors[colorScheme ?? 'light'].tint, borderRadius: 4 }}
                onPress={() => {
                  // dispatch(resetWorkoutLog())
                  // dispatch(cancelWorkout())
                  router.back()
                }}
              >
                Yes
              </DialogButton>
            </View>
          </Dialog.Actions>
        </Dialog>
        <AnimatedDrawer
          isOpen={openDrawer}
          onClose={() => setOpenDrawer(false)}
          showOverlay={false}
          drawerWidth={200}
          position={{ bottom: 200, right: 16 }}
        >
          <CountdownTimer
            // ref={countdownRef}
            showPresetTimes={false}
            // autoStart={true}
            showCustomInput={false}
            showControls={false}
            showReset={true}
            showSound={true}
            label="Timer"
            defaultTime={allExercises[currentIndex].time ? allExercises[currentIndex].time : undefined}
            // onStateChange={handleCountdownStateChange}
            align='flex-end'
            // onCountdownEnd={() => setShowStopwatch(true)}
          />
        </AnimatedDrawer>
      </ThemedSafeAreaView>
    );
  }

  return (
    <ThemedSafeAreaView className='flex-1'>

    </ThemedSafeAreaView>
  )
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
  buttonBase: {
    // minWidth: 100,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  drawer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: height * 0.5,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    zIndex: 10,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  comment: { fontSize: 16, marginVertical: 4 },
})