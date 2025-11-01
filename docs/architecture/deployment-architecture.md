# Deployment Architecture

## Deployment Strategy

### Frontend Deployment
- **Platform:** Vercel Edge Network
- **Build Command:** `pnpm --filter web build`
- **Output Directory:** `apps/web/dist`
- **CDN/Edge:** Automatic via Vercel Edge Network
- **Regions:** Global (automatic nearest edge location)

### Backend Deployment
- **Platform:** Supabase (managed PostgreSQL)
- **Build Command:** N/A (serverless)
- **Deployment Method:** Supabase CLI + GitHub Actions
- **Regions:** us-east-1 (primary), with read replicas for global access

## CI/CD Pipeline

```yaml
# .github/workflows/deploy.yaml
name: Deploy AMFE Tool

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18.17.0'
  PNPM_VERSION: '8.15.0'

jobs:
  test:
    name: Test and Build
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Setup PNPM
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Get PNPM store directory
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV

      - name: Setup PNPM cache
        uses: actions/cache@v3
        with:
          path: ${{ env.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm type-check

      - name: Lint
        run: pnpm lint

      - name: Run tests
        run: pnpm test

      - name: Build application
        run: pnpm build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: |
            apps/web/dist
            packages/*/dist

  deploy-frontend:
    name: Deploy Frontend
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: dist

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'

  deploy-backend:
    name: Deploy Backend
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Setup PNPM
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Deploy to Supabase
        run: |
          echo ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }} > ~/.supabase/service.key
          pnpm db:migrate
          pnpm --filter api deploy
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

## Environments

| Environment | Frontend URL | Backend URL | Purpose |
|-------------|--------------|-------------|---------|
| Development | localhost:5173 | localhost:54321 | Local development |
| Preview | <branch>.amfe-tool.vercel.app | <branch>.supabase.co | PR previews |
| Staging | staging.amfe-tool.com | staging.supabase.co | Pre-production testing |
| Production | amfe-tool.com | amfe-tool.supabase.co | Live environment |