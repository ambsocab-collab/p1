/**
 * Environment variable validation utility
 * Ensures all required environment variables are present and valid
 */

interface EnvVar {
  name: string
  required: boolean
  validator?: (value: string) => boolean
}

const envVars: EnvVar[] = [
  {
    name: 'VITE_SUPABASE_URL',
    required: true,
    validator: (value) => {
      // Basic URL validation and Supabase format check
      try {
        const url = new URL(value)
        return url.hostname.endsWith('.supabase.co')
      } catch {
        return false
      }
    }
  },
  {
    name: 'VITE_SUPABASE_ANON_KEY',
    required: true,
    validator: (value) => {
      // Basic Supabase key format check (should be a JWT)
      return value.length > 100 && value.startsWith('eyJ')
    }
  },
  {
    name: 'VITE_APP_NAME',
    required: true
  },
  {
    name: 'VITE_APP_VERSION',
    required: true,
    validator: (value) => /^\d+\.\d+\.\d+/.test(value)
  },
  {
    name: 'VITE_DISABLE_AUTH',
    required: false
  },
  {
    name: 'VITE_ENABLE_ANALYTICS',
    required: false
  },
  {
    name: 'VITE_DEV_MODE',
    required: false
  }
]

export function validateEnv(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  for (const envVar of envVars) {
    const value = import.meta.env[envVar.name]

    if (envVar.required && !value) {
      errors.push(`Missing required environment variable: ${envVar.name}`)
      continue
    }

    if (value && envVar.validator && !envVar.validator(value)) {
      errors.push(`Invalid format for environment variable: ${envVar.name}`)
    }
  }

  // Additional checks
  if (import.meta.env.PROD) {
    // In production, ensure we don't have placeholder values
    if (import.meta.env.VITE_SUPABASE_URL === 'your-project.supabase.co') {
      errors.push('Production deployment detected with placeholder Supabase URL')
    }
    if (import.meta.env.VITE_SUPABASE_ANON_KEY === 'your-anon-key') {
      errors.push('Production deployment detected with placeholder Supabase key')
    }
  }

  const isValid = errors.length === 0

  if (!isValid) {
    console.error('❌ Environment validation failed:')
    errors.forEach(error => console.error(`  - ${error}`))

    // In development, show a helpful message
    if (import.meta.env.DEV) {
      console.error('\n💡 To fix these issues:')
      console.error('1. Copy .env.example to .env.local')
      console.error('2. Update the values in .env.local with your actual credentials')
      console.error('3. Restart the development server')
    }
  }

  return { isValid, errors }
}

// Export a getter for safe access to env variables
export function getEnvVar(name: string): string | undefined {
  return import.meta.env[name]
}

// Validate on import in development
if (import.meta.env.DEV) {
  const { isValid, errors } = validateEnv()
  if (!isValid) {
    // Don't crash in dev, just warn
    console.warn('⚠️ Environment variables not configured correctly')
  }
}