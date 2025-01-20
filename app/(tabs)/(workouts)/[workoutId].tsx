import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import { api, apiClient } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { View, Text, SafeAreaView, ImageBackground, StyleSheet, Dimensions, Pressable, FlatList, SectionList, Image, ActivityIndicator } from "react-native";
import { FAB, IconButton } from "react-native-paper";
import { Colors } from "@/constants/Colors";
import { useSharedValue } from "react-native-reanimated";
import { useEffect, useMemo, useRef, useState } from "react";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { Dialog, Skeleton, Tab, TabView } from "@rneui/themed";
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import VideoPlayer from "@/components/VideoPlayer";
import { useDispatch } from "react-redux";
import { startWorkout } from "@/redux/slices/workoutLogSlice";
import { useAuth } from "@/providers/auth-provider";
import { ScrollView } from "react-native-gesture-handler";

const { height, width } = Dimensions.get("window")

export default function WorkoutDetail() {
  const { session } = useAuth()
  // console.log("session", session)
  // hooks
  const { workoutId } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const scrollOffsetValue = useSharedValue<number>(0);
  const [page, setPage] = useState<number>(0);
  const [tabIndex, setTabIndex] = useState<number>(0);
  const paginationRef = useRef<ICarouselInstance>(null);
  const tabBarHeight = useBottomTabBarHeight();
  const [openDialog, setOpenDialog] = useState({
    open: false,
    title: '',
    content: null,
  });
  const dispatch = useDispatch()

  // queries
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
  const { workout, exerciseDetails, logs } = useMemo(() => {
    if (data) {
      return {
        workout: data.workout,
        logs: data.logs,
        exerciseDetails: data.exerciseDetails.reduce((result, curr) => {
          let resultArr = result
          if (curr.circuitId) {
            resultArr = resultArr.concat({
              title: `Circuit of ${curr.sets} rounds`,
              data: curr.exercises,
              footer: `Rest ${curr.rest} between rounds`,
            })
          } else {
            if (result.filter(item => !item.footer).length) {
              resultArr = resultArr.map(item => {
                if (item => !item.footer) {
                  return {
                    ...item,
                    data: item.data.concat(curr).sort((a, b) => a.orderInRoutine - b.orderInRoutine)
                  }
                } else return item
              })
            } else {
              resultArr = resultArr.concat({
                title: '',
                data: [curr]
              })
            }
          }
          return resultArr
        }, []),
      }
    } else {
      return {
        workout: undefined,
        exerciseDetails: [],
      }
    }
  }, [data])
  const carouselData = useMemo(() => {
    if (workout) {
      return [
        {
          title: workout.name,
        },
        {
          subTitle: "Description",
          description: workout.description,
        }
      ]
    } else {
      return []
    }
  }, [workout])
  const onPressPagination = (index: number) => {
		paginationRef.current?.scrollTo({
			count: index,
			animated: true,
		});
	};

  return (
    // <>
    //   <Stack.Screen
    //     options={{
    //       headerShown: true,
    //       headerLeft: () => (
    //         <IconButton
    //           icon="arrow-left"
    //           onPress={() => router.back()}
    //           iconColor={Colors[colorScheme ?? 'light'].tint}
    //           className="relative bottom-1"
    //         />
    //       ),
    //       title: workout?.name || 'Workout Details'
    //     }}
    //   />
    //   <ThemedView className="flex-1 px-4">
    //     <ThemedText>Workout Detail</ThemedText>
    //   </ThemedView>
    // </>
    <ImageBackground
      source={{ uri: workout?.s3ImageKey ?? "https://res.cloudinary.com/dqrk3drua/image/upload/f_auto,q_auto/v1/fitizen/gn88ph2mplriuumncv2a" }}
      style={styles.backgroundImage}
    >
      <SafeAreaView className="flex-1">
        <IconButton
          icon="arrow-left"
          iconColor="black"
          style={{ backgroundColor: Colors[colorScheme ?? 'light'].tint }}
          onPress={() => router.back()}
        />
        {isLoading ? (
          <View className="pb-4 h-52 justify-center">
            <ActivityIndicator />
          </View>
        ) : (
          <View className="pb-4 h-52">
          <View
            id="carousel-component"
            // className="flex flex-col"
            // dataSet={{ kind: "basic-layouts", name: "normal" }}
          >
            <Carousel
              ref={paginationRef}
              loop={false}
              width={width}
              height={height}
              snapEnabled={true}
              pagingEnabled={true}
              // autoPlayInterval={2000}
              data={carouselData}
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
                // console.log("current index:", index)
                setPage(index)
              }}
              renderItem={({ item }) => (
                <View className="h-52 px-4 justify-center">
                  {item.title ? <ThemedText className="text-center" type="title" lightColor="#eeeeec" style={styles.title}>{workout?.name || 'Workout Details'}</ThemedText> : null}
                  {item.subTitle ? (
                    <>
                      <ThemedText type="subtitle" className="text-center mb-2" lightColor="#eeeeec" style={styles.title}>{item.subTitle}</ThemedText>
                      <ThemedText type="default" className="text-center" style={{ ...styles.text, lineHeight: 20 }} lightColor="#eeeeec">{item.description}</ThemedText>
                    </>
                  ) : null}
                </View>
              )}
            />
            <View className="flex flex-row mt-56 mb-2 justify-center gap-2">
              {carouselData.map((item, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => {
                    if (page === 0 && idx === 1) {
                      setPage(idx)
                      onPressPagination(idx)
                    } else if (page === 1 && idx === 0) {
                      setPage(idx)
                      onPressPagination(-1)
                    }
                  }}
                >
                  <View className="size-3 rounded-full" style={{ backgroundColor: page === idx ? Colors[colorScheme ?? 'light'].tint : "#52525B" }} />
                </Pressable>
              ))}
            </View>
          </View>
          </View>
        )}
        <View className="flex-1 mt-8" style={{ paddingBottom: (tabBarHeight-8) }}>
          {isLoading ? (
            <ScrollView showsVerticalScrollIndicator={false} className="p-4">
              {[...Array(4)].map((item, index) => <Skeleton key={`skeleton-${index}`} height={80} className='my-2 rounded-lg' />)}
            </ScrollView>
          ) : (
            <>
              <Tab
                value={tabIndex}
                onChange={(e) => setTabIndex(e)}
                indicatorStyle={{
                  backgroundColor: Colors[colorScheme ?? 'light'].tint,
                  height: 3,
                }}
                variant="default"
              >
                {['Exercises', 'History'].map((tabLabel, tabLabelIdx) => (
                  <Tab.Item
                    key={`tab-${tabLabelIdx}`}
                    title={tabLabel}
                    titleStyle={(active) => ({
                      fontSize: 12,
                      fontWeight: "bold",
                      color: active ? Colors[colorScheme ?? 'light'].tint : "white"
                    })}
                  />
                ))}
              </Tab>
              <TabView value={tabIndex} onChange={setTabIndex} animationType="spring">
                <TabView.Item className="px-2 pt-2 w-full">
                  <SectionList
                    sections={exerciseDetails}
                    keyExtractor={(item, index) => item + index}
                    renderItem={({item}) => (
                      <Pressable onPress={() => {
                        setOpenDialog({
                          open: true,
                          title: item.name,
                          content: item,
                        })
                      }}>
                        <ThemedView className="my-0.5 p-1 flex-row gap-2 rounded w-full overflow-hidden">
                          <Image
                            source={{ uri: item.thumbnail ?? "https://res.cloudinary.com/dqrk3drua/image/upload/f_auto,q_auto/v1/fitizen/gn88ph2mplriuumncv2a" }}
                            style={{ height: 50, aspectRatio: 4/3, borderRadius: 4, alignSelf: 'start' }}
                          />
                          <View className="flex-1 flex-col w-full">
                            <Text className="dark:text-[#eeeeec] mb-1">{item.name}</Text>
                            <View className="flex-row flex-wrap max-w-full gap-x-4 gap-y-0">
                              <View className="flex flex-col justify-between">
                                <Text className="text-xs self-start font-medium dark:text-[#eeeeec]">Sets</Text>
                                <Text className="w-10 text-sm h-5 dark:text-[#eeeeec]">{item.sets}</Text>
                              </View>
                              <View className="flex flex-col justify-between">
                                <Text className="text-xs self-start font-medium dark:text-[#eeeeec]">Target</Text>
                                <Text className="w-10 text-sm h-5 dark:text-[#eeeeec]">{item.target}</Text>
                              </View>
                              {item.target === "reps" ? (
                                <View className="flex flex-col justify-between">
                                  <Text className="text-xs self-start font-medium dark:text-[#eeeeec]">Reps</Text>
                                  <Text className="w-10 text-sm h-5 dark:text-[#eeeeec]">{item.reps}</Text>
                                </View>
                              ) : (
                                <View className="flex flex-col justify-between">
                                  <Text className="text-xs self-start font-medium dark:text-[#eeeeec]">Time</Text>
                                  <Text className="w-fit text-sm h-5 dark:text-[#eeeeec]">{item.time}</Text>
                                </View>
                              )}
                              <View className="flex flex-col justify-between">
                                <Text className="text-xs self-start font-medium dark:text-[#eeeeec]">Rest</Text>
                                <Text className="w-fit text-sm h-5 dark:text-[#eeeeec]">{item.rest}</Text>
                              </View>
                              <View className="flex flex-col justify-between">
                                <Text className="text-xs self-start font-medium dark:text-[#eeeeec]">RPE</Text>
                                <Text className="w-fit text-sm h-5 dark:text-[#eeeeec]">{item.rpe}</Text>
                              </View>
                              {item.notes ? (
                                <View className="flex flex-col justify-between overflow-hidden">
                                  <Text className="text-xs self-start font-medium dark:text-[#eeeeec]">Notes</Text>
                                  <Text className="w-fit text-sm h-5 dark:text-[#eeeeec] truncate">{item.notes}</Text>
                                </View>
                              ) : null}
                            </View>
                          </View>
                        </ThemedView>
                      </Pressable>
                    )}
                    renderSectionHeader={({section: {title}}) => title ? (
                      <Text className="font-bold text-[#eeeeec] mt-2">{title}</Text>
                    ) : null}
                    renderSectionFooter={({section: {footer}}) => footer ? (
                      <Text className="font-bold text-[#eeeeec] text-right mb-1">{footer}</Text>
                    ) : null}
                    ListEmptyComponent={<Text className="text-center text-sm/6 mt-2 text-[#eeeeec]">No Exercises</Text>}
                  />
                </TabView.Item>
                <TabView.Item className="px-2 pt-2 w-full">
                  <FlatList
                    data={logs ?? []}
                    renderItem={({ item }) => <Text>Log</Text>}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                    keyboardDismissMode="on-drag"
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={<Text className="text-center text-sm/6 mt-2 text-[#eeeeec]">No workout logs</Text>}
                  />
                </TabView.Item>
              </TabView>
              <FAB
                icon="play"
                size="medium"
                label="Start Workout"
                style={{ ...styles.startButton, backgroundColor: Colors[colorScheme ?? 'light'].tint }}
                color="black"
                onPress={() => {
                  dispatch(startWorkout(workoutId as string))
                  router.navigate(`/workout?workoutId=${workoutId}`)
                }}
              />
            </>
          )}
        </View>
        <Dialog
          isVisible={openDialog.open}
          onBackdropPress={() => setOpenDialog({
            open: false,
            title: '',
            content: null,
          })}
          overlayStyle={{ backgroundColor: Colors[colorScheme ?? 'light'].background, borderWidth: 1, borderColor: '#4d4d53' }}
        >
          <Dialog.Title title={openDialog.title} titleStyle={{ color: Colors[colorScheme ?? 'light'].text }} />
          <View className="flex flex-col p-1 gap-4">
            {openDialog.content ? (
              <View className="flex-1">
                <VideoPlayer muxPlaybackId={openDialog.content.muxPlaybackId} videoToken={openDialog.content.videoToken} height={270} />
                <View className="flex-row flex-wrap max-w-full gap-x-4 gap-y-0 mt-80">
                  <View className="flex flex-col justify-between">
                    <Text className="text-xs self-start h-5 font-medium dark:text-[#eeeeec]">Sets</Text>
                    <Text className="w-10 text-sm h-5 dark:text-[#eeeeec]">{openDialog.content.sets}</Text>
                  </View>
                  <View className="flex flex-col justify-between">
                    <Text className="text-xs self-start h-5 font-medium dark:text-[#eeeeec]">Target</Text>
                    <Text className="w-10 text-sm h-5 dark:text-[#eeeeec]">{openDialog.content.target}</Text>
                  </View>
                  {openDialog.content.target === "reps" ? (
                    <View className="flex flex-col justify-between">
                      <Text className="text-xs self-start h-5 font-medium dark:text-[#eeeeec]">Reps</Text>
                      <Text className="w-10 text-sm h-5 dark:text-[#eeeeec]">{openDialog.content.reps}</Text>
                    </View>
                  ) : (
                    <View className="flex flex-col justify-between">
                      <Text className="text-xs self-start h-5 font-medium dark:text-[#eeeeec]">Time</Text>
                      <Text className="w-fit text-sm h-5 dark:text-[#eeeeec]">{openDialog.content.time}</Text>
                    </View>
                  )}
                  <View className="flex flex-col justify-between">
                    <Text className="text-xs self-start h-5 font-medium dark:text-[#eeeeec]">Rest</Text>
                    <Text className="w-fit text-sm h-5 dark:text-[#eeeeec]">{openDialog.content.rest}</Text>
                  </View>
                  {openDialog.content.notes ? (
                    <View className="flex flex-col justify-between">
                      <Text className="text-xs self-start h-5 font-medium dark:text-[#eeeeec]">Notes</Text>
                      <Text className="w-fit text-sm h-5 dark:text-[#eeeeec] truncate">{openDialog.content.notes}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            ) : null}
            <View className="h-96" />
          </View>
        </Dialog>
      </SafeAreaView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    // position: "relative",
    // justifyContent: "center",
    // backgroundSize: "cover",
    // backgroundPosition: "center",
  },
  title: {
    textShadowColor: '#000',
    textShadowOffset: {
      width: 1.5,
      height: 1.5,
    },
    textShadowRadius: 4,
  },
  text: {
    textShadowColor: '#000',
    textShadowOffset: {
      width: 0.75,
      height: 0.75,
    },
    textShadowRadius: 2,
  },
  startButton: {
    width: 170,
    height: 50,
    // marginVertical: 8,
    position: "absolute",
    bottom: 58,
    right: 8,
    justifyContent: "center",
    alignSelf: "flex-end"
  },
});