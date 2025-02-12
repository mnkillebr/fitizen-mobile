import CountdownTimer, { CountdownHandle } from '@/components/Countdown';
import Stopwatch, { StopwatchHandle } from '@/components/Stopwatch';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedSafeAreaView } from '@/components/ThemeSafeAreaView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { api, apiClient } from '@/lib/api';
import { resetWorkoutLog, recordSet, cancelWorkout, finishWorkout, setCurrentExercise } from '@/redux/slices/workoutLogSlice';
import { RootState } from '@/redux/store';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Dialog } from '@rneui/themed';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Keyboard, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image, ImageBackground } from 'expo-image';
import { FAB, IconButton, TextInput, } from 'react-native-paper';
import { useDispatch, useSelector } from "react-redux";
import { useBottomSheet } from '@/providers/bottom-sheet-provider';
import AnimatedDrawer from '@/components/AnimatedDrawer';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

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

const { height, width } = Dimensions.get("window")

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

export default function WorkoutFlowScreen() {
  const { workoutId } = useLocalSearchParams();
  const [workoutPaused, setWorkoutPaused] = useState(false)
  const colorScheme = useColorScheme();
  const tabBarHeight = useBottomTabBarHeight();
  const stopwatchRef = useRef<StopwatchHandle>(null);
  const countdownRef = useRef<CountdownHandle>(null);
  const countdownRef2 = useRef<CountdownHandle>(null);
  const scrollOffsetValue = useSharedValue<number>(0);
  const carouselProgress = useSharedValue<number>(0);
  const carouselRef = useRef<ICarouselInstance>(null);
  const [currentLoad, setCurrentLoad] = useState<number | undefined>(undefined);
  const [currentReps, setCurrentReps] = useState<number | undefined>(undefined);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showStopwatch, setShowStopwatch] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [countdownRunning, setCountdownRunning] = useState(false);
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const { open, } = useBottomSheet();
  const dispatch = useDispatch()

  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['workout', workoutId.toString()],
    queryFn: () => apiClient.workouts.workoutDetail(workoutId.toString())
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
      const flattenedDetails = exerciseDetails.flatMap((ex, exIdx) => {
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
      return flattenedDetails.map((ex, exIdx) => ({
        ...ex,
        next: flattenedDetails[exIdx+1] ? (flattenedDetails[exIdx+1].gif || flattenedDetails[exIdx+1].img) : undefined
      }))
    } else {
      return []
    }
  }, [exerciseDetails])

  useEffect(() => {
    if (restMappedDetails.length) {
      preloadImages();
      if (restMappedDetails[currentIndex].exerciseId) {
        dispatch(setCurrentExercise(restMappedDetails[currentIndex]))
      }
    }
  }, [currentIndex, restMappedDetails]);

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
      .filter((index) => restMappedDetails[index])
      .map((index) => restMappedDetails[index].gif || restMappedDetails[index].img);

    preloadUris.forEach((uri) => Image.prefetch(uri));
  };

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

  const currentImage = restMappedDetails[currentIndex].gif || restMappedDetails[currentIndex].img
  const nextImage = restMappedDetails[currentIndex+1] ? (restMappedDetails[currentIndex+1].gif || restMappedDetails[currentIndex+1].img) : undefined
  const skip = ((!restMappedDetails[currentIndex].gif && restMappedDetails[currentIndex].rest !== "None") || countdownRunning || !showStopwatch)

  return (
    <ThemedSafeAreaView className='flex-1 relative flex-col'>
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
          <Text className='font-bold text-2xl text-[#eeeeec]' style={styles.textShadow}>{workout.name}</Text>
          <IconButton
            icon="export-variant"
            iconColor={Colors[colorScheme ?? 'light'].tint}
            // iconColor="black"
            style={styles.shadow}
            // onPress={() => setOpenDialog(true)}
          />
        </View>
        <View className='absolute top-24 z-10 flex-row flex-1 gap-2 flex-wrap mx-6'>
          {restMappedDetails.map((item, idx) => (
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
          data={restMappedDetails}
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
                circuitId: restMappedDetails[currentIndex].circuitId,
                exerciseId: restMappedDetails[currentIndex].exerciseId,
                exerciseName: restMappedDetails[currentIndex].name,
                exerciseThumbnail: restMappedDetails[currentIndex].thumbnail,
                orderInRoutine: restMappedDetails[currentIndex].orderInRoutine,
                set: {
                  set: restMappedDetails[currentIndex].currentSet,
                  // actualReps: currentReps,
                  // load: currentLoad ? parseInt(currentLoad) : undefined,
                  unit: "pound",
                },
                target: restMappedDetails[currentIndex].target,
                targetReps: restMappedDetails[currentIndex].reps ?? undefined,
                time: restMappedDetails[currentIndex].time ?? undefined,
              }
              // console.log(currentSetData)
              if (restMappedDetails[currentIndex].exerciseId) {
                dispatch(recordSet(currentSetData))
              }
              if (restMappedDetails[index]) {
                setCurrentIndex(index)
                // setCurrentLoad("")
                // setCurrentReps("")
                if (restMappedDetails[index].time) {
                  const newTime = restMappedDetails[index].time.includes("min") ? parseInt(restMappedDetails[index].time) * 60 : parseInt(restMappedDetails[index].time)
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
                        <Text className='text-[#eeeeec]'>{item.currentSet}/{item.sets}</Text>
                      </View>
                      <View className='flex-col'>
                        <Text className='font-medium text-sm text-[#eeeeec]' style={styles.textShadow}>Target</Text>
                        <Text className='text-[#eeeeec]'>{item.target === "reps" ? `${item.reps} reps`: item.time}</Text>
                      </View>
                      <View className={`flex-col min-w-20 ${item.notes ? "" : "invisible"}`}>
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
        {/* <View className='absolute top-14 left-36 z-10'>
          <Text className='text-lg text-[#eeeeec]'>{`${(currentIndex/restMappedDetails.length*100).toPrecision(2)}%`}</Text>
        </View> */}
        <View className={`absolute z-10 ${showStopwatch ? "-top-1" : "top-20 inset-x-0"}`}>
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
      {restMappedDetails[currentIndex].exerciseId ? (
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
          <IconButton
            icon="comment-processing"
            iconColor="#eeeeec"
            onPress={() => {
              // setContent(true)
              open()
            }}
          />
        </View>
      ) : null}
      {restMappedDetails[currentIndex].exerciseId ? (
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
      <View className="flex-row-reverse w-full px-3 absolute" style={{ bottom: tabBarHeight ? tabBarHeight + 12 : 32 }}>
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
            setShowStopwatch(false)
            setCountdownRunning(true)
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
        /> */}
        {(currentIndex+1) === restMappedDetails.length && <FAB
          icon={nextImage && skip ? "timer-sand" : nextImage ? "chevron-right" : "flag-checkered"}
          size="medium"
          label={nextImage && skip ? "Skip" : nextImage ? "Next" : "Finish"}
          style={{ ...styles.nextButton, backgroundColor: Colors[colorScheme ?? 'light'].tint }}
          color="black"
          onPress={() => {
            // console.log("current time", stopwatchRef.current?.getCurrentTime())
            if (!showStopwatch) {
              setCountdownRunning(false)
              setShowStopwatch(true)
            } else {
              setCountdownRunning(false)
              const currentSetData = {
                circuitId: restMappedDetails[currentIndex].circuitId,
                exerciseId: restMappedDetails[currentIndex].exerciseId,
                exerciseName: restMappedDetails[currentIndex].name,
                exerciseThumbnail: restMappedDetails[currentIndex].thumbnail,
                orderInRoutine: restMappedDetails[currentIndex].orderInRoutine,
                set: {
                  set: restMappedDetails[currentIndex].currentSet,
                  // actualReps: currentReps,
                  // load: currentLoad ? parseInt(currentLoad) : undefined,
                  unit: "pound",
                },
                target: restMappedDetails[currentIndex].target,
                targetReps: restMappedDetails[currentIndex].reps ?? undefined,
                time: restMappedDetails[currentIndex].time ?? undefined,
              }
              // console.log(currentSetData)
              if (restMappedDetails[currentIndex].exerciseId) {
                dispatch(recordSet(currentSetData))
              }
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
                dispatch(resetWorkoutLog())
                dispatch(cancelWorkout())
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
        position={{ bottom: 220, right: 16 }}
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

const styles = StyleSheet.create({
  mediaWrapper: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',  // Allows showing previous, current, and next items
    position: 'absolute',
  },
  mediaItem: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
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
    // height: 640,
    aspectRatio: 9/16,
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
  input: {
    // flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    // height: 100,
    overflow: 'scroll',
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
})