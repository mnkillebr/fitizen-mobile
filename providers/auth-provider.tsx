import React, { createContext, useContext, useEffect, useState } from 'react';
import { LargeSecureStore, supabase } from '@/lib/supabase';
import { Provider, Session } from '@supabase/supabase-js';
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { v4 as uuid } from "uuid";
import * as Crypto from "expo-crypto"
import JWT from 'expo-jwt';
import { generateMagicLink, getMagicLinkPayload } from '@/lib/magicLinks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiClient } from '@/lib/api';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { MAGIC_LINK_MAX_AGE } from '@/lib/magicNumbers';

WebBrowser.maybeCompleteAuthSession(); // required for web only
const redirectTo = makeRedirectUri();

type EmailUserType = {
  id: string; 
  createdAt: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePhotoId: string;
  profilePhotoUrl: string;
  role: string;
  updatedAt: string;
}

interface AuthContextType {
  completeSetup: (firstName: string, lastName: string) => Promise<void>;
  session: Session | EmailUserType | null;
  loading: boolean;
  signIn: (email: string) => Promise<void>;
  signInSocial: (provider: Provider) => Promise<void>;
  signOut: () => Promise<void>;
  validateMagicLink: (link: string) => Promise<void>;
}

const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) throw new Error(errorCode);
  const { access_token, refresh_token } = params;

  if (!access_token) return;

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) throw error;
  return data.session;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const auth = useContext(AuthContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!auth) {
      throw new Error('useAuth must be wrapped in a <SessionProvider />');
    }
  }
  return auth;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authStore = new LargeSecureStore()
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | EmailUserType | null>(null);
  const [loading, setLoading] = useState(true);

  // queries
  const sendMagicLinkMutation = useMutation({
    mutationFn: (magicLinkData) => api.auth.sendMagicLink(magicLinkData),
    onSuccess: (data) => {
      Alert.alert('Magic Link Sent', 'Check your email!', [
        {
          text: 'OK',
          onPress: () => {
            const { emailSent } = data
            if (emailSent) {
              router.navigate(emailSent)
            }
          } 
        },
      ]);
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to send magic link. Please try again.');
    },
  });
  const checkExistingOAuthUser = useMutation({
    mutationFn: (payload) => api.auth.checkIfExistingOAuthUser(payload),
    onSuccess: async (data) => {
      const currentSessionJSON = await authStore.getItem("currentSession")
      const currentSession = JSON.parse(currentSessionJSON!)
      if (data) {
        const dbUserSession = {
          ...currentSession,
          user: data.user,
        }
        setSession(dbUserSession)
        apiClient.setAuthState({
          sessionToken: currentSession.access_token,
          user: data.user,
          supabaseSession: currentSession,
          type: 'supabase'
        })
      } else {
        // if no user in db, prompt to set up profile w/ name
        await authStore.setItem("newUserEmail", currentSession?.user.email)
        await authStore.setItem("provider", currentSession?.user.app_metadata.provider)
        await authStore.setItem("provider_user_id", currentSession?.user.id)
        router.navigate("/setup-profile")
      }      
    }
  });
  const checkExistingEmailUser = useMutation({
    mutationFn: (payload) => api.auth.checkIfExistingEmailUser(payload),
    onSuccess: (data) => {
      // console.log("check existing email user", data)
      if (data) {
        // if user in db, set session
        setSession(data)
        apiClient.setAuthState({
          ...data,
          sessionToken: data.token,
          type: "jwt"
        })
      } else {
        // if no user in db, prompt to set up profile w/ name
        router.navigate("/setup-profile")
      }
    }
  });
  const createUser = useMutation({
    mutationFn: (payload) => api.auth.createUser(payload),
    onSuccess: async (data) => {
      const provider = await authStore.getItem("provider")
      setSession(data)
      apiClient.setAuthState({
        ...data,
        sessionToken: data.token,
        type: provider ? "supabase" : "jwt"
      })
    }
  });

  useEffect(() => {
    // const initializeSession = async () => {
    //   const { data } = await supabase.auth.getSession();
    //   setSession(data.session);
    //   setLoading(false); // Session initialization complete
    // };

    // initializeSession();
    const {data: { subscription }} = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // console.log("auth state listeners", session)
        if (event === 'SIGNED_OUT') {
          setSession(null)
          apiClient.clearAuthState()
        } else if (session) {
          // needs user check in db
          await authStore.setItem("currentSession", JSON.stringify(session))
          if (session.user) {
            checkExistingOAuthUser.mutate({
              action: "checkExistingOAuthUser",
              provider_email: session.user.email,
              provider_user_id: session.user.id,
            })          
          }
          // setSession(session)
        }
      })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string) => {
    const nonce = uuid();
    await authStore.setItem("nonce", nonce)

    const magicLink = generateMagicLink(email, nonce, redirectTo)
    sendMagicLinkMutation.mutate({ magicLink, email })
    // const { error } = await supabase.auth.signInWithOtp({ email });
    // if (error) {
    //   console.error('Error signing in:', error.message);
    // }
  };

  const signInSocial = async (provider: Provider) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        skipBrowserRedirect: true,
        queryParams: {
          prompt: "consent"
        }
      }
    });

    if (error) {
      console.error(`Error signing in with ${provider}:`, error.message);
      throw error;
    }

    const res = await WebBrowser.openAuthSessionAsync(
      data?.url ?? "",
      redirectTo
    );
    if (res.type === "success") {
      const { url } = res;
      await createSessionFromUrl(url);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
    apiClient.clearAuthState()
    // router.dismissAll()
  };

  const validateMagicLink = async (link: string) => {
    const magicLinkPayload = getMagicLinkPayload(link)

    // Check magic link expiration
    const createdAt = new Date(magicLinkPayload.createdAt);
    const expiresAt = createdAt.getTime() + MAGIC_LINK_MAX_AGE;
    if (Date.now() > expiresAt) {
      console.log("The magic link has expired");
    }

    // Check magic link nonce
    const storedNonce = await authStore.getItem("nonce")
    if (storedNonce !== magicLinkPayload.nonce) {
      console.log("Invalid nonce");
    }

    await authStore.setItem("newUserEmail", magicLinkPayload.email)
    // needs user check in db
    checkExistingEmailUser.mutate({
      action: "checkExistingEmailUser",
      magic_link_email: magicLinkPayload.email
    })
  }

  const completeSetup = async (firstName: string, lastName: string) => {
    const storedEmail = await authStore.getItem("newUserEmail")
    const provider = await authStore.getItem("provider")
    const provider_user_id = await authStore.getItem("provider_user_id")
    createUser.mutate({
      action: "createUser",
      firstName,
      lastName,
      email: storedEmail,
      provider,
      provider_user_id,
    })
  }

  return (
    <AuthContext.Provider value={{ completeSetup, loading, session, signIn, signInSocial, signOut, validateMagicLink }}>
      {children}
    </AuthContext.Provider>
  );
};