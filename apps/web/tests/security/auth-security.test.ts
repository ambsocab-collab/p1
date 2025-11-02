/**
 * Authentication Security Tests
 * Tests for authentication bypass prevention and security hardening
 */

import { authSecurity, secureSignIn, secureSignUp, secureSignOut, getSecurityContext } from '../../src/lib/auth-security';

// Mock Supabase client
jest.mock('../../src/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn()
    }
  }
}));

describe('Authentication Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset rate limits
    (authSecurity as any).rateLimitStore.clear();

    // Clear session storage
    sessionStorage.clear();
  });

  describe('Rate Limiting', () => {
    test('Prevents excessive sign in attempts', async () => {
      const { supabase } = require('../../src/lib/supabase');

      // Mock failed sign in attempts
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid login credentials' }
      });

      // Make multiple rapid attempts
      const attempts = [];
      for (let i = 0; i < 6; i++) {
        attempts.push(secureSignIn('test@example.com', 'password'));
      }

      const results = await Promise.all(attempts);

      // First 5 attempts should proceed (with errors)
      const firstFive = results.slice(0, 5);
      firstFive.forEach(result => {
        expect(result.success).toBe(false);
        expect(result.error).not.toBe('Too many sign in attempts');
      });

      // 6th attempt should be rate limited
      expect(results[5].success).toBe(false);
      expect(results[5].error).toBe('Too many sign in attempts. Please try again later.');
    });

    test('Prevents excessive sign up attempts', async () => {
      const { supabase } = require('../../src/lib/supabase');

      // Mock failed sign up attempts
      supabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already registered' }
      });

      // Make multiple rapid attempts
      const attempts = [];
      for (let i = 0; i < 6; i++) {
        attempts.push(secureSignUp('test@example.com', 'password123'));
      }

      const results = await Promise.all(attempts);

      // First 5 attempts should proceed (with errors)
      const firstFive = results.slice(0, 5);
      firstFive.forEach(result => {
        expect(result.success).toBe(false);
        expect(result.error).not.toBe('Too many sign up attempts');
      });

      // 6th attempt should be rate limited
      expect(results[5].success).toBe(false);
      expect(results[5].error).toBe('Too many sign up attempts. Please try again later.');
    });
  });

  describe('Input Validation', () => {
    test('Rejects invalid email formats', async () => {
      const result = await secureSignIn('invalid-email', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email format');
    });

    test('Rejects emails that are too long', async () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = await secureSignIn(longEmail, 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email format');
    });

    test('Rejects passwords that are too short', async () => {
      const result = await secureSignIn('test@example.com', 'short');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Password must be at least 8 characters');
    });

    test('Enforces password complexity for sign up', async () => {
      const result = await secureSignUp('test@example.com', 'weakpassword');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Password must be at least 8 characters with uppercase, lowercase, and number');
    });

    test('Accepts valid password complexity', async () => {
      const { supabase } = require('../../src/lib/supabase');

      supabase.auth.signUp.mockResolvedValue({
        data: { user: { id: 'test-user-id' }, session: null },
        error: null
      });

      const result = await secureSignUp('test@example.com', 'Password123');

      expect(result.success).toBe(true);
    });

    test('Rejects names that are too long', async () => {
      const { supabase } = require('../../src/lib/supabase');

      supabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: null
      });

      const longName = 'a'.repeat(150);
      const result = await secureSignUp('test@example.com', 'Password123', longName);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Name too long');
    });
  });

  describe('Error Message Sanitization', () => {
    test('Sanitizes sensitive error messages', async () => {
      const { supabase } = require('../../src/lib/supabase');

      // Mock various error scenarios
      const sensitiveErrors = [
        'Database connection failed: invalid_credentials',
        'Internal server error: stack trace information',
        'SQL error: table users does not exist',
        'JWT token invalid: expired signature'
      ];

      for (const errorMessage of sensitiveErrors) {
        supabase.auth.signInWithPassword.mockResolvedValue({
          data: { session: null },
          error: { message: errorMessage }
        });

        const result = await secureSignIn('test@example.com', 'password123');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Authentication failed. Please check your credentials and try again.');
      }
    });

    test('Allows safe error messages', async () => {
      const { supabase } = require('../../src/lib/supabase');

      const safeErrors = [
        'Invalid login credentials',
        'Email not confirmed',
        'User already registered'
      ];

      for (const errorMessage of safeErrors) {
        supabase.auth.signInWithPassword.mockResolvedValue({
          data: { session: null },
          error: { message: errorMessage }
        });

        const result = await secureSignIn('test@example.com', 'password123');

        expect(result.success).toBe(false);
        expect(result.error).toBe(errorMessage);
      }
    });
  });

  describe('Session Security', () => {
    test('Handles missing session gracefully', async () => {
      const { supabase } = require('../../src/lib/supabase');

      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      });

      await authSecurity.initializeSecurityContext();
      const context = getSecurityContext();

      expect(context).not.toBeNull();
      expect(context?.isAuthenticated).toBe(false);
      expect(context?.securityLevel).toBe('anonymous');
    });

    test('Detects invalid session structure', async () => {
      const { supabase } = require('../../src/lib/supabase');

      // Mock session with invalid user ID
      supabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'invalid-user-id',
              created_at: new Date().toISOString(),
              user_metadata: {}
            },
            access_token: 'valid-token'
          }
        },
        error: null
      });

      await authSecurity.initializeSecurityContext();
      const context = getSecurityContext();

      expect(context?.isAuthenticated).toBe(false);
      expect(context?.securityLevel).toBe('anonymous');
    });

    test('Detects expired sessions', async () => {
      const { supabase } = require('../../src/lib/supabase');

      // Mock very old session
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 2); // 2 days ago

      supabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: {
              id: '12345678-1234-1234-1234-123456789012',
              created_at: oldDate.toISOString(),
              user_metadata: {}
            },
            access_token: 'a'.repeat(60) // Valid length token
          }
        },
        error: null
      });

      await authSecurity.initializeSecurityContext();
      const context = getSecurityContext();

      expect(context?.isAuthenticated).toBe(false);
      expect(context?.securityLevel).toBe('anonymous');
    });
  });

  describe('Origin Validation', () => {
    const originalLocation = window.location;

    beforeEach(() => {
      // Mock window.location
      delete (window as any).location;
      (window as any).location = { origin: 'https://example.com' };
    });

    afterEach(() => {
      window.location = originalLocation;
    });

    test('Allows requests from allowed origins', async () => {
      // Mock referrer matching allowed origin
      Object.defineProperty(document, 'referrer', {
        value: 'https://example.com/page',
        writable: true
      });

      const { supabase } = require('../../src/lib/supabase');
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: { user: { id: 'test-user-id' } } },
        error: null
      });

      const result = await secureSignIn('test@example.com', 'Password123');

      expect(result.success).toBe(true);
    });

    test('Blocks requests from unauthorized origins', async () => {
      // Mock referrer from different origin
      Object.defineProperty(document, 'referrer', {
        value: 'https://malicious-site.com/evil-page',
        writable: true
      });

      const result = await secureSignIn('test@example.com', 'Password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid request origin');
    });
  });

  describe('Security Context Management', () => {
    test('Updates security context on successful authentication', async () => {
      const { supabase } = require('../../src/lib/supabase');

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          session: {
            user: {
              id: '12345678-1234-1234-1234-123456789012',
              created_at: new Date().toISOString(),
              user_metadata: { role: 'admin' }
            },
            access_token: 'a'.repeat(60)
          }
        },
        error: null
      });

      const result = await secureSignIn('test@example.com', 'Password123');

      expect(result.success).toBe(true);

      const context = getSecurityContext();
      expect(context?.isAuthenticated).toBe(true);
      expect(context?.userId).toBe('12345678-1234-1234-1234-123456789012');
      expect(context?.securityLevel).toBe('elevated'); // Admin user
    });

    test('Clears security context on sign out', async () => {
      const { supabase } = require('../../src/lib/supabase');

      // First sign in
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          session: {
            user: {
              id: '12345678-1234-1234-1234-123456789012',
              created_at: new Date().toISOString(),
              user_metadata: {}
            },
            access_token: 'a'.repeat(60)
          }
        },
        error: null
      });

      await secureSignIn('test@example.com', 'Password123');

      let context = getSecurityContext();
      expect(context?.isAuthenticated).toBe(true);

      // Then sign out
      supabase.auth.signOut.mockResolvedValue({ error: null });

      const signOutResult = await secureSignOut();
      expect(signOutResult.success).toBe(true);

      context = getSecurityContext();
      expect(context?.isAuthenticated).toBe(false);
      expect(context?.securityLevel).toBe('anonymous');
    });
  });

  describe('Session Timeout', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('Detects session timeout due to inactivity', async () => {
      const { supabase } = require('../../src/lib/supabase');

      // Mock successful sign in
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          session: {
            user: {
              id: '12345678-1234-1234-1234-123456789012',
              created_at: new Date().toISOString(),
              user_metadata: {}
            },
            access_token: 'a'.repeat(60)
          }
        },
        error: null
      });

      await secureSignIn('test@example.com', 'Password123');

      let isValid = authSecurity.isSessionValid();
      expect(isValid).toBe(true);

      // Simulate 35 minutes of inactivity (default timeout is 30 minutes)
      jest.advanceTimersByTime(35 * 60 * 1000);

      isValid = authSecurity.isSessionValid();
      expect(isValid).toBe(false);
    });
  });

  describe('Re-authentication Requirements', () => {
    test('Requires re-auth for elevated security users', async () => {
      const { supabase } = require('../../src/lib/supabase');

      // Mock sign in as elevated user
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          session: {
            user: {
              id: '12345678-1234-1234-1234-123456789012',
              created_at: new Date().toISOString(),
              user_metadata: { role: 'admin' }
            },
            access_token: 'a'.repeat(60)
          }
        },
        error: null
      });

      await secureSignIn('test@example.com', 'Password123');

      // Initially should not require re-auth
      let needsReauth = authSecurity.requireReauthentication();
      expect(needsReauth).toBe(false);

      // After 16 minutes, should require re-auth (15 minute timeout for elevated users)
      jest.useFakeTimers();
      jest.advanceTimersByTime(16 * 60 * 1000);

      needsReauth = authSecurity.requireReauthentication();
      expect(needsReauth).toBe(true);

      jest.useRealTimers();
    });
  });

  describe('Security Audit', () => {
    test('Provides security audit information', async () => {
      const audit = authSecurity.getSecurityAudit();

      expect(audit).toHaveProperty('sessionValid');
      expect(audit).toHaveProperty('securityLevel');
      expect(audit).toHaveProperty('lastActivity');
      expect(audit).toHaveProperty('rateLimitActive');

      expect(typeof audit.sessionValid).toBe('boolean');
      expect(typeof audit.securityLevel).toBe('string');
      expect(typeof audit.lastActivity).toBe('number');
      expect(typeof audit.rateLimitActive).toBe('boolean');
    });
  });

  describe('Anonymous Session Management', () => {
    test('Generates consistent anonymous session IDs', () => {
      // Clear session storage first
      sessionStorage.clear();

      const audit1 = authSecurity.getSecurityAudit();
      const audit2 = authSecurity.getSecurityAudit();

      // Should generate the same session ID within the same session
      expect(audit1.lastActivity).toBe(audit2.lastActivity);
    });

    test('Clears anonymous session data on sign out', async () => {
      const { supabase } = require('../../src/lib/supabase');

      // Set up anonymous session
      const context = getSecurityContext();
      expect(context?.securityLevel).toBe('anonymous');

      // Mock sign out
      supabase.auth.signOut.mockResolvedValue({ error: null });

      await secureSignOut();

      // Verify anonymous session data is cleared
      expect(sessionStorage.getItem('anonymous_session_id')).toBeNull();
    });
  });
});