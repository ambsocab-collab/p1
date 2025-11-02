/// <reference types="vite/client" />

interface ImportMetaEnv {
  // ===========================================
  // SUPABASE CONFIGURATION
  // ===========================================
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string

  // ===========================================
  // APPLICATION CONFIGURATION
  // ===========================================
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_DESCRIPTION?: string
  readonly VITE_APP_URL: string
  readonly VITE_APP_SUPPORT_EMAIL?: string

  // ===========================================
  // AUTHENTICATION CONFIGURATION
  // ===========================================
  readonly VITE_DISABLE_AUTH?: string
  readonly VITE_ENABLE_ANONYMOUS_AUTH?: string
  readonly VITE_AUTH_SESSION_TIMEOUT?: string
  readonly VITE_ENABLE_MAGIC_LINK?: string

  // ===========================================
  // FEATURE FLAGS
  // ===========================================
  readonly VITE_ENABLE_ANALYTICS?: string
  readonly VITE_ENABLE_ERROR_REPORTING?: string
  readonly VITE_ENABLE_PERFORMANCE_MONITORING?: string
  readonly VITE_ENABLE_DEBUG_MODE?: string

  // ===========================================
  // DEVELOPMENT CONFIGURATION
  // ===========================================
  readonly VITE_DEV_MODE?: string
  readonly VITE_LOG_LEVEL?: string
  readonly VITE_ENABLE_MOCK_DATA?: string
  readonly VITE_ENABLE_API_MOCKING?: string

  // ===========================================
  // FILE UPLOAD CONFIGURATION
  // ===========================================
  readonly VITE_MAX_FILE_SIZE?: string
  readonly VITE_ALLOWED_FILE_TYPES?: string
  readonly VITE_MAX_FILES_PER_UPLOAD?: string

  // ===========================================
  // CACHE CONFIGURATION
  // ===========================================
  readonly VITE_ENABLE_CACHE?: string
  readonly VITE_CACHE_TTL?: string

  // ===========================================
  // SECURITY CONFIGURATION
  // ===========================================
  readonly VITE_ENABLE_RATE_LIMITING?: string
  readonly VITE_RATE_LIMIT_REQUESTS?: string
  readonly VITE_RATE_LIMIT_WINDOW?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}