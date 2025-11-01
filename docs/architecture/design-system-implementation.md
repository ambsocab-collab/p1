# Design System Implementation

Based on the Front-End Specification, we need to implement a custom design system optimized for data-intensive engineering applications.

## Core Design System Components

### DataTable Pro Component
```typescript
// components/ui/DataTablePro.tsx
interface DataTableProProps {
  data: any[];
  columns: ColumnDef[];
  editable?: boolean;
  frozenColumns?: number;
  onCellEdit?: (rowIndex: number, field: string, value: any) => void;
  onRowSelect?: (rows: any[]) => void;
  keyboardNavigation?: boolean;
  autoSave?: boolean;
  nprColorCoding?: boolean;
}

// Features:
// - Excel-like keyboard navigation (Tab, Shift+Tab, Enter, Arrow keys)
// - Auto-save on cell exit (configurable: 30s default)
// - Frozen headers for large datasets
// - Color-coded NPR values
// - Context menu on right-click
// - Virtual scrolling for performance
// - Copy/Paste support from Excel
```

### ActionCard Component
```typescript
// components/actions/ActionCard.tsx
interface ActionCardProps {
  action: CorrectiveAction;
  onStatusChange?: (actionId: string, status: ActionStatus) => void;
  onFileUpload?: (actionId: string, files: File[]) => void;
  draggable?: boolean;
  compact?: boolean;
}

// Status color mapping:
// - Pending: yellow accent (#F59E0B)
// - In Progress: blue accent (#3B82F6)
// - Completed: green accent (#16A34A)
// - Overdue: red accent (#DC2626)
```

### MetricCard Component
```typescript
// components/dashboard/MetricCard.tsx
interface MetricCardProps {
  title: string;
  value: number | string;
  trend?: {
    value: number;
    period: string;
  };
  size?: 'small' | 'medium' | 'large';
  alert?: boolean;
  loading?: boolean;
}
```

## Color Palette (from spec)
```typescript
// styles/colors.ts
export const colors = {
  primary: '#1E3A8A',    // Header, primary buttons
  secondary: '#F3F4F6',  // Background, cards
  accent: '#EA580C',     // Alerts, critical NPRs
  success: '#16A34A',    // Completed actions
  warning: '#F59E0B',    // Medium NPRs, deadlines
  error: '#DC2626',      // Critical errors
  neutral: '#6B7280',    // Secondary text

  // NPR Color Coding
  npr: {
    critical: '#DC2626', // > 240
    high: '#EA580C',     // 120-239
    medium: '#F59E0B',   // 60-119
    low: '#16A34A',      // < 60
  }
};
```

## Navigation Architecture
```typescript
// components/navigation/AppNavigation.tsx
interface AppNavigationProps {
  currentPath: string;
  isMobile: boolean;
}

// Desktop: Left sidebar with:
// - Dashboard (home icon)
// - AMFEs (grid icon)
// - Actions (checklist icon)
// - Reports (chart icon)
// - Settings (gear icon)

// Mobile: Bottom tab bar (max 5 items)
```

## User Flow Implementation

### Flow 1: AMFE Creation (45-minute target)
```typescript
// stores/amfeCreationStore.ts
interface AMFECreationState {
  step: 'setup' | 'matrix' | 'review';
  progress: number; // 0-100
  timeSpent: number; // in seconds
  autoSaveEnabled: boolean;
  lastSave: Date;
  suggestions: {
    failureModes: FailureMode[];
    similarRows: AMFEItem[];
  };
}

// Optimizations for 45-minute target:
// - Intelligent failure mode suggestions
// - Keyboard shortcuts throughout
// - Auto-calculated NPR
// - Bulk actions for common tasks
// - Progress tracking with time estimates
```

