import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email?: string;
  full_name?: string;
  isAnonymous: boolean;
}

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Authentication helper functions
export const signUp = async (email: string, password: string, fullName?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (data.user && !error) {
    // Create user profile
    await createUserProfile(data.user.id, email, fullName);
  }

  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};

export const signOut = async (): Promise<{ error: any }> => {
  return await supabase.auth.signOut();
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getCurrentSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Get current auth user with profile information
export const getCurrentAuthUser = async (): Promise<AuthUser | null> => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return {
      id: 'anonymous',
      isAnonymous: true,
    };
  }

  const user = session.user;
  const profile = await getUserProfile(user.id);

  return {
    id: user.id,
    email: user.email,
    full_name: profile?.full_name || user.user_metadata?.full_name,
    isAnonymous: false,
  };
};

// User profile functions
export const createUserProfile = async (
  userId: string,
  email?: string,
  fullName?: string
): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      id: userId,
      email: email || null,
      full_name: fullName || null,
      preferences: {},
    } as any)
    .select()
    .single();

  if (error) {
    console.error('Error creating user profile:', error);
    return null;
  }

  return data;
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates as any)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    return null;
  }

  return data;
};

// Password reset
export const resetPassword = async (email: string): Promise<{ error: any }> => {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
};

export const updatePassword = async (password: string): Promise<{ error: any }> => {
  return await supabase.auth.updateUser({
    password,
  });
};

// Authentication state listener
export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const profile = await getUserProfile(session.user.id);
      callback({
        id: session.user.id,
        email: session.user.email,
        full_name: profile?.full_name || session.user.user_metadata?.full_name,
        isAnonymous: false,
      });
    } else {
      callback({
        id: 'anonymous',
        isAnonymous: true,
      });
    }
  });
};