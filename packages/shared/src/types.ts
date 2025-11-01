// Database types
export interface Audit {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
  created_by: string
  assigned_to?: string
  due_date?: string
}

export interface Evidence {
  id: string
  audit_id: string
  title: string
  description: string
  file_url?: string
  file_type?: string
  tags: string[]
  created_at: string
  created_by: string
}

export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  role: 'admin' | 'auditor' | 'viewer'
  created_at: string
  updated_at: string
}

// UI State types
export interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  loading: boolean
  error: string | null
}

// API Response types
export interface ApiResponse<T> {
  data: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pages: number
}