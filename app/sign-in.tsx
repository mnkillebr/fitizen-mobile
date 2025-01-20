import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/providers/auth-provider';
import { Redirect } from 'expo-router';
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Button, Divider } from 'react-native-paper';

export default function SignInScreen() {
  const colorScheme = useColorScheme()
  const { loading, session, signIn, signInSocial } = useAuth();
  const [email, setEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // if (loading) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //       <Text>Loading...</Text>
  //     </View>
  //   );
  // }

  if (session) {
    return <Redirect href="/(tabs)" />;
  }

  const handleEmailChange = (emailText: string) => {
    setMessage('')
    setEmail(emailText);

    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    setIsValidEmail(emailRegex.test(emailText));
  };

  const handleSignIn = async () => {
    if (isValidEmail) {
      try {
        await signIn(email);
        // setMessage('Check your email for the login link!');
      } catch (error) {
        // setMessage('Failed to send login link.');
      }
    } else if (email.length) {
      setMessage('Email format is not valid')
    }
  };
  const handleSignInSocial = async (provider: string) => {
    try {
      await signInSocial(provider)
    } catch (error) {
      setMessage(`Failed to sign in with ${provider}.`);
    }
  }

  // console.log("valid email", isValidEmail)
  return (
    <ThemedView style={styles.container}>
      <View className='border rounded-md p-4' style={{ borderColor: Colors[colorScheme ?? "light"].border }}>
        <ThemedText className='text-center mb-4' type="subtitle" >Sign In</ThemedText>
        <TextInput
          style={[styles.input, isFocused && styles.inputFocused, { color: Colors[colorScheme ?? "light"].text }]}
          placeholder="Enter your email"
          placeholderTextColor="#78716c"
          value={email}
          onChangeText={handleEmailChange}
          selectionColor="#fff"
          keyboardType="email-address"
          autoCapitalize="none"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <Button
          mode="contained"
          style={styles.button}
          onPress={handleSignIn}
          textColor='black'
        >
          Sign In
        </Button>
        <Divider style={{ borderColor: Colors[colorScheme ?? "light"].border, marginVertical: 12 }} />
        <Button
          icon="google"
          mode="contained"
          style={styles.button}
          onPress={() => handleSignInSocial("google")}
          textColor='black'
        >
          Sign In with Google
        </Button>
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    </ThemedView>
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
    // color: "#fff"
  },
  inputFocused: {
    borderColor: '#a16207',
  },
  message: {
    marginTop: 12,
    textAlign: 'center',
    color: 'red'
  },
});