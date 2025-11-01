# Setup GitHub Actions Secrets for CI/CD

## Required Secrets

1. **VERCEL_TOKEN**
   - Get from: https://vercel.com/account/tokens
   - Create new token with "Vercel Platform" scope

2. **ORG_ID**
   - From Vercel dashboard URL or `vercel ls --debug`
   - Your Vercel organization/team ID

3. **PROJECT_ID**
   - From Vercel project settings or `.vercel/project.json`
   - Your specific project ID

## How to Add

1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret with exact name

## Verify

Push to main branch and check Actions tab for successful deployment.