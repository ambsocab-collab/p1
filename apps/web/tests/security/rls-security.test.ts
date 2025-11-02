/**
 * Comprehensive RLS Security Tests
 * Tests Row Level Security policies to prevent data leakage between users
 */

import { supabase } from '../../src/lib/supabase';
import { signUp, signIn, signOut, getCurrentUser } from '../../src/lib/auth';

describe('Row Level Security Tests', () => {
  let user1: any;
  let user2: any;
  let user1Session: any;
  let user2Session: any;

  beforeAll(async () => {
    // Create test users
    const user1Email = `test-user-1-${Date.now()}@example.com`;
    const user2Email = `test-user-2-${Date.now()}@example.com`;

    const user1Result = await signUp(user1Email, 'test-password-123', 'Test User 1');
    const user2Result = await signUp(user2Email, 'test-password-456', 'Test User 2');

    if (user1Result.data.user) user1 = user1Result.data.user;
    if (user2Result.data.user) user2 = user2Result.data.user;

    // Sign in both users
    const user1SignIn = await signIn(user1Email, 'test-password-123');
    const user2SignIn = await signIn(user2Email, 'test-password-456');

    if (user1SignIn.data.session) user1Session = user1SignIn.data.session;
    if (user2SignIn.data.session) user2Session = user2SignIn.data.session;
  });

  afterAll(async () => {
    // Cleanup test data
    if (user1Session) {
      supabase.auth.setSession(user1Session.access_token, user1Session.refresh_token);
      await supabase.from('amfes').delete().eq('created_by', user1.id);
      await supabase.from('user_profiles').delete().eq('id', user1.id);
    }

    if (user2Session) {
      supabase.auth.setSession(user2Session.access_token, user2Session.refresh_token);
      await supabase.from('amfes').delete().eq('created_by', user2.id);
      await supabase.from('user_profiles').delete().eq('id', user2.id);
    }

    await signOut();
  });

  describe('User Data Isolation', () => {
    let user1AmfeId: string;
    let user2AmfeId: string;

    beforeEach(async () => {
      // Sign in as user1 and create test data
      supabase.auth.setSession(user1Session.access_token, user1Session.refresh_token);
      const user1Amfe = await supabase
        .from('amfes')
        .insert({
          name: 'User 1 Test AMFE',
          type: 'DFMEA',
          status: 'draft'
        })
        .select()
        .single();

      user1AmfeId = user1Amfe.data?.id;

      // Sign in as user2 and create test data
      supabase.auth.setSession(user2Session.access_token, user2Session.refresh_token);
      const user2Amfe = await supabase
        .from('amfes')
        .insert({
          name: 'User 2 Test AMFE',
          type: 'PFMEA',
          status: 'draft'
        })
        .select()
        .single();

      user2AmfeId = user2Amfe.data?.id;
    });

    afterEach(async () => {
      // Cleanup test AMFEs
      supabase.auth.setSession(user1Session.access_token, user1Session.refresh_token);
      await supabase.from('amfes').delete().eq('id', user1AmfeId);

      supabase.auth.setSession(user2Session.access_token, user2Session.refresh_token);
      await supabase.from('amfes').delete().eq('id', user2AmfeId);
    });

    test('User1 cannot access User2 AMFEs', async () => {
      supabase.auth.setSession(user1Session.access_token, user1Session.refresh_token);

      const { data, error } = await supabase
        .from('amfes')
        .select('*')
        .eq('id', user2AmfeId);

      expect(error).toBeDefined();
      expect(error?.code).toBe('PGRST116'); // Not found error
      expect(data).toHaveLength(0);
    });

    test('User2 cannot access User1 AMFEs', async () => {
      supabase.auth.setSession(user2Session.access_token, user2Session.refresh_token);

      const { data, error } = await supabase
        .from('amfes')
        .select('*')
        .eq('id', user1AmfeId);

      expect(error).toBeDefined();
      expect(error?.code).toBe('PGRST116');
      expect(data).toHaveLength(0);
    });

    test('User can only see their own AMFEs', async () => {
      supabase.auth.setSession(user1Session.access_token, user1Session.refresh_token);

      const { data, error } = await supabase
        .from('amfes')
        .select('*');

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(data[0].id).toBe(user1AmfeId);
      expect(data[0].created_by).toBe(user1.id);
    });
  });

  describe('Cascading Policy Security', () => {
    let user1AmfeId: string;
    let user1ItemId: string;
    let user2AmfeId: string;

    beforeEach(async () => {
      // Create test data for user1 with related items
      supabase.auth.setSession(user1Session.access_token, user1Session.refresh_token);

      const amfeResult = await supabase
        .from('amfes')
        .insert({
          name: 'User 1 AMFE with Items',
          type: 'DFMEA',
          status: 'draft'
        })
        .select()
        .single();

      user1AmfeId = amfeResult.data?.id;

      const itemResult = await supabase
        .from('amfe_items')
        .insert({
          amfe_id: user1AmfeId,
          function: 'Test Function',
          failure_mode: 'Test Failure',
          severity: 5,
          occurrence: 3,
          detection: 2
        })
        .select()
        .single();

      user1ItemId = itemResult.data?.id;

      // Create AMFE for user2 (no items)
      supabase.auth.setSession(user2Session.access_token, user2Session.refresh_token);
      const user2AmfeResult = await supabase
        .from('amfes')
        .insert({
          name: 'User 2 AMFE',
          type: 'PFMEA',
          status: 'draft'
        })
        .select()
        .single();

      user2AmfeId = user2AmfeResult.data?.id;
    });

    afterEach(async () => {
      // Cleanup
      supabase.auth.setSession(user1Session.access_token, user1Session.refresh_token);
      await supabase.from('corrective_actions').delete().eq('amfe_item_id', user1ItemId);
      await supabase.from('evidence').delete().eq('corrective_action_id', 'any');
      await supabase.from('amfe_items').delete().eq('id', user1ItemId);
      await supabase.from('amfes').delete().eq('id', user1AmfeId);

      supabase.auth.setSession(user2Session.access_token, user2Session.refresh_token);
      await supabase.from('amfes').delete().eq('id', user2AmfeId);
    });

    test('User2 cannot access User1 AMFE items through cascading policies', async () => {
      supabase.auth.setSession(user2Session.access_token, user2Session.refresh_token);

      const { data, error } = await supabase
        .from('amfe_items')
        .select('*')
        .eq('id', user1ItemId);

      expect(error).toBeDefined();
      expect(error?.code).toBe('PGRST116');
      expect(data).toHaveLength(0);
    });

    test('User1 can access their own AMFE items', async () => {
      supabase.auth.setSession(user1Session.access_token, user1Session.refresh_token);

      const { data, error } = await supabase
        .from('amfe_items')
        .select('*')
        .eq('id', user1ItemId);

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(data[0].id).toBe(user1ItemId);
    });
  });

  describe('Anonymous User Security', () => {
    let anonymousAmfeId: string;
    let authenticatedAmfeId: string;

    beforeEach(async () => {
      // Create anonymous data (no auth session)
      await signOut();

      const anonymousResult = await supabase
        .from('amfes')
        .insert({
          name: 'Anonymous Test AMFE',
          type: 'DFMEA',
          status: 'draft'
        })
        .select()
        .single();

      anonymousAmfeId = anonymousResult.data?.id;

      // Create authenticated data
      supabase.auth.setSession(user1Session.access_token, user1Session.refresh_token);
      const authenticatedResult = await supabase
        .from('amfes')
        .insert({
          name: 'Authenticated Test AMFE',
          type: 'PFMEA',
          status: 'draft'
        })
        .select()
        .single();

      authenticatedAmfeId = authenticatedResult.data?.id;
    });

    afterEach(async () => {
      // Cleanup
      await supabase.from('amfes').delete().eq('id', anonymousAmfeId);

      supabase.auth.setSession(user1Session.access_token, user1Session.refresh_token);
      await supabase.from('amfes').delete().eq('id', authenticatedAmfeId);
    });

    test('Anonymous users cannot access authenticated user data', async () => {
      await signOut();

      const { data, error } = await supabase
        .from('amfes')
        .select('*')
        .eq('id', authenticatedAmfeId);

      expect(error).toBeDefined();
      expect(error?.code).toBe('PGRST116');
      expect(data).toHaveLength(0);
    });

    test('Authenticated users cannot access anonymous data', async () => {
      supabase.auth.setSession(user1Session.access_token, user1Session.refresh_token);

      const { data, error } = await supabase
        .from('amfes')
        .select('*')
        .eq('id', anonymousAmfeId);

      expect(error).toBeDefined();
      expect(error?.code).toBe('PGRST116');
      expect(data).toHaveLength(0);
    });

    test('Anonymous users can only see their own data', async () => {
      await signOut();

      const { data, error } = await supabase
        .from('amfes')
        .select('*');

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(data[0].id).toBe(anonymousAmfeId);
      expect(data[0].created_by).toBeNull();
    });
  });

  describe('Edge Cases and Security Vulnerabilities', () => {
    test('SQL injection attempts are blocked', async () => {
      supabase.auth.setSession(user1Session.access_token, user1Session.refresh_token);

      // Attempt SQL injection through filter
      const { data, error } = await supabase
        .from('amfes')
        .select('*')
        .eq('created_by', "1' OR '1'='1");

      expect(error).toBeNull();
      expect(data).toHaveLength(0); // Should not return any data due to proper parameterization
    });

    test('Direct table access bypass attempts fail', async () => {
      supabase.auth.setSession(user1Session.access_token, user1Session.refresh_token);

      // Try to access data without proper user context
      const { data, error } = await supabase
        .from('amfes')
        .select('*')
        .neq('created_by', user1.id);

      expect(error).toBeNull();
      expect(data).toHaveLength(0); // Should only return user's own data
    });

    test('Policy circumvention through RPC functions fails', async () => {
      supabase.auth.setSession(user1Session.access_token, user1Session.refresh_token);

      // If there are any custom RPC functions, test they respect RLS
      try {
        const { data, error } = await supabase.rpc('get_all_amfes');

        // If function exists, it should only return user's own data
        if (data) {
          expect(Array.isArray(data)).toBe(true);
          data.forEach((item: any) => {
            expect(item.created_by).toBe(user1.id);
          });
        }
      } catch (err) {
        // Function doesn't exist, which is fine
        expect(true).toBe(true);
      }
    });
  });

  describe('Performance and Scalability', () => {
    test('RLS policies do not cause performance degradation with reasonable data volumes', async () => {
      const startTime = Date.now();

      supabase.auth.setSession(user1Session.access_token, user1Session.refresh_token);

      // Create multiple test records
      const insertPromises = [];
      for (let i = 0; i < 50; i++) {
        insertPromises.push(
          supabase
            .from('amfes')
            .insert({
              name: `Performance Test AMFE ${i}`,
              type: 'DFMEA',
              status: 'draft'
            })
        );
      }

      await Promise.all(insertPromises);

      // Test query performance
      const queryStart = Date.now();
      const { data, error } = await supabase
        .from('amfes')
        .select('*');

      const queryTime = Date.now() - queryStart;

      expect(error).toBeNull();
      expect(queryTime).toBeLessThan(1000); // Should complete within 1 second

      // Cleanup
      await supabase.from('amfes').delete().like('name', 'Performance Test AMFE%');

      const totalTime = Date.now() - startTime;
      console.log(`RLS performance test completed in ${totalTime}ms`);
    });
  });
});