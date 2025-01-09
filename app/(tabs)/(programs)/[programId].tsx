import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ThemedSafeAreaView } from "@/components/ThemeSafeAreaView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Dimensions, ImageBackground, Pressable, SafeAreaView, StyleSheet, Text, View, } from "react-native";
import { FAB, Icon, IconButton, ProgressBar } from "react-native-paper";
import { useSharedValue } from "react-native-reanimated";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { Dialog, Tab, TabView } from '@rneui/themed';

const { height, width } = Dimensions.get("window")

export default function ProgramDetail() {
  // hooks
  const { programId } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const scrollOffsetValue = useSharedValue<number>(0);
  const [page, setPage] = useState<number>(0);
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [openDialog, setOpenDialog] = useState({
    open: false,
    title: '',
    content: null,
  });
  const paginationRef = useRef<ICarouselInstance>(null);

  // queries
  const {
    data: program,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['program', programId.toString()],
    queryFn: () => api.programs.programDetail(programId.toString())
  });

  // functions and constants
  const programWeeks = useMemo(() => {
    if (program) return program.weeks.length
    else return 0
  }, [program])
  const programDays = useMemo(() => {
    if (program) return program.weeks[0].days.length
    else return 0
  }, [program])
  const carouselData = useMemo(() => {
    if (program) {
      return [
        {
          title: program.name,
        },
        {
          subTitle: "Description",
          description: program.description,
        }
      ]
    } else {
      return []
    }
  }, [program])
  const exerciseTags = useMemo(() => {
    if (program) {
      return [
        {
          title: program.name,
        },
        {
          subTitle: "Description",
          description: program.description,
        }
      ]
    } else {
      return []
    }
  }, [program])
  const onPressPagination = (index: number) => {
		paginationRef.current?.scrollTo({
			count: index,
			animated: true,
		});
	};
  // console.log("program", program)
  
  return (
    <ImageBackground
      source={{ uri: program?.s3ImageKey ?? "" }}
      style={styles.backgroundImage}
    >
      <SafeAreaView className="flex-1">
        <IconButton
          icon="arrow-left"
          iconColor={Colors[colorScheme ?? 'light'].tint}
          onPress={() => router.back()}
        />
        <View className="pb-4 flex-1">
          {/* <View className="bg-slate-400 h-1/4">
           <ThemedText className="font-bold">{program?.name || 'Program Details'}</ThemedText>
          </View> */}
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
                  {item.title ? <ThemedText className="text-center" type="title" lightColor="#eeeeec" style={styles.title}>{program?.name || 'Program Details'}</ThemedText> : null}
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
          <View className="flex-1">
            {/* <View className="flex flex-row bg-slate-500 rounded-full justify-center items-center w-fit">
              <ThemedText type="subtitle" className="text-center">Start Program</ThemedText>
              <View className="bg-yellow-400 rounded-full"><Icon size={24} source="play" /></View>
            </View> */}
            <View className="py-2 px-4 flex-row items-center gap-3">
              <ThemedText lightColor="#eeeeec" style={styles.text}>Difficulty</ThemedText>
              <View className="flex-row">
                <Icon source="fire" size={14} color={Colors[colorScheme ?? 'light'].tint} />
                <Icon source="fire" size={14} color={Colors[colorScheme ?? 'light'].tint} />
                <Icon source="fire" size={14} color="#e4e3e0" />
                <Icon source="fire" size={14} color="#e4e3e0" />
                <Icon source="fire" size={14} color="#e4e3e0" />
              </View>
            </View>
            <View className="py-2 px-4">
              <ThemedText lightColor="#eeeeec" style={styles.text}>Program Completion - 42%</ThemedText>
              <ProgressBar progress={0.42} color={Colors[colorScheme ?? 'light'].tint} />
            </View>
            <View>
              <Tab
                value={tabIndex}
                onChange={(e) => setTabIndex(e)}
                indicatorStyle={{
                  backgroundColor: Colors[colorScheme ?? 'light'].tint,
                  height: 3,
                }}
                variant="default"
              >
                {[...Array(programWeeks)].map((week, weekIdx) => (
                  <Tab.Item
                    key={`week-${weekIdx}`}
                    title={`Week ${weekIdx+1}`}
                    titleStyle={(active) => ({
                      fontSize: 12,
                      fontWeight: "bold",
                      color: active ? Colors[colorScheme ?? 'light'].tint : "white"
                    })}
                  />
                ))}
              </Tab>
              <TabView value={tabIndex} onChange={setTabIndex} animationType="spring">
                {program ? program.weeks.map((week, weekIdx) => (
                  <TabView.Item
                    key={week.id}
                    style={{ padding: 16, width: '100%', height: height * 0.415 }}
                  >
                    {week.days.length === 4 ? (
                      <View className="flex-1 flex-col gap-3">
                        {week.days.map(day => (
                          <Pressable key={day.id} onPress={() => {
                            setOpenDialog({
                              open: true,
                              title: `Week ${week.weekNumber} - Day ${day.dayNumber}`,
                              content: day
                            })
                          }}>
                            <ThemedView key={day.id} className="rounded-md h-16 px-2 py-0 border border-[#4d4d53]">
                              <ThemedText className="font-bold">Week {week.weekNumber} - Day {day.dayNumber}</ThemedText>
                              {day.blocks[0].exercises.map(exercise => (
                                <View key={exercise.id} className="flex-row justify-between mx-2">
                                  <ThemedText type="small">{exercise.exercise.name}</ThemedText>
                                  <ThemedText type="small">{exercise.sets} sets x {exercise.time ? `${exercise.time} sec` : `${exercise.reps} reps`}</ThemedText>
                                </View>
                              ))}
                            </ThemedView>
                          </Pressable>
                        ))}
                      </View>
                    ) : week.days.length === 3 ? (
                      <View className="flex-1 flex-col gap-2">
                        {week.days.map(day => (
                          <Pressable key={day.id} onPress={() => {
                            setOpenDialog({
                              open: true,
                              title: `Week ${week.weekNumber} - Day ${day.dayNumber}`,
                              content: day
                            })
                          }}>
                            <ThemedView key={day.id} className="rounded-md h-24 px-2 py-0 border border-[#4d4d53]">
                              <ThemedText className="font-bold">Week {week.weekNumber} - Day {day.dayNumber}</ThemedText>
                              {day.blocks[0].exercises.map(exercise => (
                                <View key={exercise.id} className="flex-row justify-between mx-2">
                                  <ThemedText type="small">{exercise.exercise.name}</ThemedText>
                                  <ThemedText type="small">{exercise.sets} sets x {exercise.time ? `${exercise.time} sec` : `${exercise.reps} reps`}</ThemedText>
                                </View>
                              ))}
                            </ThemedView>
                          </Pressable>
                        ))}
                      </View>
                    ) : (
                      <View className="flex-1 flex-col gap-2"></View>
                    )}
                  </TabView.Item>
                )) : (
                  <TabView.Item style={{ padding: 16, width: '100%', height: height * 0.415 }}>
                  </TabView.Item>
                )}
              </TabView>
            </View>

            <FAB
              icon="play"
              size="medium"
              label="Start Program"
              style={{ ...styles.startButton, backgroundColor: Colors[colorScheme ?? 'light'].tint }}
              color="black"
            />
          </View>
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
            {openDialog.content ? openDialog.content.blocks.map((block) => (
              <View key={`block-${block.id}`} className="">
                {block.exercises.map((exercise, exercise_idx) => (
                  <View key={`block-${block.id}-exercise-${exercise_idx}`} className="flex-row justify-between">
                    <ThemedText type="small" className="w-2/3">{exercise.exercise.name}</ThemedText>
                    <ThemedText type="small">{exercise.sets} x {exercise.time ? `${exercise.time} sec` : exercise.reps}</ThemedText>
                  </View>
                ))}
              </View>
            )) : null}
          </View>
        </Dialog>
      </SafeAreaView>
    </ImageBackground>
    
    // <>
    //   <Stack.Screen
    //     options={{
    //       headerShown: true,
    //       headerLeft: () => (
    //         <IconButton
    //           icon="arrow-left"
    //           onPress={() => router.back()}
    //         />
    //       ),
    //       title: program?.name || 'Program Details'
    //     }}
    //   />
    //   <ThemedView className="flex-1">
    //     <ThemedView className="p-4">
    //       <ThemedText>{program?.name || 'Program Details'}</ThemedText>
    //     </ThemedView>
    //   </ThemedView>
    // </>
  )
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    // position: "relative",
    // justifyContent: "center",
    backgroundSize: "cover",
    backgroundPosition: "center",
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
    width: 180,
    height: 50,
    // marginVertical: 8,
    position: "absolute",
    bottom: 44,
    right: 8,
    justifyContent: "center",
    alignSelf: "flex-end"
  },
});
