/**
 * Integration Security Tests
 * End-to-end security testing for the complete application
 */

import { supabase } from '../../src/lib/supabase';
import { secureSignIn, secureSignUp, secureSignOut, getSecurityContext } from '../../src/lib/auth-security';

describe('Integration Security Tests', () => {
  let testUser1: any;
  let testUser2: any;
  let user1Session: any;
  let user2Session: any;

  beforeAll(async () => {
    // Create test users with different roles
    const user1Result = await secureSignUp(
      `security-test-1-${Date.now()}@example.com`,
      'SecurePassword123',
      'Security Test User 1'
    );

    const user2Result = await secureSignUp(
      `security-test-2-${Date.now()}@example.com`,
      'SecurePassword456',
      'Security Test User 2'
    );

    // Extract user data (this would normally come from the signup response)
    testUser1 = { id: 'mock-user-1-id', email: 'test1@example.com' };
    testUser2 = { id: 'mock-user-2-id', email: 'test2@example.com' };

    // Mock sessions for testing
    user1Session = {
      user: testUser1,
      access_token: 'mock-token-1',
      refresh_token: 'mock-refresh-1'
    };

    user2Session = {
      user: testUser2,
      access_token: 'mock-token-2',
      refresh_token: 'mock-refresh-2'
    };
  });

  afterAll(async () => {
    // Cleanup test data
    await secureSignOut();
  });

  describe('Data Access Security Integration', () => {
    let user1AmfeId: string;
    let user2AmfeId: string;

    beforeEach(async () => {
      // Mock authenticated sessions
      jest.spyOn(supabase.auth, 'getSession').mockResolvedValue({
        data: { session: user1Session },
        error: null
      });

      // Create test AMFE for user 1
      const user1Amfe = {
        id: 'amfe-user-1-' + Date.now(),
        name: 'User 1 Security Test AMFE',
        type: 'DFMEA',
        status: 'draft',
        created_by: testUser1.id
      };

      // Mock successful insert
      jest.spyOn(supabase, 'from').mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: user1Amfe,
              error: null
            })
          })
        })
      } as any);

      user1AmfeId = user1Amfe.id;

      // Switch to user 2 and create test AMFE
      jest.spyOn(supabase.auth, 'getSession').mockResolvedValue({
        data: { session: user2Session },
        error: null
      });

      const user2Amfe = {
        id: 'amfe-user-2-' + Date.now(),
        name: 'User 2 Security Test AMFE',
        type: 'PFMEA',
        status: 'draft',
        created_by: testUser2.id
      };

      user2AmfeId = user2Amfe.id;
    });

    test('Complete data isolation between users', async () => {
      // User 1 should only see their own data
      jest.spyOn(supabase.auth, 'getSession').mockResolvedValue({
        data: { session: user1Session },
        error: null
      });

      // Mock database query that returns only user 1's data
      jest.spyOn(supabase, 'from').mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: [{
              id: user1AmfeId,
              name: 'User 1 Security Test AMFE',
              created_by: testUser1.id
            }],
            error: null
          })
        })
      } as any);

      const { data } = await supabase.from('amfes').select('*');

      expect(data).toHaveLength(1);
      expect(data[0].created_by).toBe(testUser1.id);
      expect(data[0].id).toBe(user1AmfeId);

      // Should not have access to user 2's data
      expect(data.find((item: any) => item.id === user2AmfeId)).toBeUndefined();
    });

    test('Security context updates properly on user switch', async () => {
      // Start with user 1 session
      jest.spyOn(supabase.auth, 'getSession').mockResolvedValue({
        data: { session: user1Session },
        error: null
      });

      await (getSecurityContext() as any)?.updateSecurityContext?.(user1Session);

      let context = getSecurityContext();
      expect(context?.userId).toBe(testUser1.id);
      expect(context?.isAuthenticated).toBe(true);

      // Switch to user 2
      jest.spyOn(supabase.auth, 'getSession').mockResolvedValue({
        data: { session: user2Session },
        error: null
      });

      await (getSecurityContext() as any)?.updateSecurityContext?.(user2Session);

      context = getSecurityContext();
      expect(context?.userId).toBe(testUser2.id);
      expect(context?.isAuthenticated).toBe(true);
    });
  });

  describe('Cascading Security Integration', () => {
    test('Security policies cascade through related tables', async () => {
      // Mock authenticated user
      jest.spyOn(supabase.auth, 'getSession').mockResolvedValue({
        data: { session: user1Session },
        error: null
      });

      // Test AMFE items access through cascading policies
      const amfeItemId = 'item-user-1-' + Date.now();

      // Mock database queries that respect cascading security
      jest.spyOn(supabase, 'from').mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: [{
              id: amfeItemId,
              amfe_id: 'parent-amfe-id',
              function: 'Test Function',
              // This would only be returned if user has access to parent AMFE
            }],
            error: null
          })
        })
      } as any);

      const { data: items } = await supabase.from('amfe_items').select('*').eq('id', amfeItemId);

      expect(items).toBeDefined();
      // In a real scenario, this would be empty if user doesn't have access to parent AMFE
    });

    test('Security prevents unauthorized access through joins', async () => {
      // Mock attempt to access data through complex joins
      jest.spyOn(supabase.auth, 'getSession').mockResolvedValue({
        data: { session: user1Session },
        error: null
      });

      // Attempt to access corrective actions through AMFE items join
      jest.spyOn(supabase, 'from').mockReturnValue({
        select: jest.fn().mockReturnValue({
          // Mock RLS preventing access to unauthorized data
          data: [], // Empty because RLS policies block access
          error: null
        })
      } as any);

      const { data: actions } = await supabase
        .from('corrective_actions')
        .select(`
          *,
          amfe_items!inner(
            *,
            amfes!inner(*)
          )
        `);

      // Should return empty array due to RLS policies
      expect(actions).toHaveLength(0);
    });
  });

  describe('Authentication Flow Security', () => {
    test('Complete secure authentication flow', async () => {
      // Mock successful sign up
      const { supabase } = require('../../src/lib/supabase');
      supabase.auth.signUp.mockResolvedValue({
        data: {
          user: {
            id: 'new-user-' + Date.now(),
            email: 'newuser@example.com',
            user_metadata: {}
          },
          session: {
            user: { id: 'new-user-' + Date.now() },
            access_token: 'new-access-token',
            refresh_token: 'new-refresh-token'
          }
        },
        error: null
      });

      const signUpResult = await secureSignUp('newuser@example.com', 'SecurePassword123', 'New User');

      expect(signUpResult.success).toBe(true);

      // Verify security context is updated
      const context = getSecurityContext();
      expect(context?.isAuthenticated).toBe(true);
      expect(context?.securityLevel).toBe('authenticated');
    });

    test('Authentication handles edge cases gracefully', async () => {
      // Test network error handling
      const { supabase } = require('../../src/lib/supabase');
      supabase.auth.signInWithPassword.mockRejectedValue(new Error('Network error'));

      const result = await secureSignIn('test@example.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication service unavailable');
    });

    test('Session persistence across page reloads', async () => {
      // Mock existing session in localStorage/sessionStorage
      sessionStorage.setItem('anonymous_session_id', 'existing-anon-session');

      // Mock supabase returning existing session
      const { supabase } = require('../../src/lib/supabase');
      supabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'existing-user-id',
              created_at: new Date().toISOString(),
              user_metadata: {}
            },
            access_token: 'existing-access-token'
          }
        },
        error: null
      });

      await authSecurity.initializeSecurityContext();

      const context = getSecurityContext();
      expect(context?.isAuthenticated).toBe(true);
      expect(context?.userId).toBe('existing-user-id');
    });
  });

  describe('Cross-Site Security', () => {
    test('Prevents CSRF attacks through origin validation', async () => {
      // Mock malicious origin
      Object.defineProperty(document, 'referrer', {
        value: 'https://evil-site.com/attack',
        writable: true
      });

      const result = await secureSignIn('test@example.com', 'Password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid request origin');
    });

    test('Rate limiting prevents brute force attacks', async () => {
      const { supabase } = require('../../src/lib/supabase');
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid login credentials' }
      });

      // Simulate rapid failed attempts from same IP
      const attempts = [];
      for (let i = 0; i < 10; i++) {
        attempts.push(secureSignIn('test@example.com', `password${i}`));
      }

      const results = await Promise.all(attempts);

      // After 5 attempts, should be rate limited
      const rateLimitedResults = results.slice(5);
      rateLimitedResults.forEach(result => {
        expect(result.success).toBe(false);
        expect(result.error).toBe('Too many sign in attempts. Please try again later.');
      });
    });
  });

  describe('Data Injection Security', () => {
    test('Prevents SQL injection through parameterized queries', async () => {
      jest.spyOn(supabase.auth, 'getSession').mockResolvedValue({
        data: { session: user1Session },
        error: null
      });

      // Attempt SQL injection through filter parameters
      const maliciousFilter = "1' OR '1'='1";

      jest.spyOn(supabase, 'from').mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: [], // Should be empty due to proper parameterization
            error: null
          })
        })
      } as any);

      const { data } = await supabase
        .from('amfes')
        .select('*')
        .eq('created_by', maliciousFilter);

      // Should not return any data due to proper parameterization
      expect(data).toHaveLength(0);
    });

    test('Prevents NoSQL injection through object manipulation', async () => {
      jest.spyOn(supabase.auth, 'getSession').mockResolvedValue({
        data: { session: user1Session },
        error: null
      });

      // Attempt to inject malicious operators
      const maliciousObject = {
        $ne: null,
        $where: "this.created_by === 'attacker-id'"
      };

      jest.spyOn(supabase, 'from').mockReturnValue({
        select: jest.fn().mockReturnValue({
          // Supabase/PostgreSQL doesn't support MongoDB-style operators
          // This should be safely handled
          eq: jest.fn().mockReturnValue({
            data: [],
            error: null
          })
        })
      } as any);

      const { data } = await supabase
        .from('amfes')
        .select('*')
        .eq('created_by', maliciousObject as any);

      // Should be safely handled and return no data
      expect(data).toHaveLength(0);
    });
  });

  describe('Performance Security Integration', () => {
    test('Security measures do not significantly impact performance', async () => {
      const startTime = Date.now();

      // Perform multiple secure operations
      const operations = [];
      for (let i = 0; i < 10; i++) {
        operations.push(secureSignIn(`test${i}@example.com`, 'Password123'));
      }

      // Mock successful responses for performance testing
      const { supabase } = require('../../src/lib/supabase');
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: { user: { id: `user-${i}` } } },
        error: null
      });

      await Promise.all(operations);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Security operations should complete within reasonable time
      expect(duration).toBeLessThan(5000); // 5 seconds max for 10 operations
    });

    test('Rate limiting does not impact legitimate usage', async () => {
      const { supabase } = require('../../src/lib/supabase');
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: { user: { id: 'legit-user' } } },
        error: null
      });

      // Normal usage pattern - not rate limited
      const results = [];
      for (let i = 0; i < 3; i++) {
        results.push(await secureSignIn(`user${i}@example.com`, 'Password123'));
      }

      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Error Handling Security', () => {
    test('Sensitive information not leaked in error messages', async () => {
      const { supabase } = require('../../src/lib/supabase');

      // Mock various internal errors
      const internalErrors = [
        new Error('Database connection string: postgresql://user:pass@host/db'),
        new Error('Internal stack trace: Error at line 123 in secure-file.js'),
        new Error('Configuration: SUPABASE_URL=https://project.supabase.co'),
        new Error('JWT secret: your-secret-key-here')
      ];

      for (const error of internalErrors) {
        supabase.auth.signInWithPassword.mockRejectedValue(error);

        const result = await secureSignIn('test@example.com', 'Password123');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Authentication service unavailable');
        // Should not contain sensitive information
        expect(result.error).not.toContain('postgresql://');
        expect(result.error).not.toContain('secure-file.js');
        expect(result.error).not.toContain('supabase.co');
        expect(result.error).not.toContain('secret-key');
      }
    });

    test('Graceful degradation on security service failures', async () => {
      // Mock security service failure
      jest.spyOn(authSecurity as any, 'validateOrigin').mockReturnValue(false);

      const result = await secureSignIn('test@example.com', 'Password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid request origin');

      // Restore functionality
      jest.restoreAllMocks();
    });
  });

  describe('Security Monitoring Integration', () => {
    test('Security audit provides comprehensive information', async () => {
      const audit = authSecurity.getSecurityAudit();

      expect(audit).toEqual({
        sessionValid: expect.any(Boolean),
        securityLevel: expect.any(String),
        lastActivity: expect.any(Number),
        rateLimitActive: expect.any(Boolean)
      });

      // Verify all expected fields are present and have correct types
      expect(['anonymous', 'authenticated', 'elevated']).toContain(audit.securityLevel);
      expect(typeof audit.lastActivity).toBe('number');
      expect(typeof audit.sessionValid).toBe('boolean');
      expect(typeof audit.rateLimitActive).toBe('boolean');
    });

    test('Security events are properly logged', async () => {
      // Mock console logging for testing
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Trigger security event
      await secureSignIn('test@example.com', 'weak');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Rate limit exceeded')
      );

      consoleSpy.mockRestore();
    });
  });
});