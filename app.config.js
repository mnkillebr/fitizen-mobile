export default {
  expo: {
    extra: {
      ngrokUrl: process.env.EXPO_PUBLIC_NGROK_URL,
      publicUrl: process.env.EXPO_PUBLIC_API_URL,
    },
    userInterfaceStyle: "automatic"
  }
};