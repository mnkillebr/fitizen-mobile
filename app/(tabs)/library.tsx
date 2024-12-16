import { Image, StyleSheet, Platform, Text, View, ImageBackground } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedSafeAreaView } from '@/components/ThemeSafeAreaView';
import { useState } from 'react';
import { useInfiniteExercises } from '@/hooks/useInfiniteQuery';
import { InfiniteList } from '@/components/InfiniteList';

export default function LibraryScreen() {
  const [query, setQuery] = useState('');
  
  const {
    status,
    data,
    error,
    isFetching,
    isLoading,
    isFetchingNextPage,
    isFetchingPreviousPage,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
  } = useInfiniteExercises(query);

  const flatData = data?.pages.flatMap(page => page.exercises) ?? [];

  return (
    <ThemedSafeAreaView className='flex-1'>
      <ThemedView className='p-4'>
        <InfiniteList
          data={flatData}
          renderItem={({ item }) => (
            <View className="h-56 relative rounded-lg bg-slate-50 overflow-hidden my-2">
              <ImageBackground
                source={{ uri: item.thumbnail }}
                style={styles.backgroundImage}
              >
                {/* Top Left Text */}
                <View className="absolute bottom-2 left-2 p-2 flex flex-col items-start">
                  <Text className="font-bold text-white">{item.name}</Text>
                  {/* <View className="flex flex-row gap-2">
                    <Text className="text-white">Difficulty:</Text>
                    <Text className="italic text-white">{difficulty}</Text>
                  </View> */}
                </View>
              </ImageBackground>
            </View>
          )}
          onSearch={setQuery}
          onLoadMore={fetchNextPage}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          searchPlaceholder="Search exercises..."
          keyExtractor={(item) => item.id}
        />
      </ThemedView>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: "center",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
});
