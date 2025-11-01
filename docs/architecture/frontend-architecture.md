# Frontend Architecture

The frontend architecture is designed for manufacturing engineers who need Excel-like familiarity with modern web capabilities. Component organization prioritizes performance and accessibility while maintaining simplicity.

## Component Architecture

### Component Organization

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Headless UI based components
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   └── Form.tsx
│   ├── amfe/            # AMFE-specific components
│   │   ├── AMFEEditor.tsx
│   │   ├── AMFERow.tsx
│   │   ├── NPRCalculator.tsx
│   │   └── RiskIndicator.tsx
│   ├── actions/         # Action management components
│   │   ├── ActionCard.tsx
│   │   ├── ActionForm.tsx
│   │   ├── StatusBadge.tsx
│   │   └── EvidenceUpload.tsx
│   └── dashboard/       # Dashboard components
│       ├── AMFEList.tsx
│       ├── MetricsCard.tsx
│       └── Chart.tsx
├── pages/               # Route-level components
│   ├── Dashboard.tsx
│   ├── AMFEEdit.tsx
│   ├── Actions.tsx
│   └── Settings.tsx
├── hooks/               # Custom React hooks
│   ├── useAMFE.ts
│   ├── useActions.ts
│   ├── useSync.ts
│   └── useOffline.ts
├── services/            # API and business logic
│   ├── api.ts
│   ├── sync.ts
│   ├── storage.ts
│   └── export.ts
├── stores/              # State management
│   ├── amfeStore.ts
│   ├── actionStore.ts
│   └── userStore.ts
├── utils/               # Utility functions
│   ├── calculations.ts
│   ├── validations.ts
│   └── formatters.ts
└── types/               # Shared TypeScript types
    ├── amfe.ts
    ├── action.ts
    └── api.ts
```

### Component Template

```typescript
// components/amfe/AMFERow.tsx
import React, { useState, useCallback } from 'react';
import { useAMFEStore } from '@/stores/amfeStore';
import { AMFEItem } from '@/types/amfe';
import { calculateNPR, validateRating } from '@/utils/calculations';

interface AMFERowProps {
  item: AMFEItem;
  onChange: (item: AMFEItem) => void;
  readonly?: boolean;
}

export const AMFERow: React.FC<AMFERowProps> = ({
  item,
  onChange,
  readonly = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const updateItem = useAMFEStore(state => state.updateItem);

  const handleCellEdit = useCallback((
    field: keyof AMFEItem,
    value: any
  ) => {
    if (readonly) return;

    // Validate ratings
    if (['severity', 'occurrence', 'detection'].includes(field)) {
      if (!validateRating(value)) return;
    }

    const updatedItem = {
      ...item,
      [field]: value,
      // Auto-calculate NPR if ratings change
      npr: field === 'severity' || field === 'occurrence' || field === 'detection'
        ? calculateNPR(
            field === 'severity' ? value : item.severity,
            field === 'occurrence' ? value : item.occurrence,
            field === 'detection' ? value : item.detection
          )
        : item.npr
    };

    onChange(updatedItem);
    updateItem(updatedItem);
  }, [item, onChange, updateItem, readonly]);

  return (
    <tr className="border-b hover:bg-gray-50">
      <td>
        <input
          type="text"
          value={item.function}
          onChange={e => handleCellEdit('function', e.target.value)}
          className="w-full px-2 py-1 border-0 focus:ring-2 focus:ring-blue-500"
          disabled={readonly}
        />
      </td>
      {/* Additional cells for failure mode, effect, etc. */}
      <td className="text-center">
        <span className={`font-semibold ${
          item.npr >= 240 ? 'text-red-600' :
          item.npr >= 120 ? 'text-orange-600' :
          item.npr >= 60 ? 'text-yellow-600' : 'text-green-600'
        }`}>
          {item.npr}
        </span>
      </td>
    </tr>
  );
};
```

## State Management Architecture

### State Structure

```typescript
// stores/amfeStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { AMFE, AMFEItem } from '@/types/amfe';
import { syncService } from '@/services/sync';

interface AMFEState {
  // Current AMFE being edited
  currentAMFE: AMFE | null;
  items: AMFEItem[];
  loading: boolean;
  error: string | null;
  lastSync: Date | null;

  // Actions
  setCurrentAMFE: (amfe: AMFE | null) => void;
  loadAMFE: (id: string) => Promise<void>;
  updateItem: (item: AMFEItem) => void;
  addItem: (item: Omit<AMFEItem, 'id'>) => void;
  deleteItem: (id: string) => void;
  saveChanges: () => Promise<void>;
  sync: () => Promise<void>;
}

export const useAMFEStore = create<AMFEState>()(
  subscribeWithSelector((set, get) => ({
    currentAMFE: null,
    items: [],
    loading: false,
    error: null,
    lastSync: null,

    setCurrentAMFE: (amfe) => set({ currentAMFE: amfe }),

    loadAMFE: async (id) => {
      set({ loading: true, error: null });
      try {
        // Try local storage first
        const local = await syncService.getLocalAMFE(id);
        if (local) {
          set({
            currentAMFE: local.amfe,
            items: local.items,
            loading: false
          });
        }

        // Then sync from cloud
        await get().sync();
      } catch (error) {
        set({ error: error.message, loading: false });
      }
    },

    updateItem: (item) => set((state) => ({
      items: state.items.map(i => i.id === item.id ? item : i)
    })),

    addItem: (item) => set((state) => ({
      items: [...state.items, {
        ...item,
        id: crypto.randomUUID(),
        row_number: state.items.length + 1
      }]
    })),

    deleteItem: (id) => set((state) => ({
      items: state.items.filter(i => i.id !== id)
    })),

    saveChanges: async () => {
      const { currentAMFE, items } = get();
      if (!currentAMFE) return;

      try {
        await syncService.saveAMFE(currentAMFE, items);
        set({ lastSync: new Date() });
      } catch (error) {
        set({ error: error.message });
      }
    },

    sync: async () => {
      const { currentAMFE } = get();
      if (!currentAMFE) return;

      try {
        const result = await syncService.syncAMFE(currentAMFE.id);
        if (result) {
          set({
            currentAMFE: result.amfe,
            items: result.items,
            lastSync: new Date()
          });
        }
      } catch (error) {
        // Sync errors shouldn't block offline usage
        console.warn('Sync failed:', error);
      }
    }
  }))
);
```

### State Management Patterns

- **Single Source of Truth:** Each domain (AMFE, Actions, User) has its own store
- **Immutability:** State updates create new objects, never mutate existing state
- **Persistence Integration:** Stores automatically sync with IndexedDB
- **Optimistic Updates:** UI updates immediately, sync happens in background
- **Error Boundaries:** Each store handles its own error states

## Routing Architecture

### Route Organization

```typescript
// App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />

        {/* Protected routes (optional auth) */}
        <Route
          path="/amfe/:id"
          element={
            <ProtectedRoute optional>
              <AMFEEdit />
            </ProtectedRoute>
          }
        />

        {/* Dashboard routes */}
        <Route path="/actions" element={<Actions />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};
```

### Protected Route Pattern

```typescript
// components/auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  optional?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  optional = false
}) => {
  const { user } = useAuth();
  const location = useLocation();

  // If optional, allow access without authentication
  if (optional) {
    return <>{children}</>;
  }

  // If not optional and no user, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
```

## Frontend Services Layer

### API Client Setup

```typescript
// services/api.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'x-application-name': 'amfe-tool',
    },
  },
});

