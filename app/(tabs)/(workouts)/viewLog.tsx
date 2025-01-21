import { useColorScheme } from "@/hooks/useColorScheme";
import { api, apiClient } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, router } from "expo-router";
import { View, Text, SafeAreaView, ImageBackground, StyleSheet, Dimensions, Pressable, FlatList, SectionList, Image, Alert, ActivityIndicator, ScrollView, RefreshControl } from "react-native";
import { FAB, IconButton } from "react-native-paper";
import { Colors } from "@/constants/Colors";

import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { ThemedText } from "@/components/ThemedText";
import { useMemo, useRef, useState } from "react";
import { ThemedView } from "@/components/ThemedView";
import CurrentDate from "@/components/CurrentDate";
import { sortByMultipleProperties } from "@/lib/utils";
import { Dialog, Skeleton } from "@rneui/themed";

type CircuitItemDataType = {
  actualReps: string;
  exerciseId: string;
  exerciseName: string;
  target: "reps" | "time";
  targetReps?: string;
  time?: string;
  load: number;
  orderInRoutine: number;
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

export default function ViewWorkoutLog() {
  // hooks
  const { logId, workoutImgUri, workoutName } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const tabBarHeight = useBottomTabBarHeight();
  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['workoutLog', logId.toString()],
    queryFn: () => apiClient.workouts.workoutLog(logId.toString()),
    staleTime: 3600,
  });

  const logData = useMemo(() => {
    if (data.exerciseLogs) {
      return data.exerciseLogs.reduce((result, curr) => {
        let resultArr = result
        if (curr.circuitId) {  
          if (resultArr.find(log => log.circuitId === curr.circuitId)) {
            resultArr = resultArr.map(log => {
              if (log.circuitId === curr.circuitId) {
                return {
                  ...log,
                  data: sortByMultipleProperties([
                    ...log.data,
                    ...curr.sets.map(set => ({
                      ...set,
                      exerciseId: curr.exerciseId,
                      exerciseName: curr.exercise.name,
                      orderInRoutine: curr.orderInRoutine,
                      target: curr.target,
                      targetReps: curr.targetReps,
                      time: curr.time,
                    }))
                  ], [
                    { key: "set", order: "asc" },
                    { key: "orderInRoutine", order: "asc" },
                  ])
                }
              } else {
                return log
              }
            })
          } else {
            resultArr = resultArr.concat({
              title: `Circuit`,
              data: sortByMultipleProperties(curr.sets.map(set => ({
                ...set,
                exerciseId: curr.exerciseId,
                exerciseName: curr.exercise.name,
                orderInRoutine: curr.orderInRoutine,
                target: curr.target,
                targetReps: curr.targetReps,
                time: curr.time,
              })), [
                { key: "set", order: "asc" },
                { key: "orderInRoutine", order: "asc" },
              ]),
              circuitId: curr.circuitId,
            })
          }
        } else {
          resultArr = resultArr.concat({
            title: curr.exercise.name,
            exerciseId: curr.exerciseId,
            data: curr.sets.map(set => ({...set, exerciseId: curr.exerciseId})),
            thumbnail: curr.exerciseThumbnail,
            target: curr.target,
            targetReps: curr.targetReps,
            time: curr.time,
          })
        }
        return resultArr
      }, [])
    } else {
      return []
    }
  }, [data])

  const circuitMappedExercises = (circuitItem: { data: Array<CircuitItemDataType> }) => {
    return circuitItem.data.reduce((result: any, curr: any) => {
      let resultArr = result
      if (resultArr.find((obj: { set: number }) => obj.set === parseInt(curr.set))) {
        resultArr = resultArr.map((obj: { set: number, exercises: Array<{ orderInRoutine: number }> }) => {
          if (obj.set === parseInt(curr.set)) {
            return {
              ...obj,
              exercises: obj.exercises.concat(curr).sort((a, b) => a.orderInRoutine - b.orderInRoutine)
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

  return (
    <ImageBackground
      key={logId as string}
      source={{ uri: workoutImgUri as string ?? "https://res.cloudinary.com/dqrk3drua/image/upload/f_auto,q_auto/v1/fitizen/gn88ph2mplriuumncv2a" }}
      style={styles.backgroundImage}
    >
      {isLoading ? (
        <SafeAreaView className="flex-1">
          <ActivityIndicator />
          <ScrollView showsVerticalScrollIndicator={false} className="p-4">
            {[...Array(4)].map((item, index) => <Skeleton key={`skeleton-${index}`} height={80} className='my-2 rounded-lg' skeletonStyle={{ backgroundColor: "gray" }} />)}
          </ScrollView>
        </SafeAreaView>
      ) : (
        <SafeAreaView className="flex-1">
          <View className="flex-row items-center justify-between">
            <IconButton
              icon="arrow-left"
              iconColor="black"
              style={{ backgroundColor: Colors[colorScheme ?? 'light'].tint }}
              onPress={() => router.back()}
            />
            <Text className='font-bold text-2xl text-center text-[#eeeeec]' style={styles.textShadow}>{workoutName}</Text>
            <IconButton
              icon="arrow-left"
              iconColor="black"
              style={{ display: "none" }}
            />
          </View>
          <View className="flex-row justify-between px-4">
            <Text className='font-bold text-center text-[#eeeeec]' style={styles.textShadow}>Workout Log</Text>
            <CurrentDate className='font-bold text-center text-[#eeeeec]' style={styles.textShadow} incomingDate={data.date} />
          </View>
          <View className="px-4 mt-2 flex-1">
            <FlatList
              data={logData}
              keyExtractor={item => item.circuitId || item.exerciseId}
              showsVerticalScrollIndicator={false}
              renderItem={({item, index}: { item: { circuitId: string; thumbnail: string; title: string; data: Array<ItemDataType>; target: "reps" | "time"; targetReps?: string; time: string; }, index: number}) => {
                if (item.circuitId) {
                  return (
                    <View className="flex-col my-1" style={{ paddingBottom: logData.length === (index+1) ? tabBarHeight : 0 }}>
                      <Text className="text-[#eeeeec] font-bold" style={styles.textShadow}>{`Circuit #${logData.filter(log => log.circuitId).findIndex(log => log.circuitId === item.circuitId) + 1}:`}</Text>
                      <View className="border-2 border-dashed border-gray-200 p-2 rounded gap-y-2">
                        {circuitMappedExercises(item).map((circuitRound: {set: number; exercises: Array<CircuitItemDataType>}, circuitIdx: number) => {
                          return (
                            <ThemedView key={`${item.circuitId}-round-${circuitRound.set}`} className="p-1 flex-col rounded w-full">
                              <Text className="dark:text-[#eeeeec] font-bold mb-1">Round {circuitRound.set}</Text>
                              <View className="flex-col gap-1">
                                {circuitRound.exercises.map((exercise: CircuitItemDataType, exIdx: number) => (
                                  <View
                                    key={`${item.circuitId}-round-${circuitRound.set}-exercise-${exercise.exerciseId}-${exIdx}`}
                                    className={`flex-row w-full gap-x-2 h-16 ${(exIdx + 1) < circuitRound.exercises.length ? "border-b-hairline border-white" : ""}`}
                                  >
                                    <View className="w-[calc(40%)] overflow-hidden">
                                      <Text className="text-sm self-start font-medium dark:text-[#eeeeec]">Name</Text>
                                      <Text className="text-sm dark:text-[#eeeeec]" style={{ flexWrap: "nowrap"}}>{exercise.exerciseName}</Text>
                                    </View>
                                    <View className="w-14">
                                      <Text className="text-sm self-start font-medium dark:text-[#eeeeec]">Target</Text>
                                      <Text className="text-sm dark:text-[#eeeeec]">{exercise.target === "reps" ? `${exercise.targetReps} reps`: exercise.time}</Text>
                                    </View>
                                    <View className="">
                                      <Text className="text-sm self-start font-medium dark:text-[#eeeeec]">Reps</Text>
                                      <Text className="w-10 text-sm dark:text-[#eeeeec]">{exercise.actualReps}</Text>
                                    </View>
                                    <View className="">
                                      <Text className="text-sm self-start font-medium dark:text-[#eeeeec]">Load</Text>
                                      <Text className="w-fit text-sm dark:text-[#eeeeec]">{exercise.load ? exercise.load : "None"}</Text>
                                    </View>
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
                      {/* <Image
                        source={{ uri: item.thumbnail ?? "https://res.cloudinary.com/dqrk3drua/image/upload/f_auto,q_auto/v1/fitizen/gn88ph2mplriuumncv2a" }}
                        style={{ height: 50, aspectRatio: 4/3, borderRadius: 4, }}
                      /> */}
                      {item.data.map((dataItem: ItemDataType, dataIdx: number) => {
                        return (
                          <ThemedView key={`item-${dataItem.exerciseId}`} className="my-0.5 mx-1 p-1 flex-row gap-2 rounded">
                            <View className="flex-row w-full gap-4">
                              <Text className="dark:text-[#eeeeec] font-bold">Set {dataIdx+1}</Text>
                              <View className="flex-row flex-wrap max-w-full gap-x-4 gap-y-0">
                                <View className="w-14">
                                  <Text className="text-sm self-start font-medium dark:text-[#eeeeec]">Target</Text>
                                  <Text className="text-sm dark:text-[#eeeeec]">{item.target === "reps" ? `${item.targetReps} reps`: item.time}</Text>
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
              refreshControl={
                <RefreshControl
                  refreshing={isRefetching}
                  onRefresh={refetch}
                />
              }
              ListEmptyComponent={<Text className="text-center text-sm/6 mt-2 text-[#eeeeec]">No Exercises</Text>}
            />
          </View>
      </SafeAreaView>
      )}
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
