# Unified Project Structure

Creating a monorepo structure that accommodates both frontend and backend while maintaining clear separation of concerns:

```
amfe-tool/
├── .github/                    # CI/CD workflows
│   └── workflows/
│       ├── ci.yaml            # Build and test pipeline
│       └── deploy.yaml        # Deployment automation
├── .vscode/                    # VS Code configuration
│   ├── settings.json
│   └── extensions.json
├── apps/                       # Application packages
│   ├── web/                    # Frontend React application
│   │   ├── public/
│   │   │   ├── manifest.json   # PWA manifest
│   │   │   ├── sw.js          # Service worker
│   │   │   └── icons/         # PWA icons
│   │   ├── src/
│   │   │   ├── components/     # UI components
│   │   │   │   ├── ui/        # Base UI components
│   │   │   │   ├── amfe/      # AMFE-specific components
│   │   │   │   ├── actions/   # Action management
│   │   │   │   └── dashboard/ # Dashboard components
│   │   │   ├── pages/         # Route components
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── services/      # API and business logic
│   │   │   ├── stores/        # State management (Zustand)
│   │   │   ├── utils/         # Utility functions
│   │   │   ├── types/         # TypeScript types
│   │   │   ├── styles/        # Global styles
│   │   │   │   └── globals.css
│   │   │   ├── main.tsx       # Application entry
│   │   │   └── App.tsx        # Root component
│   │   ├── tests/             # Frontend tests
│   │   │   ├── __mocks__/     # Test mocks
│   │   │   ├── components/    # Component tests
│   │   │   └── e2e/           # E2E tests
│   │   ├── index.html
│   │   ├── vite.config.ts     # Vite configuration
│   │   ├── tailwind.config.js # Tailwind CSS config
│   │   ├── tsconfig.json      # TypeScript config
│   │   └── package.json
│   └── api/                    # Backend (Supabase Edge Functions)
│       ├── functions/
│       │   ├── _shared/       # Shared utilities
│       │   ├── exports/       # Report generation
│       │   └── notifications/ # Email notifications
│       ├── migrations/        # Database migrations
│       ├── seeds/             # Initial data
│       ├── deno.json          # Deno configuration
│       └── supabase/config.toml # Supabase config
├── packages/                   # Shared packages
│   ├── shared/                # Shared types and utilities
│   │   ├── src/
│   │   │   ├── types/         # TypeScript interfaces
│   │   │   │   ├── amfe.ts
│   │   │   │   ├── action.ts
│   │   │   │   └── database.ts
│   │   │   ├── constants/     # Shared constants
│   │   │   └── utils/         # Shared utilities
│   │   ├── index.ts
│   │   └── package.json
│   ├── ui/                    # Shared UI components
│   │   ├── src/
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tailwind.config.js
│   └── config/                # Shared configuration
│       ├── eslint/
│       │   └── index.js
│       ├── typescript/
│       │   └── base.json
│       └── jest/
│           └── base.config.js
├── infrastructure/             # IaC definitions
│   ├── supabase/
│   │   ├── migrations/        # SQL migrations
│   │   ├── functions/         # Edge functions
│   │   └── seeds/             # Seed data
│   └── vercel/
│       └── json.json          # Vercel config
├── scripts/                    # Build and utility scripts
│   ├── build.sh               # Build all packages
│   ├── deploy.sh              # Deployment script
│   ├── seed-db.ts             # Database seeding
│   └── sync-types.ts          # Type generation
├── docs/                       # Documentation
│   ├── prd.md                 # Product Requirements
│   ├── architecture.md       # This architecture document
│   ├── api/                   # API documentation
│   └── deployment/            # Deployment guides
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore file
├── package.json                # Root package.json
├── pnpm-workspace.yaml         # PNPM workspace config
├── tsconfig.json              # Root TypeScript config
└── README.md                   # Project documentation
```

## Key Directories Explained

### `/apps/web` - Frontend Application
- **Purpose:** React PWA application for AMFE management
- **Technology:** React 18 + TypeScript + Vite + Tailwind CSS
- **Key Features:** Offline support, real-time sync, responsive design

### `/apps/api` - Backend Functions
- **Purpose:** Supabase Edge Functions for custom business logic
- **Technology:** Deno + TypeScript + Supabase
- **Key Features:** PDF generation, notifications, data processing

### `/packages/shared` - Shared Code
- **Purpose:** Types, utilities, and constants shared across apps
- **Contents:** TypeScript interfaces, validation schemas, business logic
- **Benefits:** Single source of truth for data structures

### `/packages/ui` - Shared Components
- **Purpose:** Reusable UI components across the application
- **Technology:** React + Headless UI + Tailwind CSS
- **Examples:** Buttons, modals, forms, data tables

### `/infrastructure` - Infrastructure as Code
- **Purpose:** Database schemas, deployment configurations
- **Contents:** SQL migrations, Supabase config, Vercel config

## Package.json Structure