// Typed API wrapper
export class APIClient {
  // AMFE operations
  static async getAMFEs(filters?: {
    type?: 'DFMEA' | 'PFMEA';
    status?: string;
    search?: string;
  }) {
    let query = supabase
      .from('amfes')
      .select(`
        *,
        amfe_items (
          id,
          row_number,
          function,
          failure_mode,
          npr,
          risk_level
        ),
        corrective_actions (
          id,
          status,
          due_date,
          responsible
        )
      `);

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.search) {
      query = query.textSearch('name', filters.search);
    }

    const { data, error } = await query.order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async createAMFE(amfe: Omit<Database['public']['Tables']['amfes']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('amfes')
      .insert(amfe)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateAMFE(id: string, updates: Partial<Database['public']['Tables']['amfes']['Update']>) {
    const { data, error } = await supabase
      .from('amfes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Batch update for AMFE items
  static async updateAMFEItems(items: Database['public']['Tables']['amfe_items']['Update'][]) {
    const { data, error } = await supabase
      .from('amfe_items')
      .upsert(items, { onConflict: 'id' })
      .select();

    if (error) throw error;
    return data;
  }
}
```

### Service Example

```typescript
// services/sync.ts
import { APIClient } from './api';
import { localDB } from './storage';
import { AMFE, AMFEItem } from '@/types/amfe';

export class SyncService {
  private syncQueue: Array<{
    type: 'create' | 'update' | 'delete';
    entity: 'amfe' | 'item' | 'action';
    data: any;
    timestamp: Date;
  }> = [];

  async saveAMFE(amfe: AMFE, items: AMFEItem[]) {
    // Always save locally first
    await localDB.saveAMFE(amfe, items);

    // Queue for sync if online
    if (navigator.onLine) {
      try {
        await APIClient.updateAMFE(amfe.id, {
          name: amfe.name,
          status: amfe.status,
          updated_at: new Date().toISOString()
        });

        await APIClient.updateAMFEItems(
          items.map(item => ({
            id: item.id,
            function: item.function,
            failure_mode: item.failure_mode,
            severity: item.severity,
            occurrence: item.occurrence,
            detection: item.detection
          }))
        );
      } catch (error) {
        // Queue for later if sync fails
        this.syncQueue.push({
          type: 'update',
          entity: 'amfe',
          data: { amfe, items },
          timestamp: new Date()
        });
      }
    } else {
      // Queue for when online
      this.syncQueue.push({
        type: 'update',
        entity: 'amfe',
        data: { amfe, items },
        timestamp: new Date()
      });
    }
  }

  async processSyncQueue() {
    while (this.syncQueue.length > 0 && navigator.onLine) {
      const item = this.syncQueue[0];

      try {
        await this.syncItem(item);
        this.syncQueue.shift(); // Remove on success
      } catch (error) {
        console.warn('Sync failed, will retry later:', error);
        break; // Stop processing on error
      }
    }
  }

  private async syncItem(queueItem: any) {
    // Implementation for syncing individual items
    // ...
  }
}

export const syncService = new SyncService();

// Listen for online/offline events
window.addEventListener('online', () => {
  syncService.processSyncQueue();
});
```

---

**Frontend Architecture Decisions:**

1. **Component Composition:** Small, reusable components with clear responsibilities
2. **State Management:** Zustand for simplicity without sacrificing capabilities
3. **Type Safety:** Full TypeScript coverage from database to UI
4. **Progressive Enhancement:** Works without auth, enhanced with cloud features
5. **Performance Optimized:** Lazy loading, virtual scrolling, and efficient re-renders

---
