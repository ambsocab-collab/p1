import { supabase } from './amfe';
import { FailureMode } from '../types/database';
import {
  failureModesRateLimiter,
  withRetry,
  isOnline,
  waitForOnline,
  isRetryableError
} from '../utils/apiUtils';
import {
  offlineStorage,
  canUseOfflineStorage,
  syncWhenOnline
} from '../utils/offlineStorage';

// Cache for frequently accessed failure modes
let failureModesCache: FailureMode[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export interface FailureModeSearchParams {
  search?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

/**
 * Search failure modes with text search and category filtering
 * Enhanced with rate limiting, retry logic, and offline support
 */
export const searchFailureModes = async (
  params: FailureModeSearchParams = {}
): Promise<FailureMode[]> => {
  const identifier = `search-${JSON.stringify(params)}`;

  // Check rate limiting
  if (!failureModesRateLimiter.isAllowed(identifier)) {
    const resetTime = failureModesRateLimiter.getResetTime(identifier);
    const remaining = failureModesRateLimiter.getRemainingRequests(identifier);

    throw new Error(`Rate limit exceeded. ${remaining} requests remaining. Resets at ${new Date(resetTime).toLocaleTimeString()}`);
  }

  try {
    // If offline and offline storage is available, use it
    if (!isOnline() && canUseOfflineStorage()) {
      console.log('Using offline storage for failure modes search');
      return await offlineStorage.searchFailureModes(params);
    }

    // Perform online search with retry logic
    const results = await withRetry(
      async () => {
        let query = supabase
          .from('failure_modes')
          .select('*')
          .order('category', { ascending: true })
          .order('mode', { ascending: true });

        // Apply category filter if provided
        if (params.category) {
          query = query.eq('category', params.category);
        }

        // Apply text search if provided
        if (params.search) {
          // Search across mode field and tags
          query = query.or(`mode.ilike.%${params.search}%,tags.cs.{${params.search}}`);
        }

        // Apply pagination
        if (params.limit) {
          query = query.limit(params.limit);
        }

        if (params.offset) {
          query = query.range(params.offset, params.offset + (params.limit || 20) - 1);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        // Store results in offline cache if available
        if (data && canUseOfflineStorage()) {
          try {
            await offlineStorage.storeFailureModes(data);
          } catch (offlineError) {
            console.warn('Failed to cache results offline:', offlineError);
          }
        }

        return data || [];
      },
      {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        onRetry: (attempt, error) => {
          console.warn(`Search retry attempt ${attempt} due to:`, error.message);
        }
      }
    );

    return results;
  } catch (error) {
    // If online search fails and we have offline storage, fall back to it
    if (!isOnline() && canUseOfflineStorage()) {
      try {
        console.log('Online search failed, falling back to offline storage');
        return await offlineStorage.searchFailureModes(params);
      } catch (offlineError) {
        console.error('Offline fallback also failed:', offlineError);
      }
    }

    // Handle rate limiting errors
    if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
      throw error;
    }

    // Handle retryable vs non-retryable errors
    if (isRetryableError(error)) {
      console.error('Search failed after retries:', error);
      throw new Error('Search temporarily unavailable. Please try again.');
    }

    console.error('Error in searchFailureModes:', error);
    throw error;
  }
};

/**
 * Get failure modes by category
 */
export const getFailureModesByCategory = async (category: string): Promise<FailureMode[]> => {
  try {
    // Check cache first
    if (isCacheValid()) {
      const cachedResults = failureModesCache?.filter(fm => fm.category === category);
      if (cachedResults) {
        return cachedResults;
      }
    }

    const { data, error } = await supabase
      .from('failure_modes')
      .select('*')
      .eq('category', category)
      .order('mode', { ascending: true });

    if (error) {
      console.error('Error fetching failure modes by category:', error);
      throw new Error('Failed to fetch failure modes by category');
    }

    return data || [];
  } catch (error) {
    console.error('Error in getFailureModesByCategory:', error);
    throw error;
  }
};

/**
 * Get all available failure mode categories
 */
export const getFailureModeCategories = async (): Promise<string[]> => {
  try {
    // Check cache first
    if (isCacheValid() && failureModesCache) {
      const categories = [...new Set(failureModesCache.map(fm => fm.category))];
      return categories.sort();
    }

    const { data, error } = await supabase
      .from('failure_modes')
      .select('category')
      .order('category', { ascending: true });

    if (error) {
      console.error('Error fetching failure mode categories:', error);
      throw new Error('Failed to fetch failure mode categories');
    }

    // Extract unique categories
    const categories = [...new Set((data || []).map((item: { category: string }) => item.category))];
    return categories.sort() as string[];
  } catch (error) {
    console.error('Error in getFailureModeCategories:', error);
    throw error;
  }
};

/**
 * Get a specific failure mode by ID
 */
export const getFailureModeById = async (id: string): Promise<FailureMode | null> => {
  try {
    // Check cache first
    if (isCacheValid() && failureModesCache) {
      const cachedResult = failureModesCache.find(fm => fm.id === id);
      if (cachedResult) {
        return cachedResult;
      }
    }

    const { data, error } = await supabase
      .from('failure_modes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      console.error('Error fetching failure mode by ID:', error);
      throw new Error('Failed to fetch failure mode');
    }

    return data;
  } catch (error) {
    console.error('Error in getFailureModeById:', error);
    throw error;
  }
};

/**
 * Get all failure modes (for caching)
 */
export const getAllFailureModes = async (): Promise<FailureMode[]> => {
  try {
    // Check cache first
    if (isCacheValid()) {
      return failureModesCache || [];
    }

    const { data, error } = await supabase
      .from('failure_modes')
      .select('*')
      .order('category', { ascending: true })
      .order('mode', { ascending: true });

    if (error) {
      console.error('Error fetching all failure modes:', error);
      throw new Error('Failed to fetch failure modes');
    }

    // Update cache
    failureModesCache = data || [];
    cacheTimestamp = Date.now();

    return data || [];
  } catch (error) {
    console.error('Error in getAllFailureModes:', error);
    throw error;
  }
};

/**
 * Get failure mode suggestions for autocomplete
 * Enhanced with retry logic and offline support
 */
export const getFailureModeSuggestions = async (query: string, limit: number = 10): Promise<FailureMode[]> => {
  try {
    if (!query.trim()) {
      // Return recent or popular failure modes if no query
      return searchFailureModes({ limit });
    }

    // Check rate limiting for autocomplete requests
    const identifier = `autocomplete-${query}`;
    if (!failureModesRateLimiter.isAllowed(identifier)) {
      // For autocomplete, we can be more lenient and try offline storage first
      if (canUseOfflineStorage()) {
        return await offlineStorage.searchFailureModes({
          search: query,
          limit
        });
      }
    }

    // Perform search with retry logic
    return await withRetry(
      async () => {
        const { data, error } = await supabase
          .from('failure_modes')
          .select('*')
          .or(`mode.ilike.%${query}%,tags.cs.{${query}}`)
          .order('mode', { ascending: true })
          .limit(limit);

        if (error) {
          throw error;
        }

        return data || [];
      },
      {
        maxAttempts: 2, // Fewer retries for autocomplete to maintain responsiveness
        baseDelay: 500,
        maxDelay: 5000,
        onRetry: (attempt, error) => {
          console.warn(`Autocomplete retry attempt ${attempt} for query "${query}":`, error.message);
        }
      }
    );
  } catch (error) {
    // Fallback to offline storage if available
    if (canUseOfflineStorage()) {
      try {
        console.log('Autocomplete falling back to offline storage');
        return await offlineStorage.searchFailureModes({
          search: query,
          limit
        });
      } catch (offlineError) {
        console.error('Offline autocomplete fallback failed:', offlineError);
      }
    }

    console.error('Error in getFailureModeSuggestions:', error);
    // Return empty array for autocomplete errors (non-critical)
    return [];
  }
};

/**
 * Get failure modes with tag filtering
 */
export const getFailureModesByTags = async (tags: string[]): Promise<FailureMode[]> => {
  try {
    if (!tags || tags.length === 0) {
      return [];
    }

    // Build query for tags overlap
    const tagQueries = tags.map(tag => `tags.cs.{${tag}}`).join(',');

    const { data, error } = await supabase
      .from('failure_modes')
      .select('*')
      .or(tagQueries)
      .order('category', { ascending: true })
      .order('mode', { ascending: true });

    if (error) {
      console.error('Error fetching failure modes by tags:', error);
      throw new Error('Failed to fetch failure modes by tags');
    }

    return data || [];
  } catch (error) {
    console.error('Error in getFailureModesByTags:', error);
    throw error;
  }
};

/**
 * Add a custom failure mode (for user-specific library)
 */
export const addCustomFailureMode = async (
  failureMode: Omit<FailureMode, 'id' | 'created_at' | 'updated_at'>
): Promise<FailureMode> => {
  try {
    // Add a custom tag to distinguish user-added failure modes
    const failureModeWithCustomTag = {
      ...failureMode,
      tags: [...failureMode.tags, 'Custom']
    };

    const { data, error } = await supabase
      .from('failure_modes')
      .insert(failureModeWithCustomTag)
      .select()
      .single();

    if (error) {
      console.error('Error adding custom failure mode:', error);
      throw new Error('Failed to add custom failure mode');
    }

    // Invalidate cache
    invalidateCache();

    return data;
  } catch (error) {
    console.error('Error in addCustomFailureMode:', error);
    throw error;
  }
};

/**
 * Check if cache is valid (not expired)
 */
const isCacheValid = (): boolean => {
  return failureModesCache !== null &&
         Date.now() - cacheTimestamp < CACHE_TTL;
};

/**
 * Invalidate cache (call after modifications)
 */
export const invalidateCache = (): void => {
  failureModesCache = null;
  cacheTimestamp = 0;
};

/**
 * Preload common failure modes for performance
 * Enhanced with offline storage initialization
 */
export const preloadFailureModes = async (): Promise<void> => {
  try {
    // Initialize offline storage if available
    if (canUseOfflineStorage()) {
      await offlineStorage.init();
    }

    if (!isCacheValid()) {
      await getAllFailureModes();
    }

    // Sync offline storage when coming online
    if (canUseOfflineStorage()) {
      syncWhenOnline(async () => {
        const modes = await getAllFailureModes();
        await offlineStorage.storeFailureModes(modes);
      });
    }
  } catch (error) {
    console.warn('Failed to preload failure modes:', error);
  }
};

/**
 * Get failure mode statistics
 */
export const getFailureModeStats = async (): Promise<{
  totalModes: number;
  totalCategories: number;
  modesByCategory: Record<string, number>;
}> => {
  try {
    const modes = await getAllFailureModes();
    const categories = await getFailureModeCategories();

    const modesByCategory: Record<string, number> = {};
    modes.forEach(mode => {
      modesByCategory[mode.category] = (modesByCategory[mode.category] || 0) + 1;
    });

    return {
      totalModes: modes.length,
      totalCategories: categories.length,
      modesByCategory
    };
  } catch (error) {
    console.error('Error getting failure mode stats:', error);
    throw error;
  }
};

/**
 * Check if the service is operating in offline mode
 */
export const isOfflineMode = (): boolean => {
  return !isOnline() && canUseOfflineStorage();
};

/**
 * Get offline storage information
 */
export const getOfflineInfo = async (): Promise<{
  supported: boolean;
  enabled: boolean;
  cachedCount?: number;
  lastSync?: Date;
}> => {
  const supported = canUseOfflineStorage();
  const enabled = supported && !isOnline();

  if (!supported) {
    return { supported: false, enabled: false };
  }

  try {
    await offlineStorage.init();
    const cachedModes = await offlineStorage.getFailureModes();

    return {
      supported: true,
      enabled,
      cachedCount: cachedModes.length,
      lastSync: new Date() // This could be stored in localStorage for better accuracy
    };
  } catch (error) {
    console.warn('Failed to get offline info:', error);
    return { supported: true, enabled: false };
  }
};