### Root package.json
```json
{
  "name": "amfe-tool",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "pnpm --filter web dev",
    "build": "pnpm --filter shared build && pnpm --filter ui build && pnpm --filter web build",
    "test": "pnpm --filter \"*\" test",
    "test:e2e": "pnpm --filter web test:e2e",
    "lint": "pnpm --filter \"*\" lint",
    "type-check": "pnpm --filter \"*\" type-check",
    "db:migrate": "supabase db push",
    "db:seed": "tsx scripts/seed-db.ts",
    "deploy": "pnpm build && pnpm deploy:prod",
    "deploy:prod": "vercel --prod",
    "deploy:staging": "vercel"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "tsx": "^4.7.0",
    "typescript": "^5.0.0",
    "prettier": "^3.0.0",
    "eslint": "^8.0.0"
  }
}
```

### Web app package.json
```json
{
  "name": "@amfe/web",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:e2e": "playwright test",
    "lint": "eslint . --ext ts,tsx",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "zustand": "^4.4.0",
    "@supabase/supabase-js": "^2.38.0",
    "@headlessui/react": "^1.7.0",
    "@heroicons/react": "^2.0.0",
    "clsx": "^2.0.0",
    "date-fns": "^3.0.0",
    "react-hook-form": "^7.43.0",
    "zod": "^3.20.0",
    "@hookform/resolvers": "^3.0.0",
    "recharts": "^2.5.0",
    "pdf-lib": "^1.17.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^5.0.0",
    "vite-plugin-pwa": "^0.19.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^6.0.0",
    "playwright": "^1.40.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

## Workspace Configuration

### pnpm-workspace.yaml
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### tsconfig.json (Root)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./apps/web/src/*"],
      "@/components/*": ["./apps/web/src/components/*"],
      "@/pages/*": ["./apps/web/src/pages/*"],
      "@/hooks/*": ["./apps/web/src/hooks/*"],
      "@/services/*": ["./apps/web/src/services/*"],
      "@/stores/*": ["./apps/web/src/stores/*"],
      "@/utils/*": ["./apps/web/src/utils/*"],
      "@/types/*": ["./packages/shared/src/types/*"],
      "@amfe/shared": ["./packages/shared/src"],
      "@amfe/ui": ["./packages/ui/src"]
    }
  },
  "include": ["apps", "packages"],
  "references": [
    { "path": "./apps/web" },
    { "path": "./packages/shared" },
    { "path": "./packages/ui" }
  ]
}
```

## Development Setup Commands

```bash
# Prerequisites
node --version  # >= 18.0.0
pnpm --version  # >= 8.0.0

# Initial Setup
git clone <repository>
cd amfe-tool
pnpm install

# Development
pnpm dev                    # Start frontend dev server
pnpm --filter api dev       # Start backend functions locally

# Testing
pnpm test                   # Run all tests
pnpm test:e2e              # Run E2E tests
pnpm --filter web test      # Run frontend tests only

# Building
pnpm build                  # Build all packages
pnpm --filter web build     # Build frontend only

# Database
pnpm db:migrate            # Apply database migrations
pnpm db:seed               # Seed initial data

# Linting & Formatting
pnpm lint                  # Lint all packages
pnpm type-check           # Type check all packages
pnpm format               # Format with Prettier
```

---

**Project Structure Decisions:**

1. **Monorepo Benefits:** Shared code, unified tooling, simplified dependencies
2. **Clear Boundaries:** Apps and packages have distinct responsibilities
3. **Path Aliases:** Clean imports with TypeScript path mapping
4. **Workspace Tools:** PNPM for efficient package management
5. **Scalable Organization:** Structure supports future growth and additional apps

## Component Library Integration

The architecture now includes a comprehensive design system that directly implements the UX specifications:

### Design System Components (from Front-End Spec)
- **DataTable Pro** - Excel-like editable matrix with keyboard navigation
- **ActionCard** - Draggable action cards with status color coding
- **MetricCard** - Dashboard KPI displays with trend indicators
- **FilterBar** - Advanced filtering with saved filter sets

### UX Flow Implementation
- **45-minute AMFE Creation** - Optimized workflow with intelligent suggestions
- **Actions Management** - Drag-and-drop status updates with email notifications
- **Report Generation** - Multi-format export with live preview

### Performance Requirements Met
- **< 3s load time on 3G** - Through code splitting and optimization
- **< 100ms UI response** - Using debouncing and memoization
- **60fps animations** - Hardware-accelerated CSS transitions
- **30-second auto-save** - Background synchronization queue

### Accessibility Compliance (WCAG 2.1 AA)
- Full keyboard navigation (Tab, arrows, shortcuts)
- Screen reader support with ARIA labels
- 4.5:1 color contrast ratios
- Touch targets ≥ 44x44px on mobile
- Respects `prefers-reduced-motion` setting

### Mobile Optimization
- Bottom tab navigation on mobile
- Swipe gestures for matrix navigation
- Touch-optimized controls
- Progressive disclosure for small screens
