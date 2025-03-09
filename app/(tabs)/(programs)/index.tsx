import { StyleSheet, Platform, Text, View, FlatList, RefreshControl, Pressable, ScrollView, Alert, TouchableOpacity } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedSafeAreaView } from '@/components/ThemeSafeAreaView';
import ProgramCard from '@/components/ProgramCard';
import { useQuery } from '@tanstack/react-query';
import { api, apiClient } from '@/lib/api';
import { SearchBar } from '@/components/SearchBar';
import { useState } from 'react';
import { router, Link } from 'expo-router';
import { Avatar, Skeleton } from '@rneui/themed';
import { useAuth } from '@/providers/auth-provider';
import { Button, IconButton } from 'react-native-paper';
import { Colors } from '@/constants/Colors';
import { Image } from 'expo-image';
import { useColorScheme } from '@/hooks/useColorScheme.web';
import AnimatedDrawer from '@/components/AnimatedDrawer';
import { Dimensions } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

const { height, width } = Dimensions.get("window");

const placeholderPrograms = [
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d72',
    s3ImageKey: 'https://res.cloudinary.com/dqrk3drua/image/upload/f_auto,q_auto/v1/fitizen/s2j4mlhnvppquh8j9jk9',
    name: 'Pre/Post-Natal Program',
    difficulty: 'Beginner',
    placeholder: 'Coming Soon',
    opacity: 0.65,
  },
  {
    id: '58654a0f-3da1-471f-bd96-145571e29d72',
    s3ImageKey: 'https://res.cloudinary.com/dqrk3drua/image/upload/f_auto,q_auto/v1/fitizen/gsncbv3ba7lpycpp7jc0',
    name: 'Intro to Boxing',
    difficulty: 'Beginner',
    placeholder: 'Coming Soon',
    opacity: 0.65,
  },
];

type ItemProps = {
  imageUrl?: string;
  title: string;
  difficulty?: string;
  placeholder?: string;
};

const Item = ({title}: ItemProps) => (
  <View className='h-48 bg-slate-400 rounded my-2'>
    <Text>{title}</Text>
  </View>
);

export default function ProgramsScreen() {
  const { signOut, session } = useAuth();
  const colorScheme = useColorScheme();
  const tabBarHeight = useBottomTabBarHeight();
  // console.log("auth", auth?.session.user)
  const [searchQuery, setSearchQuery] = useState('');
  const [openDrawer, setOpenDrawer] = useState(false);
  const {
    data: programs,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['programs', searchQuery],
    queryFn: () => apiClient.programs.list(searchQuery),
  });

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

  return (
    <ThemedSafeAreaView className='flex-1'>
      <ThemedView className='px-4 h-full'>
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
        {/* <ThemedText className='font-bold text-center'>Programs</ThemedText> */}
        <SearchBar
          placeholder='Search Programs ...'
          onSearch={setSearchQuery}
        />
        {isLoading ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {[...Array(3)].map((item, index) => <Skeleton key={`skeleton-${index}`} height={196} className='my-2 rounded-lg' skeletonStyle={{ backgroundColor: "gray" }} />)}
          </ScrollView>
        ) : (
          <FlatList
            data={programs ? [...programs, ...placeholderPrograms.filter((p => p.name.toLowerCase().includes(searchQuery)))] : placeholderPrograms.filter((p => p.name.toLowerCase().includes(searchQuery)))}
            renderItem={({item}) => (
              <Link
                href={{
                  pathname: '/(tabs)/(programs)/[programId]',
                  params: { programId: item.id }
                }}
                disabled={!!item.opacity}
                asChild
              >
                <Pressable
                  style={({ pressed }) => [
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <ProgramCard {...item} />
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
          />
        )}
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