### Flow 2: Actions Management
```typescript
// stores/actionsStore.ts
interface ActionsState {
  filters: {
    status: ActionStatus[];
    responsible: string[];
    dueDateRange: [Date, Date];
    amfeId?: string;
  };
  sortBy: 'dueDate' | 'npr' | 'status';
  view: 'cards' | 'list' | 'calendar';
  bulkActions: string[];
}

// Features:
// - Drag-and-drop status changes
// - Email notifications for deadlines
// - File upload with drag-drop
// - Calendar integration
// - Cost tracking visualization
```

## Performance Requirements Implementation

### Page Load Optimization (< 3s on 3G)
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@headlessui/react', '@heroicons/react'],
          charts: ['recharts'],
          pdf: ['pdf-lib']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand']
  }
});

// Lazy loading for dashboard widgets
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AMFEEditor = lazy(() => import('./pages/AMFEEditor'));
```

### Interaction Response (< 100ms)
```typescript
// utils/performance.ts
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

// Optimized state updates
export const useOptimizedAMFEStore = () => {
  const store = useAMFEStore();

  // Memoize expensive calculations
  const calculatedMetrics = useMemo(() => {
    return calculateMetrics(store.items);
  }, [store.items]);

  return {
    ...store,
    calculatedMetrics
  };
};
```

## Animation Implementation
```typescript
// styles/animations.ts
export const animations = {
  // NPR color change
  nprTransition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',

  // Row hover
  rowHover: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',

  // Save indicator
  saveSuccess: 'pulse 500ms cubic-bezier(0.4, 0, 0.2, 1)',

  // Modal
  modalOpen: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',

  // Filter apply
  filterStagger: '400ms cubic-bezier(0.4, 0, 0.2, 1)',

  // Loading
  shimmer: 'shimmer 1.5s linear infinite'
};

// Respect prefers-reduced-motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

## Accessibility Implementation (WCAG 2.1 AA)
```typescript
// components/ui/FocusProvider.tsx
export const FocusProvider = ({ children }) => {
  return (
    <div className="focus-provider">
      {children}
      <style jsx>{`
        :focus-visible {
          outline: 2px solid #1E3A8A;
          outline-offset: 3px;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
};

// Keyboard navigation for matrix
const useKeyboardNavigation = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch(e.key) {
        case 'Tab':
          // Navigate between cells
          e.preventDefault();
          navigateCell(e.shiftKey ? -1 : 1);
          break;
        case 'Enter':
          // Edit cell
          e.preventDefault();
          editCurrentCell();
          break;
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          // Navigate matrix
          e.preventDefault();
          navigateMatrix(e.key);
          break;
        case 's':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            saveDocument();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
};
```

## Auto-save Implementation
```typescript
// services/autoSave.ts
class AutoSaveService {
  private saveInterval: NodeJS.Timeout;
  private saveQueue = new Map<string, any>();

  constructor(private interval: number = 30000) {
    this.saveInterval = setInterval(() => {
      this.processSaveQueue();
    }, interval);
  }

  queueSave(id: string, data: any) {
    this.saveQueue.set(id, { ...data, timestamp: Date.now() });

    // Also save to localStorage immediately
    localStorage.setItem(`autosave_${id}`, JSON.stringify(data));
  }

  private async processSaveQueue() {
    for (const [id, data] of this.saveQueue) {
      try {
        await this.saveToCloud(id, data);
        this.saveQueue.delete(id);
      } catch (error) {
        console.warn('Auto-save failed, keeping in queue:', error);
      }
    }
  }
}

export const autoSave = new AutoSaveService();
```

## Mobile-Specific Implementations
```typescript
// hooks/useTouchGestures.ts
export const useTouchGestures = (onSwipe?: (direction: 'left' | 'right') => void) => {
  const touchStartX = useRef(0);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      onSwipe?.(diff > 0 ? 'left' : 'right');
    }
  };

  return { handleTouchStart, handleTouchEnd };
};

// Responsive navigation
const Navigation = () => {
  const isMobile = useMediaQuery('(max-width: 767px)');

  if (isMobile) {
    return <BottomTabBar />;
  }

  return <SideBar />;
};
```
