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
  // ===========================================
  // SUPABASE CONFIGURATION
  // ===========================================
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

  // ===========================================
  // APPLICATION CONFIGURATION
  // ===========================================
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
    name: 'VITE_APP_URL',
    required: false,
    validator: (value) => {
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    }
  },
  {
    name: 'VITE_APP_SUPPORT_EMAIL',
    required: false,
    validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  },

  // ===========================================
  // AUTHENTICATION CONFIGURATION
  // ===========================================
  {
    name: 'VITE_DISABLE_AUTH',
    required: false
  },
  {
    name: 'VITE_ENABLE_ANONYMOUS_AUTH',
    required: false
  },
  {
    name: 'VITE_AUTH_SESSION_TIMEOUT',
    required: false,
    validator: (value) => {
      const num = parseInt(value)
      return !isNaN(num) && num > 0
    }
  },
  {
    name: 'VITE_ENABLE_MAGIC_LINK',
    required: false
  },

  // ===========================================
  // FEATURE FLAGS
  // ===========================================
  {
    name: 'VITE_ENABLE_ANALYTICS',
    required: false
  },
  {
    name: 'VITE_ENABLE_ERROR_REPORTING',
    required: false
  },
  {
    name: 'VITE_ENABLE_PERFORMANCE_MONITORING',
    required: false
  },
  {
    name: 'VITE_ENABLE_DEBUG_MODE',
    required: false
  },

  // ===========================================
  // DEVELOPMENT CONFIGURATION
  // ===========================================
  {
    name: 'VITE_DEV_MODE',
    required: false
  },
  {
    name: 'VITE_LOG_LEVEL',
    required: false,
    validator: (value) => ['error', 'warn', 'info', 'debug'].includes(value)
  },
  {
    name: 'VITE_ENABLE_MOCK_DATA',
    required: false
  },
  {
    name: 'VITE_ENABLE_API_MOCKING',
    required: false
  },

  // ===========================================
  // FILE UPLOAD CONFIGURATION
  // ===========================================
  {
    name: 'VITE_MAX_FILE_SIZE',
    required: false,
    validator: (value) => {
      const num = parseInt(value)
      return !isNaN(num) && num > 0
    }
  },
  {
    name: 'VITE_ALLOWED_FILE_TYPES',
    required: false
  },
  {
    name: 'VITE_MAX_FILES_PER_UPLOAD',
    required: false,
    validator: (value) => {
      const num = parseInt(value)
      return !isNaN(num) && num > 0
    }
  },

  // ===========================================
  // CACHE CONFIGURATION
  // ===========================================
  {
    name: 'VITE_ENABLE_CACHE',
    required: false
  },
  {
    name: 'VITE_CACHE_TTL',
    required: false,
    validator: (value) => {
      const num = parseInt(value)
      return !isNaN(num) && num > 0
    }
  },

  // ===========================================
  // SECURITY CONFIGURATION
  // ===========================================
  {
    name: 'VITE_ENABLE_RATE_LIMITING',
    required: false
  },
  {
    name: 'VITE_RATE_LIMIT_REQUESTS',
    required: false,
    validator: (value) => {
      const num = parseInt(value)
      return !isNaN(num) && num > 0
    }
  },
  {
    name: 'VITE_RATE_LIMIT_WINDOW',
    required: false,
    validator: (value) => {
      const num = parseInt(value)
      return !isNaN(num) && num > 0
    }
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