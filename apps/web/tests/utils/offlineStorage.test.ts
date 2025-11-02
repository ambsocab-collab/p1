import { offlineStorage, canUseOfflineStorage, syncWhenOnline } from '../../src/utils/offlineStorage';
import { FailureMode } from '../../src/types/database';

// Mock IndexedDB
const mockDB = {
  close: jest.fn(),
  transaction: jest.fn(() => mockTransaction),
  objectStoreNames: {
    contains: jest.fn()
  }
};

const mockTransaction = {
  objectStore: jest.fn(() => mockStore),
  oncomplete: null as any,
  onerror: null as any
};

const mockStore = {
  clear: jest.fn(() => mockRequest),
  get: jest.fn(() => mockRequest),
  getAll: jest.fn(() => mockRequest),
  put: jest.fn(() => mockRequest),
  createIndex: jest.fn(),
  index: jest.fn()
};

const mockRequest = {
  result: null,
  onsuccess: null as any,
  onerror: null as any
};

const mockOpenRequest = {
  result: mockDB,
  onsuccess: null as any,
  onerror: null as any,
  onupgradeneeded: null as any
};

// Mock window.indexedDB
Object.defineProperty(window, 'indexedDB', {
  value: {
    open: jest.fn(() => mockOpenRequest)
  },
  writable: true,
  configurable: true
});

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  value: true,
  writable: true,
  configurable: true
});

