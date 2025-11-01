# AMFE Tool - Auditoría Médica Facilitada con Evidencias

Herramienta para facilitar auditorías médicas con gestión integral de evidencias.

## 🚀 Quick Start

### Prerequisites

- Node.js 18.17.0 or higher
- pnpm 8.15.0 or higher

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd p1
```

2. Install dependencies:
```bash
pnpm install
```

3. Copy environment variables:
```bash
cp .env.example apps/web/.env.local
```

4. Update `apps/web/.env.local` with your Supabase configuration:
   - Get your Supabase URL and anon key from [Supabase Dashboard](https://app.supabase.com)

5. Start development server:
```bash
pnpm dev
```

## 📁 Project Structure

This is a monorepo using pnpm workspaces:

```
p1/
├── apps/
│   └── web/           # React frontend application
├── packages/
│   ├── shared/        # Shared types and utilities
│   └── ui/           # Shared UI components
├── docs/             # Documentation
├── .github/          # GitHub Actions workflows
└── infrastructure/   # Infrastructure as Code
```

## 🛠️ Tech Stack

- **Frontend**: React 18.2+, TypeScript 5.0+, Tailwind CSS 3.3+
- **Build Tool**: Vite 5.0+
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Testing**: Jest + React Testing Library + Playwright
- **Deployment**: Vercel
- **Package Manager**: pnpm

## 📝 Available Scripts

### Root Level Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm test` - Run unit tests
- `pnpm test:e2e` - Run E2E tests
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues
- `pnpm type-check` - Run TypeScript type checking
- `pnpm format` - Format code with Prettier
- `pnpm clean` - Clean build artifacts and node_modules

### App Level Scripts (run from apps/web/)

- `pnpm dev` - Start development server on port 3000
- `pnpm build` - Build application
- `pnpm preview` - Preview production build
- `pnpm test` - Run unit tests with coverage
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:e2e` - Run Playwright E2E tests

## 🧪 Testing

### Unit Tests
```bash
# Run all tests
pnpm test

# Run in watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage
```

### E2E Tests
```bash
# Install Playwright browsers (first time only)
pnpm exec playwright install

# Run E2E tests
pnpm test:e2e

# Run E2E tests in UI mode
pnpm exec playwright test --ui
```

## 🚀 Deployment

### Automatic Deployment

Deployment to Vercel is automatic via GitHub Actions when pushing to the `main` branch.

### Manual Deployment

1. Install Vercel CLI:
```bash
pnpm add -g vercel
```

2. Deploy:
```bash
vercel --prod
```

## 🔧 Environment Variables

Create a `apps/web/.env.local` file with the following variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# App Configuration
VITE_APP_NAME=AMFE Tool
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_DISABLE_AUTH=false
VITE_ENABLE_ANALYTICS=false
```

## 📊 Code Quality

This project uses:

- **ESLint** - Linting and code quality
- **Prettier** - Code formatting
- **TypeScript** - Static typing
- **Husky** - Git hooks (pre-commit linting)
- **lint-staged** - Run linters on staged files

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add some feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions, please open an issue in the GitHub repository.