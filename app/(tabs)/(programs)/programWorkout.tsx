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
import { ActivityIndicator, Alert, Animated, Dimensions, Keyboard, Pressable, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Image, ImageBackground } from 'expo-image';
import { FAB, IconButton, TextInput, } from 'react-native-paper';
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from '@/providers/auth-provider';
import { setClearBottomSheet, setToggleHideTabs } from '@/redux/slices/uiSlice';
import { CommentsDrawer } from '@/components/CommentsDrawer';
import { useBottomSheet } from '@/providers/bottom-sheet-provider';
import { finishProgramWorkout, recordProgramSet, setCurrentProgramExercise } from '@/redux/slices/programWorkoutLogSlice';
import AnimatedDrawer from '@/components/AnimatedDrawer';
import { LinearGradient } from 'expo-linear-gradient';
import { useSharedValue } from 'react-native-reanimated';
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

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

interface CarouselExerciseItemType {
  gif: string;
  img: string;
  next?: string;
  exerciseId?: string;
  name?: string;
  currentSet?: number;
  sets?: string;
  target?: string;
  reps?: string;
  time?: string;
  notes?: string;
  rest?: string;
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
  const countdownRef2 = useRef<CountdownHandle>(null);
  const scrollOffsetValue = useSharedValue<number>(0);
  const carouselRef = useRef<ICarouselInstance>(null);
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
      const allExercises = [
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
        allExercises: allExercises.map((ex, exIdx) => ({
          ...ex,
          next: allExercises[exIdx+1] ? (allExercises[exIdx+1].gif || allExercises[exIdx+1].img) : undefined
        }))
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
      if (allExercises[currentIndex].exerciseId) {
        dispatch(setCurrentProgramExercise(allExercises[currentIndex]))
      }
    }
  }, [currentIndex, allExercises]);

  const onPressPagination = (index: number) => {
    // console.log("pagination", index)
		carouselRef.current?.scrollTo({
			count: index,
			animated: true,
		});
	};
  
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
          <LinearGradient
            colors={['rgba(0,0,0,0.9)', 'transparent']}
            style={styles.headerBackgroud}
          />
          <View className='w-full absolute top-0 z-20 flex-row justify-between items-center'>
            <IconButton
              icon="arrow-left"
              iconColor={Colors[colorScheme ?? 'light'].tint}
              // iconColor="black"
              style={styles.shadow}
              onPress={() => setOpenDialog(true)}
            />
            <View className='flex-col items-center top-1.5'>
              <Text className='font-bold text-2xl text-[#eeeeec]' style={styles.textShadow}>{program.name}</Text>
              <Text className='font-bold text-lg text-[#eeeeec] -mt-2' style={styles.textShadow}>Week {programWeek} - Day {programDay}</Text>
            </View>
            <IconButton
              icon="export-variant"
              iconColor={Colors[colorScheme ?? 'light'].tint}
              // iconColor="black"
              style={styles.shadow}
              // onPress={() => setOpenDialog(true)}
            />
          </View>
          <View className='absolute top-24 z-10 flex-row flex-1 gap-2 flex-wrap mx-6'>
            {allExercises.map((item, idx) => (
              <Pressable
                key={idx}
                onPress={() => onPressPagination(idx-currentIndex)}
              >
                <View
                  className="w-8 h-1 rounded-sm"
                  style={[
                    { backgroundColor: idx <= currentIndex ? "#fff" : "gray" },
                    styles.shadow,
                  ]}
                />
              </Pressable>
            ))}
          </View>
          {/* <Image
            key={currentImage}
            source={{ uri: currentImage }}
            style={{ width: "100%", aspectRatio: 9/16, borderRadius: 4, alignSelf: 'center', opacity: showStopwatch ? 1 : 0.5 }}
            contentFit="cover"
            transition={100}
          /> */}
          <Carousel
            ref={carouselRef}
            loop={false}
            width={width}
            height={height}
            snapEnabled={true}
            pagingEnabled={true}
            data={allExercises}
            defaultScrollOffsetValue={scrollOffsetValue}
            // style={{ width: "100%" }}
            // onScrollStart={() => {
            //   console.log("Scroll start");
            // }}
            // onScrollEnd={() => {
            //   console.log("Scroll end");
            // }}
            onConfigurePanGesture={(g: { enabled: (arg0: boolean) => any }) => {
              "worklet";
              g.enabled(false);
            }}
            onSnapToItem={(index: number) => {
              // console.log("current", currentIndex, "go to", index)
              // setCurrentIndex(index)
              setOpenDrawer(false)
              if (!showStopwatch) {
                setCountdownRunning(false)
                setShowStopwatch(true)
              } else {
                setCountdownRunning(false)
                const currentSetData = {
                  programBlockId: allExercises[currentIndex].programBlockId,
                  exerciseId: allExercises[currentIndex].exerciseId,
                  exerciseName: allExercises[currentIndex].name,
                  // exerciseThumbnail: allExercises[currentIndex].gif,
                  orderInBlock: allExercises[currentIndex].orderInBlock,
                  set: {
                    set: allExercises[currentIndex].currentSet,
                    // actualReps: currentReps,
                    // load: currentLoad ? parseInt(currentLoad) : undefined,
                    // notes: currentNotes,
                    unit: "pound",
                  },
                  // target: restMappedDetails[currentIndex].target,
                  targetReps: allExercises[currentIndex].reps ?? undefined,
                  time: allExercises[currentIndex].time ?? undefined,
                }
                // console.log(currentSetData)
                if (allExercises[currentIndex].exerciseId) {
                  dispatch(recordProgramSet(currentSetData))
                }
                if (allExercises[index]) {
                  setCurrentIndex(index)
                  // setCurrentLoad("")
                  // setCurrentReps("")
                  if (allExercises[index].time) {
                    const newTime = typeof allExercises[index].time === "number" ? allExercises[index].time : allExercises[index].time.includes("min") ? parseInt(allExercises[index].time) * 60 : parseInt(allExercises[index].time)
                    handleResetCountdown(newTime)
                    countdownRef.current?.resume();
                  }
                }
              }
            }}
            renderItem={({ item }: { item: CarouselExerciseItemType }) => {
              const current = item.gif || item.img
              const next = item.next
              let rest = 0
              if (item.rest) {
                rest = item.rest.includes("min") ? parseInt(item.rest) * 60 : parseInt(item.rest)
                // countdownRef2.current?.pause()
                // countdownRef2.current?.reset(rest)
              }
              return (
                <View className='h-full'>
                  <ImageBackground
                    key={current}
                    source={{ uri: current }}
                    style={{ width: "100%", aspectRatio: 9/16, opacity: showStopwatch ? 1 : 0.5 }}
                    contentFit="cover"
                    transition={100}
                  >
                  {item.exerciseId ? (
                    <View className="absolute bottom-4 inset-x-0 w-3/4">
                      {/* <Text className='text-lg font-semibold ml-4 text-[#eeeeec]' style={styles.textShadow}>Current Exercise:</Text> */}
                      <Text className='text-lg font-bold ml-4 text-[#eeeeec]' style={styles.textShadow}>{item.name}</Text>
                      <View className='flex-row gap-x-4 gap-y-2 ml-4 flex-wrap w-2/3'>
                        <View className='flex-col'>
                          <Text className='font-medium text-sm text-[#eeeeec]' style={styles.textShadow}>Sets</Text>
                          <Text className='text-[#eeeeec]'>{item.currentSet ?? 1}/{item.sets ?? 1}</Text>
                        </View>
                        <View className='flex-col'>
                          <Text className='font-medium text-sm text-[#eeeeec]' style={styles.textShadow}>Target</Text>
                          <Text className='text-[#eeeeec]'>{item.reps && item.time ? `${item.reps} reps, ${item.time} sec per rep` : item.reps ? `${item.reps} reps`: item.time}</Text>
                        </View>
                        <View className={`flex-col min-w-20 ${item.notes ? "" : "hidden"}`}>
                          <Text className='font-medium text-sm text-[#eeeeec]' style={styles.textShadow}>Notes</Text>
                          <Text className='text-[#eeeeec]'>{item.notes}</Text>
                        </View>
                        {/* <View className='flex-col'>
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
                        </View> */}
                      </View>
                    </View>
                  ) : (
                    <View className="absolute bottom-56 inset-x-0">
                      <CountdownTimer
                        ref={countdownRef2}
                        showPresetTimes={false}
                        autoStart={false}
                        showCustomInput={false}
                        showControls={false}
                        showReset={false}
                        showPlay
                        showSound={true}
                        // defaultTime={1}
                        defaultTime={rest}
                      />
                      <Text className='text-3xl font-semibold text-center text-[#eeeeec]' style={styles.textShadow}>Rest Period</Text>
                    </View>
                  )}
                  {next && (
                    <View className="absolute bottom-4 right-4">
                      <ImageBackground
                        key={next}
                        source={{ uri: next }}
                        style={{ width: 100, aspectRatio: 4/3, borderRadius: 4, alignSelf: 'center', opacity: 0.85 }}
                        contentFit="cover"
                        transition={100}
                      >
                        <Text className='left-1 text-lg font-semibold text-[#eeeeec]' style={styles.textShadow}>Up Next:</Text>
                      </ImageBackground>
                    </View>
                  )}
                  </ImageBackground>
                </View>
              )
            }}
          />
          <View className={`absolute z-10 ${showStopwatch ? "" : "top-20 inset-x-0"}`}>
            {showStopwatch ? (
              <Stopwatch
                ref={stopwatchRef}
                autoStart={true}
                // label='Elapsed Time'
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
                showPlay={false}
                label="Get Ready!"
                // defaultTime={1}
                onStateChange={handleCountdownStateChange}
                onCountdownEnd={() => {
                  setCountdownRunning(false)
                  setShowStopwatch(true)
                }}
              />
            )}
          </View>
        </ThemedView>
        <View className="absolute top-1/2 right-0 z-10">
          <IconButton
            icon="timer"
            iconColor={openDrawer ? Colors[colorScheme ?? "light"].tint : "#eeeeec"}
            onPress={() => {
              // console.log("show timer")
              setOpenDrawer(!openDrawer)
              countdownRef.current?.reset(0)
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
        {allExercises[currentIndex].programBlockId ? (
          <TouchableOpacity
            className="absolute bottom-5 self-center z-10"
            onPress={() => {
              open()
            }}
          >
            <IconButton
              icon="chevron-up"
              iconColor="#eeeeec"
            />
            <Text className="text-[#eeeeec] text-center relative bottom-5">Log Set</Text>
          </TouchableOpacity>
        ) : null}
        <View className="flex-row-reverse w-full px-3 justify-between absolute" style={{ bottom: tabBarHeight ? tabBarHeight+12 : 32 }}>
          {/* <FAB
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
          /> */}
          {(currentIndex+1) === allExercises.length && <FAB
            icon={nextImage ? "chevron-right" : "flag-checkered"}
            size="medium"
            label={nextImage ? "Next" : "Finish"}
            style={{ ...styles.nextButton, backgroundColor: Colors[colorScheme ?? 'light'].tint }}
            color="black"
            disabled={((!allExercises[currentIndex].gif && allExercises[currentIndex].rest !== "None") || countdownRunning || !showStopwatch)}
            onPress={() => {
              // console.log("current time", stopwatchRef.current?.getCurrentTime())
              if (!showStopwatch) {
                setCountdownRunning(false)
                setShowStopwatch(true)
              } else {
                setCountdownRunning(false)
                setOpenDrawer(false)
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
                if (allExercises[currentIndex].programBlockId) {
                  dispatch(recordProgramSet(currentSetData))
                }
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
          />}
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
            defaultTime={0}
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
  headerBackgroud: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 80,
    zIndex: 1
  },
  backgroundImage: {
    flex: 1,
    // backgroundSize: "cover",
    // backgroundPosition: "center",
    height: 640,
    width: "100%"
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
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