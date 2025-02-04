import { StyleSheet, Platform, Text, View, ImageBackground, Pressable, FlatList, RefreshControl, ScrollView, TouchableOpacity, Dimensions } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedSafeAreaView } from '@/components/ThemeSafeAreaView';
import { SearchBar } from '@/components/SearchBar';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, apiClient } from '@/lib/api';
import { Link, router } from 'expo-router';
import { Avatar, Skeleton } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Button, IconButton } from 'react-native-paper';
import { Image } from 'expo-image';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/providers/auth-provider';
import AnimatedDrawer from '@/components/AnimatedDrawer';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

const { height, width } = Dimensions.get("window");

export default function WorkoutsScreen() {
  const { signOut, session } = useAuth();
  const colorScheme = useColorScheme();
  const tabBarHeight = useBottomTabBarHeight();
  const [searchQuery, setSearchQuery] = useState('');
  const [openDrawer, setOpenDrawer] = useState(false);
  const {
    data: workouts,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['workouts', searchQuery],
    queryFn: () => apiClient.workouts.list(searchQuery)
  });

  const workoutState = useSelector((state: RootState) => state.workoutLog)
  // console.log("workoutState", workouts)
  return (
    <ThemedSafeAreaView className='flex-1 -mt-4'>
      <ThemedView className='p-4 h-full'>
        <View className='flex-row justify-between items-center h-8'>
          <View className='w-8'>
            <IconButton
              icon="menu"
              size={20}
              iconColor='gray'
              onPress={() => setOpenDrawer(!openDrawer)}
            />
          </View>
          <Text className='text-[#eeeeec] font-bold text-lg'>Fitizen</Text>
          {session?.user?.profilePhotoUrl ? (

            <TouchableOpacity
              onPress={() => router.navigate("/profile")}
              className='w-8 mr-2'
            >
              <Image
                key={session.user.profilePhotoUrl}
                source={{ uri: session.user.profilePhotoUrl }}
                style={{ width: 28, height: 28, borderRadius: 14 }}
                contentFit="cover"
                // transition={100}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => router.navigate("/profile")}
              className='w-8 mr-2'
            >
              <Avatar
                size={28}
                rounded
                title={`${session.user.firstName[0]}${session.user.lastName[0]}`}
                containerStyle={{ backgroundColor: Colors[colorScheme ?? "light"].backgroundMuted }}
              />
            </TouchableOpacity>
          )}
        </View>
        <SearchBar
          placeholder='Search Workouts ...'
          onSearch={setSearchQuery}
        />
        {isLoading ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {[...Array(3)].map((item, index) => <Skeleton key={`skeleton-${index}`} height={196} className='my-2 rounded-lg' skeletonStyle={{ backgroundColor: "gray" }} />)}
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
      <AnimatedDrawer
        isOpen={openDrawer}
        onClose={() => setOpenDrawer(false)}
        showOverlay={true}
        mode="sidebar"
        side="left"
        drawerWidth={width * 0.4}
      >
        <ThemedSafeAreaView className='h-full border-r flex-col-reverse' style={{ borderColor: Colors[colorScheme ?? "light"].border }}>
          <Button
            onPress={signOut}
            style={{
              backgroundColor: "#ffd700",
              borderRadius: 8,
              marginHorizontal: 8,
              // position: "relative",
              bottom: -tabBarHeight + 20
            }}
            textColor='black'
          >
            Sign Out
          </Button>
        </ThemedSafeAreaView>
      </AnimatedDrawer>
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
