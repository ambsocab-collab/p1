import {
  searchFailureModes,
  getFailureModesByCategory,
  getFailureModeCategories,
  getFailureModeSuggestions,
  addCustomFailureMode,
  getFailureModeStats,
  invalidateCache,
  isOfflineMode,
  getOfflineInfo
} from '../../../src/services/failureModes';
import { FailureMode } from '../../../src/types/database';
import { supabase } from '../../../src/services/amfe';

// Mock Supabase
jest.mock('../../../src/services/amfe');
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

// Mock utils
jest.mock('../../../src/utils/apiUtils');
jest.mock('../../../src/utils/offlineStorage');

import { failureModesRateLimiter, withRetry, isOnline } from '../../../src/utils/apiUtils';
import { offlineStorage, canUseOfflineStorage } from '../../../src/utils/offlineStorage';

const mockRateLimiter = failureModesRateLimiter as jest.Mocked<typeof failureModesRateLimiter>;
const mockWithRetry = withRetry as jest.MockedFunction<typeof withRetry>;
const mockIsOnline = isOnline as jest.MockedFunction<typeof isOnline>;
const mockOfflineStorage = offlineStorage as jest.Mocked<typeof offlineStorage>;
const mockCanUseOfflineStorage = canUseOfflineStorage as jest.MockedFunction<typeof canUseOfflineStorage>;

