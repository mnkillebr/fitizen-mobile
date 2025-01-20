import * as SecureStore from 'expo-secure-store';

/** Save session token securely */
export const saveSession = async (sessionToken: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync('session_token', sessionToken);
    console.log('Session token saved.');
  } catch (error) {
    console.error('Failed to save session token:', (error as Error).message);
  }
};

/** Retrieve session token from secure storage */
export const getSession = async (): Promise<string | null> => {
  try {
    const sessionToken = await SecureStore.getItemAsync('session_token');
    return sessionToken;
  } catch (error) {
    console.error('Failed to retrieve session token:', (error as Error).message);
    return null;
  }
};

/** Clear session token from secure storage */
export const clearSession = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync('session_token');
    console.log('Session cleared.');
  } catch (error) {
    console.error('Failed to clear session:', (error as Error).message);
  }
};