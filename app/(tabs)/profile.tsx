import { StyleSheet, Platform, Text, View, TextInput, Keyboard, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedSafeAreaView } from '@/components/ThemeSafeAreaView';
import LottieView from 'lottie-react-native';
import { useEffect, useRef, useState } from 'react';
import { Button, Divider, FAB, Icon, Snackbar } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '@/providers/auth-provider';
import HoldableButton from '@/components/HoldableButton';
import HoldableButtonRect from '@/components/HoldableButton2';
import HoldableProgressButton from '@/components/HoldableProgressButton';
import { useBottomSheet } from '@/providers/bottom-sheet-provider';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Avatar, CheckBox, Tab, TabView } from '@rneui/themed';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api, apiClient } from '@/lib/api';
import FitnessSettings from '@/components/FitnessSettings';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Alert } from 'react-native';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const tabBarHeight = useBottomTabBarHeight();
  const { signOut, session } = useAuth();
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [image, setImage] = useState<string | null>(session.user.profilePhotoUrl ?? null);
  const [file, setFile] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [firstName, setFirstName] = useState(session.user.firstName ?? '');
  const [lastName, setLastName] = useState(session.user.lastName ?? '');
  const [email, setEmail] = useState(session.user.email ?? '');
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [message, setMessage] = useState('');
  const [snackOpen, setSnackOpen] = useState(false)
  const [isFocused, setIsFocused] = useState({
    first: false,
    last: false,
    email: false,
  });
  const {
    data: fitnessProfile,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => apiClient.profile.getUserProfile(),
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
  const uploadMutation = useMutation({
    mutationFn: (payload) => api.uploads.uploadToCloudinary(payload),
    // mutationFn: (payload) => apiClient.profile.updateProfileImage(payload),
    onSuccess: (data) => {
      if (data) {
        console.log("upload data", data)
      }
    },
    onError: (error) => {
      console.log("upload error", error)
    },
  })
  const generateSignatureMutation = useMutation({
    mutationFn: (payload) => apiClient.upload.generateSignature(payload),
    onSuccess: async (data) => {
      if (data) {
        console.log("signature data", data, file)
        // uploadMutation.mutate({
        //   cloudName: data.cloudName,
        //   apiKey: data.apiKey,
        //   signature: data.signature,
        //   timestamp: `${data.timestamp}`,
        //   file: file,
        // })
      }
    },
    onError: (error) => {
      console.log("signature error", error)
    },
  });
  const saveProfileMutation = useMutation({
    mutationFn: (payload) => apiClient.profile.updateUserProfile(payload),
    onSuccess: (data) => {
      if (data) {
        // console.log("profile data", data)
        setSnackOpen(true)
      }
    },
    onError: (error) => {
      // console.log("profile error", error)
    },
  })

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', /*'videos'*/],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    // generateSignatureMutation.mutate({ public_id: `${Date.now()}-${Math.random().toString(36).substring(2, 15)}` })
    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setFile(result.assets[0])
    }
  };

  const handleEmailChange = (emailText: string) => {
    setMessage('')
    setEmail(emailText);

    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    setIsValidEmail(emailRegex.test(emailText));
  };

  // console.log("session", session.user)

  return (
    <ThemedSafeAreaView className='flex-1'>
      <ThemedView className='h-full'>
        {/* <ThemedText className='font-bold px-4 pt-4'>Profile</ThemedText> */}
        {/* <View className='flex-1'>
        </View> */}
        <Tab
          value={tabIndex}
          onChange={(e) => setTabIndex(e)}
          indicatorStyle={{
            backgroundColor: Colors[colorScheme ?? 'light'].tint,
            height: 3,
          }}
          variant="default"
        >
          {['General Settings', 'Fitness Profile'].map((tabLabel, tabLabelIdx) => (
            <Tab.Item
              key={`tab-${tabLabelIdx}`}
              title={tabLabel}
              titleStyle={(active) => ({
                fontSize: 12,
                fontWeight: "bold",
                color: active ? Colors[colorScheme ?? 'light'].tint :  Colors[colorScheme ?? 'light'].text
              })}
            />
          ))}
        </Tab>
        <TabView value={tabIndex} onChange={setTabIndex} animationType="spring">
          <TabView.Item className="p-4 w-full">
            <View className="flex-col">
              <Text className='dark:text-gray-400'>Manage your account settings and user information</Text>
              <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefetching}
                    onRefresh={refetch}
                  />
                }
              >
                <View className="flex-col items-center my-8">
                  {image ? (
                    <Image
                      key={image}
                      source={{ uri: image }}
                      style={{ width: 120, height: 120, borderRadius: 60 }}
                      contentFit="cover"
                      // transition={100}
                    />
                  ) : (
                    <Avatar
                      size={120}
                      rounded
                      title={`${session.user.firstName[0]}${session.user.lastName[0]}`}
                      containerStyle={{ backgroundColor: Colors[colorScheme ?? "light"].backgroundMuted }}
                      onPress={pickImage}
                    >
                      <Avatar.Accessory size={32} />
                    </Avatar>
                  )}
                  {/* <TouchableOpacity className='flex-row gap-2 mt-4 items-center' onPress={pickImage}>
                    <Icon
                      size={20}
                      source='camera'
                      color={Colors[colorScheme ?? "light"].text}
                    />
                    <ThemedText style={{ fontSize: 14 }}>{`${image ? "Change" : "Choose"} Profile Photo`}</ThemedText>
                  </TouchableOpacity> */}
                  {/* {file && <FAB
                    label="Upload Image"
                    style={{
                      backgroundColor: Colors[colorScheme ?? 'light'].tint,
                      shadowColor: colorScheme === "dark" ? "#fff" : "unset",
                      marginTop: 8
                    }}
                    color="black"
                    customSize={40}
                    // disabled={firstName === session.user.firstName && lastName === session.user.lastName && email === session.user.email}
                    onPress={() => {
                      // uploadMutation.mutate(file)
                      console.log(file.data)
                    }}
                  />} */}
                </View>
                <View className="border rounded-md p-4 mb-20" style={{ borderColor: Colors[colorScheme ?? "light"].border }}>
                  <ThemedText type="defaultSemiBold">User Settings</ThemedText>
                  <Text className='text-gray-400'>Keep your user profile up to date</Text>
                  <View className='mt-2 flex-col'>
                    <ThemedText type="defaultSemiBold" style={{ fontSize: 14 }}>First Name</ThemedText>
                    <TextInput
                      style={[styles.input, isFocused.first && styles.inputFocused, { color: Colors[colorScheme ?? "light"].text }]}
                      placeholder="First Name"
                      placeholderTextColor="#78716c"
                      value={firstName}
                      onChangeText={setFirstName}
                      selectionColor="#fff"
                      keyboardType="default"
                      autoCapitalize="none"
                      autoComplete="off"
                      onFocus={() => setIsFocused({
                        ...isFocused,
                        first: true,
                      })}
                      onBlur={() => setIsFocused({
                        ...isFocused,
                        first: false,
                      })}
                    />
                    <ThemedText type="defaultSemiBold" style={{ fontSize: 14 }}>Last Name</ThemedText>
                    <TextInput
                      style={[styles.input, isFocused.last && styles.inputFocused, { color: Colors[colorScheme ?? "light"].text }]}
                      placeholder="Last Name"
                      placeholderTextColor="#78716c"
                      value={lastName}
                      onChangeText={setLastName}
                      selectionColor="#fff"
                      keyboardType="default"
                      autoCapitalize="none"
                      autoComplete="off"
                      onFocus={() => setIsFocused({
                        ...isFocused,
                        last: true,
                      })}
                      onBlur={() => setIsFocused({
                        ...isFocused,
                        last: false,
                      })}
                    />
                    <ThemedText type="defaultSemiBold" style={{ fontSize: 14 }}>Email</ThemedText>
                    <TextInput
                      style={[styles.input, isFocused.last && styles.inputFocused, { color: Colors[colorScheme ?? "light"].text }]}
                      placeholder="Email Name"
                      placeholderTextColor="#78716c"
                      value={email}
                      onChangeText={handleEmailChange}
                      selectionColor="#fff"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="off"
                      onFocus={() => setIsFocused({
                        ...isFocused,
                        email: true,
                      })}
                      onBlur={() => setIsFocused({
                        ...isFocused,
                        email: false,
                      })}
                    />
                  </View>
                  {message ? <Text style={styles.message}>{message}</Text> : null}
                  <FAB
                    label="Save Changes"
                    style={{
                      backgroundColor: Colors[colorScheme ?? 'light'].tint,
                      shadowColor: colorScheme === "dark" ? "#fff" : "unset",
                    }}
                    color="black"
                    customSize={40}
                    disabled={firstName === session.user.firstName && lastName === session.user.lastName && email === session.user.email}
                    onPress={() => {
                      if (isValidEmail) {

                      } else {
                        setMessage("Invalid email format")
                      }
                    }}
                  />
                </View>
              </ScrollView>
            </View>
          </TabView.Item>
          <TabView.Item className="p-4 w-full">
            <FitnessSettings fitnessProfile={fitnessProfile} isLoading={isLoading} isRefetching={isRefetching} refetch={refetch} saveProfile={saveProfileMutation.mutate} />
          </TabView.Item>
        </TabView>
        {/* <Button onPress={signOut} style={{ backgroundColor: '#ffd700', borderRadius: 8, }} textColor='black'>
          Sign Out
        </Button> */}
      </ThemedView>
      <Snackbar
        style={{ position: "absolute", bottom: tabBarHeight, alignSelf: "center", width: "100%", }}
        visible={snackOpen}
        duration={2000}
        onDismiss={() => setSnackOpen(false)}
        // action={{
        //   label: 'Close',
        //   onPress: () => {
        //     // Do something
        //   },
        // }}
      >
        <ThemedText>
          Profile updated
        </ThemedText>
      </Snackbar>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  button: {
    backgroundColor: "#ffd700",
    borderRadius: 8,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  inputFocused: {
    borderColor: '#a16207',
  },
  message: {
    color: 'red'
  },
});