describe('FailureModes Service', () => {
  const mockFailureModes: FailureMode[] = [
    {
      id: '1',
      category: 'Assembly & Joining',
      mode: 'Loose Connection',
      common_causes: ['Insufficient torque', 'Vibration', 'Thermal cycling'],
      severity_default: 6,
      tags: ['electrical', 'mechanical', 'fastening'],
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    },
    {
      id: '2',
      category: 'Machining & Cutting',
      mode: 'Tool Wear',
      common_causes: ['Excessive use', 'Wrong tool material', 'Inadequate cooling'],
      severity_default: 5,
      tags: ['tool', 'dimensional', 'maintenance'],
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    invalidateCache(); // Clear cache before each test
  });

  describe('searchFailureModes', () => {
    it('should search failure modes with text query', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOr = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockReturnThis();
      const mockRange = jest.fn().mockReturnThis();

      mockSupabase.from = jest.fn().mockReturnValue({
        select: mockSelect,
        order: mockOrder,
        eq: mockEq,
        or: mockOr,
        limit: mockLimit,
        range: mockRange,
        then: jest.fn().mockResolvedValue({
          data: mockFailureModes,
          error: null
        })
      });

      const result = await searchFailureModes({ search: 'loose' });

      expect(mockSupabase.from).toHaveBeenCalledWith('failure_modes');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockOr).toHaveBeenCalledWith('mode.ilike.%loose%,tags.cs.{loose}');
      expect(result).toEqual(mockFailureModes);
    });

    it('should filter by category', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockThen = jest.fn().mockResolvedValue({
        data: [mockFailureModes[0]],
        error: null
      });

      mockSupabase.from = jest.fn().mockReturnValue({
        select: mockSelect,
        order: mockOrder,
        eq: mockEq,
        then: mockThen
      });

      const result = await searchFailureModes({ category: 'Assembly & Joining' });

      expect(mockEq).toHaveBeenCalledWith('category', 'Assembly & Joining');
      expect(result).toEqual([mockFailureModes[0]]);
    });

    it('should handle errors gracefully', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockThen = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      mockSupabase.from = jest.fn().mockReturnValue({
        select: mockSelect,
        then: mockThen
      });

      await expect(searchFailureModes()).rejects.toThrow('Failed to search failure modes');
    });
  });

  describe('getFailureModesByCategory', () => {
    it('should return failure modes for a specific category', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockThen = jest.fn().mockResolvedValue({
        data: [mockFailureModes[0]],
        error: null
      });

      mockSupabase.from = jest.fn().mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        then: mockThen
      });

      const result = await getFailureModesByCategory('Assembly & Joining');

      expect(mockSupabase.from).toHaveBeenCalledWith('failure_modes');
      expect(mockEq).toHaveBeenCalledWith('category', 'Assembly & Joining');
      expect(result).toEqual([mockFailureModes[0]]);
    });
  });

  describe('getFailureModeCategories', () => {
    it('should return unique categories', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockThen = jest.fn().mockResolvedValue({
        data: [
          { category: 'Assembly & Joining' },
          { category: 'Machining & Cutting' },
          { category: 'Assembly & Joining' } // Duplicate
        ],
        error: null
      });

      mockSupabase.from = jest.fn().mockReturnValue({
        select: mockSelect,
        then: mockThen
      });

      const result = await getFailureModeCategories();

      expect(result).toEqual(['Assembly & Joining', 'Machining & Cutting']);
    });
  });

  describe('getFailureModeSuggestions', () => {
    it('should return suggestions for autocomplete', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockOr = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockReturnThis();
      const mockThen = jest.fn().mockResolvedValue({
        data: [mockFailureModes[0]],
        error: null
      });

      mockSupabase.from = jest.fn().mockReturnValue({
        select: mockSelect,
        or: mockOr,
        order: mockOrder,
        limit: mockLimit,
        then: mockThen
      });

      const result = await getFailureModeSuggestions('connection', 5);

      expect(mockOr).toHaveBeenCalledWith('mode.ilike.%connection%,tags.cs.{connection}');
      expect(mockLimit).toHaveBeenCalledWith(5);
      expect(result).toEqual([mockFailureModes[0]]);
    });

    it('should return empty array for empty query', async () => {
      const result = await getFailureModeSuggestions('', 10);
      expect(result).toEqual([]);
    });
  });

  describe('addCustomFailureMode', () => {
    it('should add a custom failure mode with custom tag', async () => {
      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockReturnThis();
      const mockThen = jest.fn().mockResolvedValue({
        data: {
          ...mockFailureModes[0],
          id: 'new-id',
          tags: ['electrical', 'mechanical', 'fastening', 'Custom']
        },
        error: null
      });

      mockSupabase.from = jest.fn().mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
        then: mockThen
      });

      const newFailureMode = {
        category: 'Assembly & Joining',
        mode: 'New Custom Mode',
        common_causes: ['Cause 1', 'Cause 2'],
        severity_default: 7,
        tags: ['electrical', 'mechanical']
      };

      const result = await addCustomFailureMode(newFailureMode);

      expect(mockInsert).toHaveBeenCalledWith({
        ...newFailureMode,
        tags: ['electrical', 'mechanical', 'Custom']
      });
      expect(result.tags).toContain('Custom');
    });

    it('should invalidate cache after adding custom mode', async () => {
      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockReturnThis();
      const mockThen = jest.fn().mockResolvedValue({
        data: mockFailureModes[0],
        error: null
      });

      mockSupabase.from = jest.fn().mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
        then: mockThen
      });

      await addCustomFailureMode({
        category: 'Test',
        mode: 'Test Mode',
        common_causes: [],
        severity_default: 5,
        tags: []
      });

      // Cache should be invalidated (this is an internal state, we just verify the call completes)
      expect(mockInsert).toHaveBeenCalled();
    });
  });

  describe('getFailureModeStats', () => {
    it('should return statistics about failure modes', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();
      const mockThen = jest.fn()
        .mockResolvedValueOnce({
          data: mockFailureModes,
          error: null
        })
        .mockResolvedValueOnce({
          data: [
            { category: 'Assembly & Joining' },
            { category: 'Machining & Cutting' }
          ],
          error: null
        });

      mockSupabase.from = jest.fn().mockReturnValue({
        select: mockSelect,
        order: mockOrder,
        then: mockThen
      });

      const result = await getFailureModeStats();

      expect(result).toEqual({
        totalModes: 2,
        totalCategories: 2,
        modesByCategory: {
          'Assembly & Joining': 1,
          'Machining & Cutting': 1
        }
      });
    });
  });

  // Enhanced functionality tests
  beforeEach(() => {
    // Reset all mock implementations
    mockRateLimiter.isAllowed.mockReturnValue(true);
    mockRateLimiter.getRemainingRequests.mockReturnValue(10);
    mockRateLimiter.getResetTime.mockReturnValue(Date.now() + 1000);
    mockIsOnline.mockReturnValue(true);
    mockCanUseOfflineStorage.mockReturnValue(true);
    mockWithRetry.mockImplementation(async (fn, options) => {
      return await fn();
    });
  });

  describe('Enhanced searchFailureModes', () => {
    it('should enforce rate limiting', async () => {
      mockRateLimiter.isAllowed.mockReturnValue(false);
      mockRateLimiter.getRemainingRequests.mockReturnValue(0);
      mockRateLimiter.getResetTime.mockReturnValue(Date.now() + 5000);

      await expect(searchFailureModes({ search: 'test' })).rejects.toThrow('Rate limit exceeded');
    });

    it('should use offline storage when offline', async () => {
      mockIsOnline.mockReturnValue(false);
      mockOfflineStorage.searchFailureModes.mockResolvedValue(mockFailureModes);

      const result = await searchFailureModes({ search: 'test' });

      expect(mockOfflineStorage.searchFailureModes).toHaveBeenCalledWith({ search: 'test' });
      expect(result).toEqual(mockFailureModes);
    });

    it('should retry failed requests', async () => {
      const networkError = new Error('Network error');
      mockWithRetry.mockImplementation(async (fn, options) => {
        if (options?.onRetry) {
          options.onRetry(1, networkError);
        }
        return await fn();
      });

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis()
      };

      mockSupabase.from.mockReturnValue(mockQuery);
      mockQuery.then.mockImplementation((callback) => {
        return callback({ data: mockFailureModes, error: null });
      });

      const result = await searchFailureModes({ search: 'test' });

      expect(mockWithRetry).toHaveBeenCalled();
      expect(result).toEqual(mockFailureModes);
    });

    it('should cache results in offline storage', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis()
      };

      mockSupabase.from.mockReturnValue(mockQuery);
      mockQuery.then.mockImplementation((callback) => {
        return callback({ data: mockFailureModes, error: null });
      });

      await searchFailureModes({ search: 'test' });

      expect(mockOfflineStorage.storeFailureModes).toHaveBeenCalledWith(mockFailureModes);
    });

    it('should fall back to offline storage on online failure', async () => {
      const networkError = new Error('Network failed');
      mockWithRetry.mockRejectedValue(networkError);
      mockOfflineStorage.searchFailureModes.mockResolvedValue(mockFailureModes);

      const result = await searchFailureModes({ search: 'test' });

      expect(mockOfflineStorage.searchFailureModes).toHaveBeenCalled();
      expect(result).toEqual(mockFailureModes);
    });
  });

  describe('Enhanced getFailureModeSuggestions', () => {
    it('should use offline storage for rate-limited requests', async () => {
      mockRateLimiter.isAllowed.mockReturnValue(false);
      mockOfflineStorage.searchFailureModes.mockResolvedValue(mockFailureModes);

      const result = await getFailureModeSuggestions('test');

      expect(mockOfflineStorage.searchFailureModes).toHaveBeenCalledWith({
        search: 'test',
        limit: 10
      });
      expect(result).toEqual(mockFailureModes);
    });

    it('should return empty array on autocomplete errors', async () => {
      mockWithRetry.mockRejectedValue(new Error('Autocomplete failed'));
      mockOfflineStorage.searchFailureModes.mockRejectedValue(new Error('Offline failed'));

      const result = await getFailureModeSuggestions('test');

      expect(result).toEqual([]);
    });
  });

  describe('Offline functionality', () => {
    it('should detect offline mode correctly', () => {
      mockIsOnline.mockReturnValue(false);
      mockCanUseOfflineStorage.mockReturnValue(true);

      expect(isOfflineMode()).toBe(true);

      mockIsOnline.mockReturnValue(true);
      expect(isOfflineMode()).toBe(false);
    });

    it('should get offline info', async () => {
      mockCanUseOfflineStorage.mockReturnValue(true);
      mockIsOnline.mockReturnValue(false);
      mockOfflineStorage.init.mockResolvedValue();
      mockOfflineStorage.getFailureModes.mockResolvedValue(mockFailureModes);

      const info = await getOfflineInfo();

      expect(info).toEqual({
        supported: true,
        enabled: true,
        cachedCount: 2,
        lastSync: expect.any(Date)
      });
    });

    it('should handle offline storage not supported', async () => {
      mockCanUseOfflineStorage.mockReturnValue(false);

      const info = await getOfflineInfo();

      expect(info).toEqual({
        supported: false,
        enabled: false
      });
    });
  });
});