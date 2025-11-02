import { FailureMode } from '../types/database';

// IndexedDB setup for offline failure modes storage
const DB_NAME = 'amfeFailureModesDB';
const DB_VERSION = 1;
const STORE_NAME = 'failureModes';

class OfflineStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('category', 'category', { unique: false });
          store.createIndex('mode', 'mode', { unique: false });
          store.createIndex('tags', 'tags', { unique: false, multiEntry: true });
        }
      };
    });
  }

  async storeFailureModes(modes: FailureMode[]): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      // Clear existing data
      const clearRequest = store.clear();

      clearRequest.onsuccess = () => {
        // Add new data
        let completed = 0;
        const total = modes.length;

        if (total === 0) {
          resolve();
          return;
        }

        modes.forEach((mode) => {
          const request = store.put(mode);

          request.onsuccess = () => {
            completed++;
            if (completed === total) {
              resolve();
            }
          };

          request.onerror = () => {
            reject(new Error('Failed to store failure mode'));
          };
        });
      };

      clearRequest.onerror = () => {
        reject(new Error('Failed to clear existing data'));
      };
    });
  }

  async getFailureModes(): Promise<FailureMode[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error('Failed to retrieve failure modes'));
      };
    });
  }

  async searchFailureModes(params: {
    search?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<FailureMode[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        let results = request.result || [];

        // Apply category filter
        if (params.category) {
          results = results.filter(mode => mode.category === params.category);
        }

        // Apply text search
        if (params.search) {
          const searchLower = params.search.toLowerCase();
          results = results.filter(mode =>
            mode.mode.toLowerCase().includes(searchLower) ||
            mode.tags.some(tag => tag.toLowerCase().includes(searchLower))
          );
        }

        // Sort by category then mode
        results.sort((a, b) => {
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
          }
          return a.mode.localeCompare(b.mode);
        });

        // Apply pagination
        if (params.offset || params.limit) {
          const start = params.offset || 0;
          const end = params.limit ? start + params.limit : undefined;
          results = results.slice(start, end);
        }

        resolve(results);
      };

      request.onerror = () => {
        reject(new Error('Failed to search failure modes'));
      };
    });
  }

  async getFailureModeCategories(): Promise<string[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const modes = request.result || [];
        const categories = [...new Set(modes.map(mode => mode.category))];
        resolve(categories.sort());
      };

      request.onerror = () => {
        reject(new Error('Failed to get categories'));
      };
    });
  }

  async clearCache(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to clear cache'));
    });
  }

  // Check if IndexedDB is available
  static isSupported(): boolean {
    return 'indexedDB' in window;
  }
}

// Create singleton instance
export const offlineStorage = new OfflineStorage();

// Utility functions
export const canUseOfflineStorage = (): boolean => {
  return OfflineStorage.isSupported();
};

export const syncWhenOnline = async (onlineCallback: () => Promise<void>): Promise<void> => {
  if (navigator.onLine) {
    await onlineCallback();
  } else {
    // Wait for connection to be restored
    await new Promise<void>((resolve) => {
      const handleOnline = async () => {
        window.removeEventListener('online', handleOnline);
        try {
          await onlineCallback();
        } catch (error) {
          console.warn('Failed to sync when coming online:', error);
        }
        resolve();
      };
      window.addEventListener('online', handleOnline);
    });
  }
};