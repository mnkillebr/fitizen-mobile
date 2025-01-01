import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { StyleSheet, View } from "react-native";

type VideoPlayerProps = {
  muxPlaybackId: string;
  videoToken: string;
  height: number;
}

export default function VideoPlayer({ muxPlaybackId, videoToken, height = 300 }: VideoPlayerProps) {
  const videoSource = `https://stream.mux.com/${muxPlaybackId}.m3u8?token=${videoToken}`
  const player = useVideoPlayer(videoSource, player => {
    player.loop = false;
  });
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  return (
    <View style={styles.contentContainer}>
      <VideoView style={{...styles.video, height }} player={player} allowsFullscreen allowsPictureInPicture />
    </View>
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  video: {
    width: '100%',
  },
});