describe('offlineStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('canUseOfflineStorage', () => {
    it('should return true when IndexedDB is supported', () => {
      expect(canUseOfflineStorage()).toBe(true);
    });

    it('should return false when IndexedDB is not supported', () => {
      // Temporarily remove IndexedDB
      const originalIndexedDB = window.indexedDB;
      delete (window as any).indexedDB;

      expect(canUseOfflineStorage()).toBe(false);

      // Restore IndexedDB
      window.indexedDB = originalIndexedDB;
    });
  });

  describe('init', () => {
    it('should initialize IndexedDB database', async () => {
      const initPromise = offlineStorage.init();

      // Simulate successful database opening
      setTimeout(() => {
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: mockOpenRequest } as any);
        }
      }, 0);

      await initPromise;

      expect(window.indexedDB.open).toHaveBeenCalledWith('amfeFailureModesDB', 1);
    });

    it('should create object store if it does not exist', async () => {
      mockDB.objectStoreNames.contains.mockReturnValue(false);

      const initPromise = offlineStorage.init();

      setTimeout(() => {
        if (mockOpenRequest.onupgradeneeded) {
          mockOpenRequest.onupgradeneeded({ target: mockOpenRequest } as any);
        }
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: mockOpenRequest } as any);
        }
      }, 0);

      await initPromise;

      expect(mockStore.createIndex).toHaveBeenCalledWith('category', 'category', { unique: false });
      expect(mockStore.createIndex).toHaveBeenCalledWith('mode', 'mode', { unique: false });
      expect(mockStore.createIndex).toHaveBeenCalledWith('tags', 'tags', { unique: false, multiEntry: true });
    });

    it('should reject on database error', async () => {
      const initPromise = offlineStorage.init();

      setTimeout(() => {
        if (mockOpenRequest.onerror) {
          mockOpenRequest.onerror({ target: mockOpenRequest } as any);
        }
      }, 0);

      await expect(initPromise).rejects.toThrow('Failed to open IndexedDB');
    });
  });

  describe('storeFailureModes', () => {
    const testModes: FailureMode[] = [
      {
        id: '1',
        category: 'Test Category',
        mode: 'Test Mode 1',
        common_causes: ['Cause 1'],
        severity_default: 5,
        tags: ['tag1', 'tag2'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        category: 'Test Category',
        mode: 'Test Mode 2',
        common_causes: ['Cause 2'],
        severity_default: 7,
        tags: ['tag3'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    it('should store failure modes in IndexedDB', async () => {
      // Mock successful clear and put operations
      let clearCallback: () => void;
      let putCallback: () => void;

      mockStore.clear.mockReturnValue({
        onsuccess: (cb: () => void) => { clearCallback = cb; },
        onerror: jest.fn()
      });

      mockStore.put.mockReturnValue({
        onsuccess: (cb: () => void) => { putCallback = cb; },
        onerror: jest.fn()
      });

      const storePromise = offlineStorage.storeFailureModes(testModes);

      // Simulate database initialization
      setTimeout(() => {
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: mockOpenRequest } as any);
        }
      }, 0);

      // Simulate clear operation success
      setTimeout(() => {
        if (clearCallback) clearCallback();
      }, 10);

      // Simulate put operations success
      setTimeout(() => {
        if (putCallback) putCallback();
      }, 20);

      await storePromise;

      expect(mockStore.clear).toHaveBeenCalled();
      expect(mockStore.put).toHaveBeenCalledTimes(testModes.length);
    });

    it('should handle empty array', async () => {
      const storePromise = offlineStorage.storeFailureModes([]);

      setTimeout(() => {
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: mockOpenRequest } as any);
        }
        if (mockStore.clear) {
          const clearOp = mockStore.clear();
          if (clearOp.onsuccess) {
            clearOp.onsuccess(() => {});
          }
        }
      }, 0);

      await storePromise;

      expect(mockStore.put).not.toHaveBeenCalled();
    });
  });

  describe('searchFailureModes', () => {
    const testModes: FailureMode[] = [
      {
        id: '1',
        category: 'Assembly',
        mode: 'Loose Connection',
        common_causes: ['Vibration'],
        severity_default: 6,
        tags: ['electrical', 'mechanical'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        category: 'Machining',
        mode: 'Tool Wear',
        common_causes: ['Excessive use'],
        severity_default: 5,
        tags: ['tool', 'wear'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    it('should return all failure modes when no params provided', async () => {
      mockRequest.result = testModes;

      const searchPromise = offlineStorage.searchFailureModes({});

      setTimeout(() => {
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: mockOpenRequest } as any);
        }
        if (mockStore.getAll) {
          const getAllOp = mockStore.getAll();
          if (getAllOp.onsuccess) {
            getAllOp.onsuccess({ target: { result: testModes } } as any);
          }
        }
      }, 0);

      const result = await searchPromise;

      expect(result).toEqual(testModes);
    });

    it('should filter by category', async () => {
      mockRequest.result = [testModes[0]];

      const searchPromise = offlineStorage.searchFailureModes({ category: 'Assembly' });

      setTimeout(() => {
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: mockOpenRequest } as any);
        }
        if (mockStore.getAll) {
          const getAllOp = mockStore.getAll();
          if (getAllOp.onsuccess) {
            getAllOp.onsuccess({ target: { result: testModes } } as any);
          }
        }
      }, 0);

      const result = await searchPromise;

      expect(result).toEqual([testModes[0]]);
    });

    it('should filter by search term', async () => {
      mockRequest.result = [testModes[1]];

      const searchPromise = offlineStorage.searchFailureModes({ search: 'tool' });

      setTimeout(() => {
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: mockOpenRequest } as any);
        }
        if (mockStore.getAll) {
          const getAllOp = mockStore.getAll();
          if (getAllOp.onsuccess) {
            getAllOp.onsuccess({ target: { result: testModes } } as any);
          }
        }
      }, 0);

      const result = await searchPromise;

      expect(result).toEqual([testModes[1]]);
    });

    it('should apply pagination', async () => {
      mockRequest.result = testModes.slice(0, 1);

      const searchPromise = offlineStorage.searchFailureModes({ limit: 1, offset: 0 });

      setTimeout(() => {
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: mockOpenRequest } as any);
        }
        if (mockStore.getAll) {
          const getAllOp = mockStore.getAll();
          if (getAllOp.onsuccess) {
            getAllOp.onsuccess({ target: { result: testModes } } as any);
          }
        }
      }, 0);

      const result = await searchPromise;

      expect(result).toEqual([testModes[0]]);
    });

    it('should sort results by category then mode', async () => {
      const unsortedModes: FailureMode[] = [
        { ...testModes[1], category: 'Machining', mode: 'Tool Wear' },
        { ...testModes[0], category: 'Assembly', mode: 'Loose Connection' },
        { ...testModes[1], category: 'Machining', mode: 'A Tool Wear' }
      ];

      mockRequest.result = unsortedModes;

      const searchPromise = offlineStorage.searchFailureModes({});

      setTimeout(() => {
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: mockOpenRequest } as any);
        }
        if (mockStore.getAll) {
          const getAllOp = mockStore.getAll();
          if (getAllOp.onsuccess) {
            getAllOp.onsuccess({ target: { result: unsortedModes } } as any);
          }
        }
      }, 0);

      const result = await searchPromise;

      // Should be sorted by category then mode
      expect(result[0].category).toBe('Assembly');
      expect(result[1].category).toBe('Machining');
      expect(result[2].category).toBe('Machining');
      expect(result[1].mode).toBe('A Tool Wear');
      expect(result[2].mode).toBe('Tool Wear');
    });
  });

  describe('getFailureModeCategories', () => {
    it('should return unique categories sorted alphabetically', async () => {
      const testModes: FailureMode[] = [
        { ...testModes[0] as any, category: 'Machining' },
        { ...testModes[1] as any, category: 'Assembly' },
        { ...testModes[0] as any, category: 'Assembly' },
        { ...testModes[1] as any, category: 'Welding' }
      ];

      mockRequest.result = testModes;

      const categoriesPromise = offlineStorage.getFailureModeCategories();

      setTimeout(() => {
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: mockOpenRequest } as any);
        }
        if (mockStore.getAll) {
          const getAllOp = mockStore.getAll();
          if (getAllOp.onsuccess) {
            getAllOp.onsuccess({ target: { result: testModes } } as any);
          }
        }
      }, 0);

      const categories = await categoriesPromise;

      expect(categories).toEqual(['Assembly', 'Machining', 'Welding']);
    });
  });

  describe('clearCache', () => {
    it('should clear all stored data', async () => {
      const clearPromise = offlineStorage.clearCache();

      setTimeout(() => {
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: mockOpenRequest } as any);
        }
        if (mockStore.clear) {
          const clearOp = mockStore.clear();
          if (clearOp.onsuccess) {
            clearOp.onsuccess({ target: { result: undefined } } as any);
          }
        }
      }, 0);

      await clearPromise;

      expect(mockStore.clear).toHaveBeenCalled();
    });
  });
});

describe('syncWhenOnline', () => {
  it('should execute callback immediately when online', async () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });

    const mockCallback = jest.fn().mockResolvedValue('synced');
    const syncPromise = syncWhenOnline(mockCallback);

    await syncPromise;

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should wait for online event when offline', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

    const mockCallback = jest.fn().mockResolvedValue('synced');
    const syncPromise = syncWhenOnline(mockCallback);

    // Should not have called yet
    expect(mockCallback).not.toHaveBeenCalled();

    // Simulate coming online
    setTimeout(() => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
      const onlineEvent = new Event('online');
      window.dispatchEvent(onlineEvent);
    }, 10);

    await syncPromise;

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should handle callback errors gracefully', async () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });

    const mockCallback = jest.fn().mockRejectedValue(new Error('Sync failed'));
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    const syncPromise = syncWhenOnline(mockCallback);

    await syncPromise;

    expect(mockCallback).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Failed to sync when coming online:', expect.any(Error));

    consoleSpy.mockRestore();
  });
});