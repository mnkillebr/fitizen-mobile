import { useColorScheme } from "@/hooks/useColorScheme";
import { api, apiClient } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, router } from "expo-router";
import { View, Text, SafeAreaView, ImageBackground, StyleSheet, Dimensions, Pressable, FlatList, SectionList, Image, Alert, ActivityIndicator } from "react-native";
import { FAB, IconButton } from "react-native-paper";
import { Colors } from "@/constants/Colors";

import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { ThemedText } from "@/components/ThemedText";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useMemo, useRef, useState } from "react";
import { ThemedView } from "@/components/ThemedView";
import CurrentDate from "@/components/CurrentDate";
import { sortByMultipleProperties } from "@/lib/utils";
import { Dialog } from "@rneui/themed";
import { WorkoutCompleted } from "@/components/WorkoutCompleted";

type CircuitItemDataType = {
  actualReps: string;
  exerciseId: string;
  exerciseName: string;
  // target: "reps" | "time";
  notes?: string;
  targetReps?: string;
  time?: string;
  load: number;
  orderInBlock: number;
  set: number;
  unit: string;
}
type ItemDataType = {
  actualReps: string;
  exerciseId: string;
  load: number | undefined;
  set: number;
  unit: string;
}

const { height, width } = Dimensions.get("window")

