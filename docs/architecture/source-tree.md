# Source Tree Structure

This document defines the complete source tree structure for the project. All development must follow this exact folder and file organization.

## Project Root Structure

```
p1/
├── .bmad-core/           # BMAD Core configuration and tasks
├── .claude/             # Claude Code configuration
├── .ignore/             # Ignore patterns and configurations
├── .research/           # Research and documentation
├── docs/                # Documentation folder
│   ├── architecture/    # Architecture documentation
│   ├── prd/            # Sharded PRD documents
│   ├── qa/             # QA documentation
│   └── stories/        # User stories
├── public/             # Static public assets
├── src/                # Main source code
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── lib/           # Utility libraries and helpers
│   ├── store/         # State management (Zustand)
│   ├── types/         # TypeScript type definitions
│   ├── services/      # API and external service integrations
│   ├── hooks/         # Custom React hooks
│   └── styles/        # Global styles and Tailwind configuration
├── tests/              # Test files
├── .env.example        # Environment variables example
├── .gitignore         # Git ignore patterns
├── index.html         # Entry HTML file
├── package.json       # Dependencies and scripts
├── tailwind.config.js # Tailwind CSS configuration
├── tsconfig.json      # TypeScript configuration
├── tsconfig.node.json # TypeScript config for Node.js
└── vite.config.ts     # Vite build configuration
```

## Source Code Structure (src/)

### components/
```
components/
├── ui/                 # Base UI components (Headless UI)
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   └── index.ts
├── layout/            # Layout components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Sidebar.tsx
│   └── MainLayout.tsx
└── features/          # Feature-specific components
    └── [feature-name]/
        ├── [FeatureComponent].tsx
        ├── [FeatureComponent].test.tsx
        └── index.ts
```

### pages/
```
pages/
├── Home.tsx
├── About.tsx
├── NotFound.tsx
└── [page-name]/
    ├── [PageComponent].tsx
    ├── [PageComponent].test.tsx
    └── index.ts
```

### lib/
```
lib/
├── api/              # API utilities and configurations
│   ├── client.ts
│   ├── endpoints.ts
│   └── types.ts
├── auth/             # Authentication utilities
│   ├── supabase.ts
│   └── helpers.ts
├── db/               # Database utilities
│   ├── queries.ts
│   ├── mutations.ts
│   └── types.ts
├── utils/            # General utility functions
│   ├── format.ts
│   ├── validation.ts
│   └── constants.ts
└── storage/          # Local storage utilities
    └── indexedDB.ts
```

### store/
```
store/
├── useAuthStore.ts    # Authentication state
├── useDataStore.ts    # Application data state
├── useUIStore.ts      # UI state (modals, sidebars, etc.)
└── index.ts          # Store exports
```

### types/
```
types/
├── api.ts            # API response/request types
├── auth.ts           # Authentication types
├── database.ts       # Database schema types
├── ui.ts             # UI component types
└── index.ts          # Type exports
```

### services/
```
services/
├── apiService.ts     # General API service
├── authService.ts    # Authentication service
├── storageService.ts # File storage service
└── notificationService.ts # Notification service
```

### hooks/
```
hooks/
├── useAuth.ts        # Authentication hook
├── useApi.ts         # API data fetching hook
├── useLocalStorage.ts # Local storage hook
├── useDebounce.ts    # Debounce hook
└── index.ts          # Hook exports
```

### styles/
```
styles/
├── globals.css       # Global CSS styles
├── components.css    # Component-specific styles
└── tailwind.css      # Tailwind CSS imports
```

## Test Structure

```
tests/
├── __mocks__/        # Mock files
├── fixtures/         # Test data fixtures
├── setup.ts          # Test setup configuration
├── components/       # Component tests
├── pages/           # Page tests
├── lib/             # Library tests
├── hooks/           # Hook tests
└── e2e/             # End-to-end tests
    └── spec.ts
```

## File Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Files**: camelCase (e.g., `userService.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Types**: PascalCase with descriptive suffix (e.g., `UserType.ts`)
- **Tests**: Same name as file with `.test.tsx` or `.spec.tsx` suffix
- **Stories**: kebab-case (e.g., `user-profile-management.md`)

## Import Organization

1. React imports
2. Third-party libraries
3. Internal components (relative imports)
4. Utilities and services
5. Types

Example:
```typescript
import React from 'react';
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Button } from '../ui/Button';
import { useAuth } from '../hooks/useAuth';
import { User as UserType } from '../types/auth';
```

## Folder Organization Rules

1. Keep related files together
2. Use barrel exports (index.ts) for clean imports
3. Separate concerns by feature, not by file type
4. Test files should be co-located with source files
5. Avoid deep nesting (max 3-4 levels)

## Component Structure

Each component should follow this structure:
```
[ComponentName]/
├── [ComponentName].tsx
├── [ComponentName].test.tsx
├── [ComponentName].stories.tsx (if using Storybook)
├── types.ts (if complex types needed)
└── index.ts
```

This source tree structure ensures consistency, maintainability, and scalability across the entire project.