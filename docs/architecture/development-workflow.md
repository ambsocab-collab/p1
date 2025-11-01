# Development Workflow

## Local Development Setup

### Prerequisites
```bash
# Node.js 18+ required
node --version  # v18.17.0 or later

# PNPM package manager
npm install -g pnpm@latest

# Supabase CLI (optional for local development)
npm install -g supabase

# Additional tools
git --version          # For version control
docker --version       # If using local PostgreSQL
```

### Initial Setup
```bash
# Clone repository
git clone https://github.com/your-org/amfe-tool.git
cd amfe-tool

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Setup database
pnpm db:migrate
pnpm db:seed

# Start development servers
pnpm dev                    # Frontend at http://localhost:5173
pnpm --filter api dev       # Backend functions at http://localhost:54321
```

### Development Commands
```bash
# Start all services
pnpm dev

# Start frontend only
pnpm --filter web dev

# Start backend only
supabase start              # Local Supabase instance
supabase functions serve    # Edge functions

# Run tests
pnpm test                   # All tests
pnpm --filter web test      # Frontend unit tests
pnpm test:e2e              # E2E tests with Playwright

# Type checking
pnpm type-check            # Check all packages

# Linting
pnpm lint                  # ESLint all files
pnpm lint:fix             # Auto-fix issues
```

## Environment Configuration

### Required Environment Variables

```bash
# Frontend (.env.local)
VITE_SUPABASE_URL=your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_NAME=AMFE Tool
VITE_APP_VERSION=1.0.0
VITE_DISABLE_AUTH=false     # Set to true for anonymous-only mode

# Backend (Supabase)
SUPABASE_URL=your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DB_PASSWORD=your-db-password

# Optional: Email service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Optional: Analytics
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VERCEL_ANALYTICS_ID=your-vercel-id
```

### Environment-specific Configurations

```typescript
// src/config/environment.ts
export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'AMFE Tool',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    disableAuth: import.meta.env.VITE_DISABLE_AUTH === 'true',
  },
  features: {
    analytics: !!import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
    notifications: import.meta.env.MODE === 'production',
    debug: import.meta.env.MODE === 'development',
  },
  api: {
    timeout: 30000,
    retryAttempts: 3,
  },
};
```
