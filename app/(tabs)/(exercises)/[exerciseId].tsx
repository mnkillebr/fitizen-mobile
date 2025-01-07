import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { Button, Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { IconButton } from "react-native-paper";
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useColorScheme } from "@/hooks/useColorScheme";
import { useSharedValue } from "react-native-reanimated";
import { useMemo, useRef, useState } from "react";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { Colors } from "@/constants/Colors";

const { height, width } = Dimensions.get("window")

export default function ExerciseDetail() {
  // hooks
  const { exerciseId } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const scrollOffsetValue = useSharedValue<number>(0);
  const [page, setPage] = useState<number>(0);
  const paginationRef = useRef<ICarouselInstance>(null);

  // queries
  const {
    data: exercise,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['exercise', exerciseId.toString()],
    queryFn: () => api.exercises.exerciseDetail(exerciseId.toString()),
    enabled: !!exerciseId,
  });

  // constants
  const videoSource = exercise ? `https://stream.mux.com/${exercise.muxPlaybackId}.m3u8?token=${exercise.videoToken}` : ''
  const player = useVideoPlayer(videoSource, player => {
    player.loop = false;
    // player.play();
  });
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  const carouselData = useMemo(() => {
    if (exercise) {
      return [
        { video: true },
        { cues: true },
      ]
    } else {
      return []
    }
  }, [exercise])
  const onPressPagination = (index: number) => {
		paginationRef.current?.scrollTo({
			count: index,
			animated: true,
		});
	};

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerLeft: () => (
            <IconButton
              icon="arrow-left"
              onPress={() => router.back()}
              iconColor={Colors[colorScheme ?? 'light'].tint}
              className="relative bottom-1"
            />
          ),
          title: exercise?.name || 'Exercise Details'
        }}
      />
      <ThemedView className="flex-1">
        {/* <View id="carousel-component" className="flex">
          <Carousel
            ref={paginationRef}
            loop={false}
            width={width}
            height={height}
            snapEnabled={true}
            pagingEnabled={true}
            data={carouselData}
            defaultScrollOffsetValue={scrollOffsetValue}
            onConfigurePanGesture={(g: { enabled: (arg0: boolean) => any }) => {
              "worklet";
              g.enabled(false);
            }}
            onSnapToItem={(index: number) => setPage(index)}
            renderItem={({ item }) => (
              <View className="">
                {item.video ? (
                  <View style={styles.contentContainer}>
                    <VideoView style={styles.video} player={player} allowsFullscreen allowsPictureInPicture />
                    <View style={styles.controlsContainer}>
                      <Button
                        title={isPlaying ? 'Pause' : 'Play'}
                        onPress={() => {
                          if (isPlaying) {
                            player.pause();
                          } else {
                            player.play();
                          }
                        }}
                      />
                    </View>
                  </View>
                ) : null}
                {item.cues ? (
                  <>
                    
                  </>
                ) : null}
              </View>
            )}
          />
          <View className="flex flex-row mt-[440px] mb-2 justify-center gap-2">
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
        </View> */}
        {exercise ? (
          <View style={styles.contentContainer}>
            <VideoView style={styles.video} player={player} allowsFullscreen allowsPictureInPicture />
            {/* <View style={styles.controlsContainer}>
              <Button
                title={isPlaying ? 'Pause' : 'Play'}
                onPress={() => {
                  if (isPlaying) {
                    player.pause();
                  } else {
                    player.play();
                  }
                }}
              />
            </View> */}
            <ThemedView className="p-4" style={{ height: height * 0.4 }}>
              <ThemedText type="subtitle">Exercise Cues</ThemedText>
              <ScrollView className="p-1 bg-zinc-100 dark:bg-zinc-800 rounded">
                {exercise.cues.map((cue, cueIdx) => (
                  <View key={`cue-${cueIdx}`} className="flex-row gap-1">
                    <Text className="dark:text-white w-4 mt-1.5">{cueIdx+1}.</Text>
                    <View className="border border-[#4d4d53] px-2 py-0 my-1 flex-1">
                      <Text key={cueIdx} className="dark:text-white">{cue}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </ThemedView>
          </View>
        ) : null}
      </ThemedView>
    </>
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    // padding: 10,
    // marginTop: 100,
    // alignItems: 'center',
    // justifyContent: 'center',
    // paddingHorizontal: 50,
  },
  video: {
    width: '100%',
    // aspectRatio: 9/16,
    height: height * 0.4,
  },
  controlsContainer: {
    padding: 10,
  },
});