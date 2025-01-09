import { Image, StyleSheet, Platform, Text, View, ImageBackground, Pressable, FlatList, RefreshControl, ScrollView } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedSafeAreaView } from '@/components/ThemeSafeAreaView';
import { SearchBar } from '@/components/SearchBar';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Link } from 'expo-router';
import { Skeleton } from '@rneui/themed';

export default function WorkoutsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const {
    data: workouts,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['workouts', searchQuery],
    queryFn: () => api.workouts.list(searchQuery)
  });
  return (
    <ThemedSafeAreaView className='flex-1'>
      <ThemedView className='p-4 h-full'>
        <SearchBar
          placeholder='Search Workouts ...'
          onSearch={setSearchQuery}
        />
        {isLoading ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {[...Array(3)].map((item, index) => <Skeleton key={`skeleton-${index}`} height={224} className='my-2 rounded-lg' />)}
          </ScrollView>
        ) : <FlatList
          data={workouts ?? []}
          renderItem={({ item }) => (
            <Link
              href={{
                pathname: '/(tabs)/(workouts)/[workoutId]',
                params: { workoutId: item.id }
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
                    source={{ uri: item.thumbnail ?? "https://res.cloudinary.com/dqrk3drua/image/upload/f_auto,q_auto/v1/fitizen/gn88ph2mplriuumncv2a" }}
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
          ListEmptyComponent={<Text className="text-center text-sm/6 mt-2 text-[#eeeeec]">No Workouts</Text>}
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
    backgroundPosition: "center"
  },
});
