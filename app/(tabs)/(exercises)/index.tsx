import { StyleSheet, Platform, Text, View, ImageBackground, Pressable, ScrollView, TouchableOpacity } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedSafeAreaView } from '@/components/ThemeSafeAreaView';
import { useState } from 'react';
import { useInfiniteExercises } from '@/hooks/useInfiniteQuery';
import { InfiniteList } from '@/components/InfiniteList';
import { Link, router } from 'expo-router';
import { Avatar, Skeleton } from '@rneui/themed';
import { Button, IconButton } from 'react-native-paper';
import { Colors } from '@/constants/Colors';
import { Image } from 'expo-image';
import { useColorScheme } from '@/hooks/useColorScheme.web';
import AnimatedDrawer from '@/components/AnimatedDrawer';
import { Dimensions } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useAuth } from '@/providers/auth-provider';
import { Alert } from 'react-native';

const { height, width } = Dimensions.get("window");

export default function LibraryScreen() {
  const { signOut, session } = useAuth();
  const colorScheme = useColorScheme();
  const tabBarHeight = useBottomTabBarHeight();
  const [query, setQuery] = useState('');
  const [openDrawer, setOpenDrawer] = useState(false);
  
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

  if (!isLoading && error) {
    const errorMessage = error?.message
    const alertPrompt = errorMessage === "Unauthorized"
      ? "Unauthorized Request"
      : errorMessage === "Invalid token"
      ? "Session expired" : "Unauthorized"
    Alert.alert(alertPrompt, 'You will be signed out', [
      {
        text: 'OK',
        onPress: signOut 
      },
    ]);
  }

  const flatData = data?.pages.flatMap(page => page.exercises) ?? [];
  // console.log("exercises data", data)
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
          <Text className='dark:text-[#eeeeec] font-bold text-lg'>Fitizen</Text>
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
    backgroundPosition: "center",
  },
});
