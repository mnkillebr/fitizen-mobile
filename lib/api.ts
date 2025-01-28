import { Platform } from 'react-native';
import Constants from 'expo-constants';

const DEV_API_URL = __DEV__
  ? Platform.select({
      ios: Constants.expoConfig?.extra?.ngrokUrl || 'http://localhost:3000',
      // ios: 'http://localhost:3000',
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
  auth: {
    sendMagicLink: async (magicLinkData) => {
      const url = `${DEV_API_URL}/api/mobile/links`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(magicLinkData),
      });
      if (!response.ok) throw new Error('Failed to send magic link');
      return response.json();
    },
    checkIfExistingOAuthUser: async (payload) => {
      const url = `${DEV_API_URL}/api/mobile/users`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to check for existing oauth user');
      return response.json();
    },
    checkIfExistingEmailUser: async (payload) => {
      const url = `${DEV_API_URL}/api/mobile/users`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to check for existing email user');
      return response.json();
    },
    createUser: async (payload) => {
      const url = `${DEV_API_URL}/api/mobile/users`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to create user');
      return response.json();
    },
  }
};

export interface User {
  id: string;
  email: string;
  // Add other user properties
}

export interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
  };
  expires_at: number;
}

export type AuthType = 'jwt' | 'supabase';

export interface AuthState {
  type: AuthType;
  user: User | null;
  sessionToken: string | null;
  supabaseSession: SupabaseSession | null;
}

class ApiClient {
  private sessionToken: string | null = null;
  private user: User | null = null;
  private authType: AuthType = 'jwt';
  private supabaseSession: SupabaseSession | null = null;

  setAuthState(authState: AuthState) {
    this.sessionToken = authState.sessionToken;
    this.user = authState.user;
    this.authType = authState.type;
    this.supabaseSession = authState.supabaseSession || null;
  }

  clearAuthState() {
    this.sessionToken = null;
    this.user = null;
    this.supabaseSession = null;
  }

  private async fetch(endpoint: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers);

    // Add auth headers if session exists
    if (this.authType === 'jwt' && this.sessionToken) {
      headers.set('Authorization', `Bearer ${this.sessionToken}`);
    } else if (this.authType === 'supabase' && this.supabaseSession) {
      headers.set('Authorization', `Bearer ${this.supabaseSession.access_token}`);
    }
    
    // Add user context if needed
    if (this.user) {
      headers.set('Fitizen-User-Id', this.user.id);
    }

    const response = await fetch(`${DEV_API_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      // Handle different error status codes
      if (response.status === 401) {
        if (response.statusText === "Invalid token") {
          throw new Error("Session expired");
        } else {
          throw new Error("'Unauthorized'");
        }
      }
      throw new Error('API request failed');
    }

    return response.json();
  }

  // API methods
  programs = {
    list: async (query?: string) => {
      const params = new URLSearchParams();
      if (query) params.append('q', query);

      const endpoint = `/api/mobile/programs${query ? `?${params}` : ''}`;
      return this.fetch(endpoint);
    },
    programDetail: async (programId: string) => {
      const endpoint = `/api/mobile/programs/${programId}`;
      return this.fetch(endpoint);
    },
    programWorkout: async (programId: string) => {
      const endpoint = `/api/mobile/programs/workouts?id=${programId}`;
      return this.fetch(endpoint);
    },
    programWorkoutLog: async (logId: string) => {
      const endpoint = `/api/mobile/programs/logs/${logId}`;
      return this.fetch(endpoint);
    },
    create: async (programData: any) => {
      const endpoint = `/api/mobile/programs`
      return this.fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(programData),
      });
    },
    saveProgramWorkout: async (workoutData: any) => {
      const endpoint = `/api/mobile/programs`;
      return this.fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workoutData),
      });
    }
  }
  workouts = {
    list: async (query?: string) => {
      const params = new URLSearchParams();
      if (query) params.append('q', query);

      const endpoint = `/api/mobile/workouts${query ? `?${params}` : ''}`;
      return this.fetch(endpoint);
    },
    workoutDetail: async (workoutId: string) => {
      const endpoint = `/api/mobile/workouts/${workoutId}`;
      return this.fetch(endpoint);
    },
    workoutLog: async (logId: string) => {
      const endpoint = `/api/mobile/workouts/logs/${logId}`;
      return this.fetch(endpoint);
    },
    saveWorkout: async (workoutData: any) => {
      const endpoint = `/api/mobile/workouts`;
      return this.fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workoutData),
      });
    }
  }
  exercises = {
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

      const endpoint = `/api/mobile/exercises?${params}`;
      return this.fetch(endpoint);
    },
    exerciseDetail: async (exerciseId: string) => {
      const endpoint = `/api/mobile/exercises/${exerciseId}`;
      return this.fetch(endpoint);
    },
  }
}

export const apiClient = new ApiClient();