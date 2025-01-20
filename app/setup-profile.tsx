import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/providers/auth-provider';
import { Redirect } from 'expo-router';
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Button, Divider } from 'react-native-paper';

export default function SetupProfile() {
  const colorScheme = useColorScheme()
  const { completeSetup } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSetup = () => {
    if (!firstName || !lastName) {
      setMessage("Name(s) cannot be blank")
    } else {
      completeSetup(firstName, lastName)
    }
  }

  return (
    <ThemedView style={styles.container}>
      <View className='border rounded-md p-4' style={{ borderColor: Colors[colorScheme ?? "light"].border }}>
        <ThemedText className='text-center mb-4' type="subtitle" >Complete Your Profile</ThemedText>
        <TextInput
          style={[styles.input, isFocused && styles.inputFocused, { color: Colors[colorScheme ?? "light"].text }]}
          placeholder="First Name"
          placeholderTextColor="#78716c"
          value={firstName}
          onChangeText={setFirstName}
          selectionColor="#fff"
          keyboardType="default"
          autoCapitalize="none"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <TextInput
          style={[styles.input, isFocused && styles.inputFocused, { color: Colors[colorScheme ?? "light"].text }]}
          placeholder="Last Name"
          placeholderTextColor="#78716c"
          value={lastName}
          onChangeText={setLastName}
          selectionColor="#fff"
          keyboardType="default"
          autoCapitalize="none"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <Button
          mode="contained"
          style={styles.button}
          onPress={handleSetup}
          textColor='black'
        >
          Complete Setup
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
    color: "#fffd"
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