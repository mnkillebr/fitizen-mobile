import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { Button, StyleSheet, Text, View } from "react-native";
import { IconButton } from "react-native-paper";
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';

export default function ExerciseDetail() {
  const { exerciseId } = useLocalSearchParams();
  const {
    data: exercise,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['exercise', exerciseId.toString()],
    queryFn: () => api.exercises.exerciseDetail(exerciseId.toString())
  });
  // console.log("exercise id", exerciseId, exercise && Object.keys(exercise), exercise && exercise.videoToken)

  const videoSource = exercise ? `https://stream.mux.com/${exercise.muxPlaybackId}.m3u8?token=${exercise.videoToken}` : ''
  const player = useVideoPlayer(videoSource, player => {
    player.loop = false;
    // player.play();
  });

  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerLeft: () => (
            <IconButton
              icon="arrow-left"
              onPress={() => router.back()}
            />
          ),
          title: exercise?.name || 'Exercise Details'
        }}
      />
      <ThemedView className="flex-1">
        <ThemedView className='p-4'>
          {/* <ThemedText>Exercise Detail</ThemedText> */}
          {exercise ? (
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
        </ThemedView>
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
    aspectRatio: 9/16,
  },
  controlsContainer: {
    padding: 10,
  },
});