export default function ReviewProgramWorkout() {
  // hooks
  const [openDialog, setOpenDialog] = useState(false);
  const { previewImgUri, programId, programName } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const tabBarHeight = useBottomTabBarHeight();
  const programWorkoutLog = useSelector((state: RootState) => state.programWorkoutLog);

  // requests
  const saveProgramWorkoutMutation = useMutation({
    mutationFn: (workoutData) => apiClient.programs.saveProgramWorkout(workoutData),
    onSuccess: (data) => {
      // Alert.alert('Success', 'Workout logged successfully!', [
      //   {
      //     text: 'OK',
      //     onPress: () => {
      //       console.log("do nothing", data)
      //       // router.replace('/(tabs)/(workouts)')
      //     } 
      //   },
      // ]);
      setOpenDialog(true)
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to save workout log. Please try again.');
    },
  });

  const logData = useMemo(() => {
    if (programWorkoutLog.exerciseLogs) {
      return programWorkoutLog.exerciseLogs.reduce((result, curr) => {
        let resultArr = result
        if (curr.programBlockId) {  
          if (resultArr.find(log => log.programBlockId === curr.programBlockId)) {
            resultArr = resultArr.map(log => {
              if (log.programBlockId === curr.programBlockId) {
                return {
                  ...log,
                  data: sortByMultipleProperties([
                    ...log.data,
                    ...curr.sets.map(set => ({
                      ...set,
                      exerciseId: curr.exerciseId,
                      exerciseName: curr.exerciseName,
                      orderInBlock: curr.orderInBlock,
                      targetReps: curr.targetReps,
                      time: curr.time,
                    }))
                  ], [
                    { key: "set", order: "asc" },
                    { key: "orderInBlock", order: "asc" },
                  ])
                }
              } else {
                return log
              }
            })
          } else {
            resultArr = resultArr.concat({
              title: `Block`,
              data: sortByMultipleProperties(curr.sets.map(set => ({
                ...set,
                exerciseId: curr.exerciseId,
                exerciseName: curr.exerciseName,
                orderInBlock: curr.orderInBlock,
                targetReps: curr.targetReps,
                time: curr.time,
              })), [
                { key: "set", order: "asc" },
                { key: "orderInBlock", order: "asc" },
              ]),
              programBlockId: curr.programBlockId,
            })
          }
        } else {
          resultArr = resultArr.concat({
            title: curr.exerciseName,
            exerciseId: curr.exerciseId,
            data: curr.sets.map(set => ({...set, exerciseId: curr.exerciseId})),
            thumbnail: curr.exerciseThumbnail,
            targetReps: curr.targetReps,
            time: curr.time,
          })
        }
        return resultArr
      }, [])
    } else {
      return []
    }
  }, [programWorkoutLog])

  const circuitMappedExercises = (circuitItem: { data: Array<CircuitItemDataType> }) => {
    return circuitItem.data.reduce((result: any, curr: any) => {
      let resultArr = result
      if (resultArr.find((obj: { set: number }) => obj.set === parseInt(curr.set))) {
        resultArr = resultArr.map((obj: { set: number, exercises: Array<{ orderInBlock: number }> }) => {
          if (obj.set === parseInt(curr.set)) {
            return {
              ...obj,
              exercises: obj.exercises.concat(curr).sort((a, b) => a.orderInBlock - b.orderInBlock)
            }
          } else {
            return obj
          }
        })
      } else {
        resultArr = resultArr.concat({
          set: parseInt(curr.set),
          exercises: [curr],
        })
      }
      return resultArr
    }, [])
  }

  const closeSuccessDialog = () => {
    setOpenDialog(false)
    router.dismissAll()
    // router.dismissTo({
    //   pathname: "/(tabs)/(workouts)/[workoutId]",
    //   params: {
    //     workoutId,
    //   }
    // })
  }

  return (
    <ImageBackground
      key={programId as string}
      source={{ uri: previewImgUri as string ?? "https://res.cloudinary.com/dqrk3drua/image/upload/f_auto,q_auto/v1/fitizen/gn88ph2mplriuumncv2a" }}
      style={styles.backgroundImage}
    >
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center justify-between">
          <IconButton
            icon="arrow-left"
            iconColor={Colors[colorScheme ?? 'light'].tint}
            onPress={() => router.back()}
          />
          <Text className='font-bold text-2xl text-center text-[#eeeeec]' style={styles.textShadow}>{programName}</Text>
          <IconButton
            icon="arrow-left"
            iconColor="black"
            style={{ display: "none" }}
          />
        </View>
        <View className="flex-row justify-between px-4">
          <Text className='font-bold text-center text-[#eeeeec]' style={styles.textShadow}>New Program Log</Text>
          <CurrentDate className='font-bold text-center text-[#eeeeec]' style={styles.textShadow} />
        </View>
        <View className="px-4 mt-2 flex-1">
          <FlatList
            data={logData}
            keyExtractor={item => item.programBlockId || item.exerciseId}
            showsVerticalScrollIndicator={false}
            renderItem={({item, index}: { item: { programBlockId: string; thumbnail: string; title: string; data: Array<ItemDataType>; target: "reps" | "time"; targetReps?: string; time: string; }, index: number}) => {
              if (item.programBlockId) {
                return (
                  <View className="flex-col my-1" style={{ paddingBottom: logData.length === (index+1) ? tabBarHeight : 0 }}>
                    <Text className="text-[#eeeeec] font-bold" style={styles.textShadow}>{`Block #${logData.filter(log => log.programBlockId).findIndex(log => log.programBlockId === item.programBlockId) + 1}:`}</Text>
                    <View className="border-2 border-dashed border-gray-200 p-2 rounded gap-y-2">
                      {circuitMappedExercises(item).map((circuitRound: {set: number; exercises: Array<CircuitItemDataType>}, circuitIdx: number) => {
                        return (
                          <ThemedView key={`${item.programBlockId}-round-${circuitRound.set}`} className="p-1 flex-col rounded w-full">
                            <Text className="dark:text-[#eeeeec] font-bold mb-1">Round {circuitRound.set}</Text>
                            <View className="flex-col gap-1">
                              {circuitRound.exercises.map((exercise: CircuitItemDataType, exIdx: number) => (
                                <View
                                  key={`${item.programBlockId}-round-${circuitRound.set}-exercise-${exercise.exerciseId}-${exIdx}`}
                                  className={`flex-row w-full gap-2 py-2 flex-wrap ${(exIdx + 1) < circuitRound.exercises.length ? "border-b-hairline border-white" : ""}`}
                                >
                                  <View className="w-[calc(40%)] overflow-hidden">
                                    <Text className="text-sm self-start font-medium dark:text-[#eeeeec]">Name</Text>
                                    <Text className="text-sm dark:text-[#eeeeec]" style={{ flexWrap: "nowrap"}}>{exercise.exerciseName}</Text>
                                  </View>
                                  <View className="w-14">
                                    <Text className="text-sm self-start font-medium dark:text-[#eeeeec]">Target</Text>
                                    <Text className="text-sm dark:text-[#eeeeec]">{exercise.targetReps ? `${exercise.targetReps} reps`: exercise.time}</Text>
                                  </View>
                                  <View className="">
                                    <Text className="text-sm self-start font-medium dark:text-[#eeeeec]">Reps</Text>
                                    <Text className="w-10 text-sm dark:text-[#eeeeec]">{exercise.actualReps}</Text>
                                  </View>
                                  <View className="">
                                    <Text className="text-sm self-start font-medium dark:text-[#eeeeec]">Load</Text>
                                    <Text className="w-fit text-sm dark:text-[#eeeeec]">{exercise.load ? exercise.load : "None"}</Text>
                                  </View>
                                  {exercise.notes ? (
                                    <View className="">
                                      <Text className="text-sm self-start font-medium dark:text-[#eeeeec]">Notes</Text>
                                      <Text className="w-fit text-sm dark:text-[#eeeeec]">{exercise.notes}</Text>
                                    </View>
                                  ) : null}
                                </View>
                              ))}
                            </View>
                          </ThemedView>
                        )
                      })}
                    </View>
                  </View>
                )   
              }
              return (
                <View className="flex-col my-1 rounded" style={{ paddingBottom: logData.length === (index+1) ? tabBarHeight : 0 }}>
                  <View className="flex-row gap-2">
                    <Text className="text-[#eeeeec] font-bold" style={styles.textShadow}>{`Exercise #${logData.filter(log => log.exerciseId).findIndex(log => log.exerciseId === item.exerciseId) + 1}:`}</Text>
                    <Text className="text-[#eeeeec] font-bold" style={styles.textShadow}>{item.title}</Text>
                  </View>
                  <View className="flex-row">
                    <Image
                      source={{ uri: item.thumbnail ?? "https://res.cloudinary.com/dqrk3drua/image/upload/f_auto,q_auto/v1/fitizen/gn88ph2mplriuumncv2a" }}
                      style={{ height: 50, aspectRatio: 4/3, borderRadius: 4, }}
                    />
                    {item.data.map((dataItem: ItemDataType, dataIdx: number) => {
                      return (
                        <ThemedView key={`item-${dataItem.exerciseId}`} className="my-0.5 mx-1 p-1 flex-row gap-2 rounded">
                          <View className="flex-row w-full gap-4">
                            <Text className="dark:text-[#eeeeec] font-bold">Set {dataIdx+1}</Text>
                            <View className="flex-row flex-wrap max-w-full gap-x-4 gap-y-0">
                              <View className="w-14">
                                <Text className="text-sm self-start font-medium dark:text-[#eeeeec]">Target</Text>
                                <Text className="text-sm dark:text-[#eeeeec]">{item.targetReps ? `${item.targetReps} reps`: item.time}</Text>
                              </View>
                              <View className="">
                                <Text className="text-sm self-start font-medium dark:text-[#eeeeec]">Reps</Text>
                                <Text className="w-10 text-sm dark:text-[#eeeeec]">{dataItem.actualReps}</Text>
                              </View>
                              <View className="">
                                <Text className="text-sm self-start font-medium dark:text-[#eeeeec]">Load</Text>
                                <Text className="w-fit text-sm dark:text-[#eeeeec]">{dataItem.load ? dataItem.load : "None"}</Text>
                              </View>
                            </View>
                          </View>
                        </ThemedView>
                      )
                    })}
                  </View>
                </View>
              )
            }}
            ListEmptyComponent={<Text className="text-center text-sm/6 mt-2 text-[#eeeeec]">No Exercises</Text>}
          />
        </View>
        <FAB
          icon="check"
          loading={saveProgramWorkoutMutation.isPending}
          size="medium"
          label="Save Workout"
          style={{
            ...styles.saveButton,
            backgroundColor: Colors[colorScheme ?? 'light'].tint,
            bottom: tabBarHeight + 12
          }}
          color="black"
          onPress={() => {
            saveProgramWorkoutMutation.mutate({
              ...programWorkoutLog,
              action: "saveProgramWorkoutLog",
            })
          }}
        />
        <Dialog
          isVisible={openDialog}
          onBackdropPress={closeSuccessDialog}
          overlayStyle={{ backgroundColor: Colors[colorScheme ?? 'light'].background, borderWidth: 1, borderColor: Colors[colorScheme ?? 'light'].border }}
        >
          <WorkoutCompleted
            workoutName={`${programName} - Week ${programWorkoutLog.programWeek} - Day ${programWorkoutLog.programDay}`}
            closeDialog={closeSuccessDialog}
          />
        </Dialog>
      </SafeAreaView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  textShadow: {
    textShadowColor: "#000",
    textShadowOffset: {
      width: 0.75,
      height: 0.75,
    },
    textShadowRadius: 2,
  },
  saveButton: {
    width: 170,
    height: 50,
    position: "absolute",
    right: 8,
    justifyContent: "center",
    alignSelf: "flex-end"
  },
});