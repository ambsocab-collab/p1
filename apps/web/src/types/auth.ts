import { User } from '@supabase/supabase-js';

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

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  isAnonymous: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

export interface AuthResponse {
  data: {
    user: User | null;
    session: any | null;
  } | null;
  error: any;
}