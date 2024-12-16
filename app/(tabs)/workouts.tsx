import { Image, StyleSheet, Platform, Text, View, ImageBackground, Pressable, FlatList, RefreshControl } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedSafeAreaView } from '@/components/ThemeSafeAreaView';
import { SearchBar } from '@/components/SearchBar';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function WorkoutsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const {
    data: workouts,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['programs', searchQuery],
    queryFn: () => api.workouts.list(searchQuery)
  });
  return (
    <ThemedSafeAreaView className='flex-1'>
      <ThemedView className='p-4 h-full'>
        <SearchBar
          placeholder='Search Workouts ...'
          onSearch={setSearchQuery}
        />
        <FlatList
          data={workouts ?? []}
          renderItem={({ item }) => (
            <View className="h-56 relative rounded-lg bg-slate-50 overflow-hidden my-2">
              <ImageBackground
                source={{ uri: item.thumbnail ?? "https://res.cloudinary.com/dqrk3drua/image/upload/f_auto,q_auto/cld-sample-3.jpg" }}
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
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
            />
          }
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
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
    backgroundPosition: "center"
  },
});
