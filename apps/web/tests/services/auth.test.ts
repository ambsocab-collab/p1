import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { supabase } from '@/lib/supabase';
import {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  getCurrentSession,
  getCurrentAuthUser,
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  resetPassword,
  updatePassword,
  onAuthStateChange,
} from '@/lib/auth';
import type { User } from '@supabase/supabase-js';

// Mock supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      getSession: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:5173',
  },
  writable: true,
});

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signUp', () => {
    it('should sign up a user successfully', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const fullName = 'Test User';

      const mockUser: User = {
        id: 'user1',
        email,
        user_metadata: { full_name: fullName },
        app_metadata: {},
        aud: 'authenticated',
        created_at: '2024-01-01T00:00:00Z',
      };

      const mockResponse = {
        data: { user: mockUser, session: {} },
        error: null,
      };

      (supabase.auth.signUp as any).mockResolvedValue(mockResponse);
      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: mockUser.id, email, full_name: fullName },
          error: null,
        }),
      });

      const result = await signUp(email, password, fullName);

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle sign up errors', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const mockError = new Error('Sign up failed');

      const mockResponse = {
        data: { user: null, session: null },
        error: mockError,
      };

      (supabase.auth.signUp as any).mockResolvedValue(mockResponse);

      const result = await signUp(email, password);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('signIn', () => {
    it('should sign in a user successfully', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      const mockResponse = {
        data: { user: { id: 'user1', email }, session: {} },
        error: null,
      };

      (supabase.auth.signInWithPassword as any).mockResolvedValue(mockResponse);

      const result = await signIn(email, password);

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email,
        password,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('signOut', () => {
    it('should sign out a user successfully', async () => {
      const mockResponse = { error: null };

      (supabase.auth.signOut as any).mockResolvedValue(mockResponse);

      const result = await signOut();

      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      const mockUser: User = {
        id: 'user1',
        email: 'test@example.com',
        user_metadata: {},
        app_metadata: {},
        aud: 'authenticated',
        created_at: '2024-01-01T00:00:00Z',
      };

      const mockResponse = {
        data: { user: mockUser },
      };

      (supabase.auth.getUser as any).mockResolvedValue(mockResponse);

      const result = await getCurrentUser();

      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should return null when no user is authenticated', async () => {
      const mockResponse = {
        data: { user: null },
      };

      (supabase.auth.getUser as any).mockResolvedValue(mockResponse);

      const result = await getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('getCurrentSession', () => {
    it('should get current session successfully', async () => {
      const mockSession = { user: { id: 'user1' }, access_token: 'token' };

      const mockResponse = {
        data: { session: mockSession },
      };

      (supabase.auth.getSession as any).mockResolvedValue(mockResponse);

      const result = await getCurrentSession();

      expect(supabase.auth.getSession).toHaveBeenCalled();
      expect(result).toEqual(mockSession);
    });
  });

  describe('getCurrentAuthUser', () => {
    it('should return authenticated user with profile', async () => {
      const mockUser: User = {
        id: 'user1',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: '2024-01-01T00:00:00Z',
      };

      const mockSession = { user: mockUser };
      const mockProfile = {
        id: 'user1',
        email: 'test@example.com',
        full_name: 'Test User',
        preferences: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: mockSession },
      });
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      });

      const result = await getCurrentAuthUser();

      expect(result).toEqual({
        id: 'user1',
        email: 'test@example.com',
        full_name: 'Test User',
        isAnonymous: false,
      });
    });

    it('should return anonymous user when no session', async () => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
      });

      const result = await getCurrentAuthUser();

      expect(result).toEqual({
        id: 'anonymous',
        isAnonymous: true,
      });
    });
  });

  describe('createUserProfile', () => {
    it('should create user profile successfully', async () => {
      const userId = 'user1';
      const email = 'test@example.com';
      const fullName = 'Test User';

      const mockProfile = {
        id: userId,
        email,
        full_name: fullName,
        preferences: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      });

      const result = await createUserProfile(userId, email, fullName);

      expect(supabase.from).toHaveBeenCalledWith('user_profiles');
      expect(mockInsert).toHaveBeenCalledWith({
        id: userId,
        email,
        full_name: fullName,
        preferences: {},
      });
      expect(result).toEqual(mockProfile);
    });

    it('should return null when profile creation fails', async () => {
      const userId = 'user1';
      const mockError = new Error('Profile creation failed');

      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      });

      const result = await createUserProfile(userId);

      expect(result).toBeNull();
    });
  });

  describe('getUserProfile', () => {
    it('should get user profile successfully', async () => {
      const userId = 'user1';
      const mockProfile = {
        id: userId,
        email: 'test@example.com',
        full_name: 'Test User',
        preferences: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      const result = await getUserProfile(userId);

      expect(supabase.from).toHaveBeenCalledWith('user_profiles');
      expect(mockEq).toHaveBeenCalledWith('id', userId);
      expect(result).toEqual(mockProfile);
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const userId = 'user1';
      const updates = { full_name: 'Updated Name' };
      const mockProfile = {
        id: userId,
        email: 'test@example.com',
        full_name: 'Updated Name',
        preferences: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      (supabase.from as any).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
        select: mockSelect,
        single: mockSingle,
      });

      const result = await updateUserProfile(userId, updates);

      expect(supabase.from).toHaveBeenCalledWith('user_profiles');
      expect(mockUpdate).toHaveBeenCalledWith(updates);
      expect(mockEq).toHaveBeenCalledWith('id', userId);
      expect(result).toEqual(mockProfile);
    });
  });

  describe('resetPassword', () => {
    it('should send password reset email successfully', async () => {
      const email = 'test@example.com';

      (supabase.auth.resetPasswordForEmail as any).mockResolvedValue({ error: null });

      const result = await resetPassword(email);

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(email, {
        redirectTo: 'http://localhost:5173/reset-password',
      });
      expect(result).toEqual({ error: null });
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      const password = 'newpassword123';

      (supabase.auth.updateUser as any).mockResolvedValue({ error: null });

      const result = await updatePassword(password);

      expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password });
      expect(result).toEqual({ error: null });
    });
  });

  describe('onAuthStateChange', () => {
    it('should set up auth state change listener', () => {
      const mockCallback = vi.fn();
      const mockSubscription = { unsubscribe: vi.fn() };

      (supabase.auth.onAuthStateChange as any).mockReturnValue({
        data: { subscription: mockSubscription },
      });

      // Mock getUserProfile for the callback
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { full_name: 'Test User' },
          error: null,
        }),
      });

      const result = onAuthStateChange(mockCallback);

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
      expect(result.data.subscription).toBe(mockSubscription);
    });
  });
});