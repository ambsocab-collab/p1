// Table types for the AMFE database
export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface FailureMode {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export interface AMFE {
  id: string;
  name: string;
  type: 'DFMEA' | 'PFMEA';
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  description: string | null;
  metadata: Record<string, any>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AMFEItem {
  id: string;
  amfe_id: string;
  failure_mode_id: string | null;
  process_step: string | null;
  function: string | null;
  failure_mode: string;
  failure_effects: string | null;
  severity: number;
  occurrence: number;
  detection: number;
  npr: number;
  risk_level: 'Low' | 'Medium' | 'High';
  current_controls: string | null;
  recommendations: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CorrectiveAction {
  id: string;
  amfe_item_id: string;
  action_text: string;
  responsible_party: string | null;
  due_date: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  estimated_cost: number | null;
  actual_cost: number | null;
  effectiveness: number | null;
  notes: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Evidence {
  id: string;
  corrective_action_id: string | null;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_by: string | null;
  description: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Utility types for form data and API responses
export interface CreateAMFEData {
  name: string;
  type: 'DFMEA' | 'PFMEA';
  description?: string;
  metadata?: Record<string, any>;
}

export interface CreateAMFEItemData {
  amfe_id: string;
  failure_mode_id?: string | null;
  process_step?: string | null;
  function?: string | null;
  failure_mode: string;
  failure_effects?: string | null;
  severity: number;
  occurrence: number;
  detection: number;
  current_controls?: string | null;
  recommendations?: string | null;
  metadata?: Record<string, any>;
}

export interface CreateCorrectiveActionData {
  amfe_item_id: string;
  action_text: string;
  responsible_party?: string | null;
  due_date?: string | null;
  estimated_cost?: number | null;
  notes?: string | null;
  metadata?: Record<string, any>;
}

export interface CreateEvidenceData {
  corrective_action_id?: string | null;
  file_name: string;
  file_path: string;
  file_type?: string | null;
  file_size?: number | null;
  description?: string | null;
  metadata?: Record<string, any>;
}

// Risk level utilities
export type RiskLevel = 'Low' | 'Medium' | 'High';

export const calculateNPR = (severity: number, occurrence: number, detection: number): number => {
  return severity * occurrence * detection;
};

export const getRiskLevel = (npr: number): RiskLevel => {
  if (npr >= 100) return 'High';
  if (npr >= 50) return 'Medium';
  return 'Low';
};