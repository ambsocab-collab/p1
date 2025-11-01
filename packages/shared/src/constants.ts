// App constants
export const APP_NAME = 'AMFE Tool'
export const APP_VERSION = '1.0.0'
export const APP_DESCRIPTION = 'Auditoría Médica Facilitada con Evidencias'

// API endpoints
export const API_ENDPOINTS = {
  AUDITS: '/audits',
  EVIDENCES: '/evidences',
  USERS: '/users',
} as const

// Pagination
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

// File upload limits
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

// Status options
export const AUDIT_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export const USER_ROLES = {
  ADMIN: 'admin',
  AUDITOR: 'auditor',
  VIEWER: 'viewer',
} as const

// Theme
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const