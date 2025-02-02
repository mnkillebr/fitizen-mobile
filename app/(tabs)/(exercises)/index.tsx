import { Image, StyleSheet, Platform, Text, View, ImageBackground, Pressable, ScrollView } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedSafeAreaView } from '@/components/ThemeSafeAreaView';
import { useState } from 'react';
import { useInfiniteExercises } from '@/hooks/useInfiniteQuery';
import { InfiniteList } from '@/components/InfiniteList';
import { Link } from 'expo-router';
import { Skeleton } from '@rneui/themed';

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
    refetch,
    isRefetching
  } = useInfiniteExercises(query);

  const flatData = data?.pages.flatMap(page => page.exercises) ?? [];
  console.log("exercises data", data)
  return (
    <ThemedSafeAreaView className='flex-1 -mt-4'>
      <ThemedView className='p-4'>
        {isLoading ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {[...Array(3)].map((item, index) => <Skeleton key={`skeleton-${index}`} height={196} className='my-2 rounded-lg' skeletonStyle={{ backgroundColor: "gray" }} />)}
          </ScrollView>
        ) : <InfiniteList
          data={flatData}
          renderItem={({ item }) => (
            <Link
              href={{
                pathname: '/(tabs)/(exercises)/[exerciseId]',
                params: { exerciseId: item.id }
              }}
              asChild
            >
              <Pressable
                style={({ pressed }) => [
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
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
              </Pressable>
            </Link>
          )}
          onSearch={setQuery}
          onLoadMore={fetchNextPage}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          searchPlaceholder="Search exercises..."
          keyExtractor={(item) => item.id}
          refetch={refetch}
          isRefetching={isRefetching}
          // ListEmptyComponent={<Text className="text-center text-sm/6 mt-2 text-[#eeeeec]">No Exercises</Text>}
        />}
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
