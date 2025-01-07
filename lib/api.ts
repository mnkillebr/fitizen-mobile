import { Platform } from 'react-native';
import Constants from 'expo-constants';

const DEV_API_URL = __DEV__
  ? Platform.select({
      // ios: Constants.expoConfig?.extra?.ngrokUrl || 'http://localhost:3000',
      ios: 'http://localhost:3000',
      android: 'http://10.0.2.2:3000',
      default: 'http://localhost:3000'
    })
  : 'https://fitizen.fly.dev';

export const api = {
  programs: {
    list: async (query?: string) => {
      const params = new URLSearchParams();
      if (query) params.append('q', query);

      const url = `${DEV_API_URL}/api/mobile/programs${query ? `?${params}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch programs');
      return response.json();
    },
    programDetail: async (programId: string) => {
      const url = `${DEV_API_URL}/api/mobile/programs/${programId}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch program');
      return response.json();
    },
    create: async (programData: any) => {
      const response = await fetch(`${DEV_API_URL}/api/mobile/programs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(programData),
      });
      if (!response.ok) throw new Error('Failed to create program');
      return response.json();
    }
  },
  workouts: {
    list: async (query?: string) => {
      const params = new URLSearchParams();
      if (query) params.append('q', query);

      const url = `${DEV_API_URL}/api/mobile/workouts${query ? `?${params}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch workouts');
      return response.json();
    },
    workoutDetail: async (workoutId: string) => {
      const url = `${DEV_API_URL}/api/mobile/workouts/${workoutId}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch workout');
      return response.json();
    },
    saveWorkout: async (workoutData) => {
      const url = `${DEV_API_URL}/api/mobile/workouts`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workoutData),
      });
      if (!response.ok) throw new Error('Failed to save workout');
      return response.json();
    }
  },
  exercises: {
    list: async ({ query, page, limit }: { 
      query?: string;
      page: number;
      limit?: number;
    }) => {
      const params = new URLSearchParams({
        page: page.toString(),
      });
      if (query) params.append('q', query);
      if (limit) params.append('limit', limit.toString());

      const url = `${DEV_API_URL}/api/mobile/exercises?${params}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch exercises');
      return response.json();
    },
    exerciseDetail: async (exerciseId: string) => {
      const url = `${DEV_API_URL}/api/mobile/exercises/${exerciseId}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch exercise');
      return response.json();
    },
  },
};
