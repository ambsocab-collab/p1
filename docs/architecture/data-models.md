# Data Models

Based on the PRD requirements, I've identified the core entities that will structure our AMFE system. These models are designed to support the complete workflow from AMFE creation through corrective action tracking, with offline-first capabilities.

## AMFE

**Purpose:** Represents a complete Failure Mode Effects Analysis document containing all analysis data, metadata, and relationships to actions.

**Key Attributes:**
- id: string - Unique identifier (UUID)
- name: string - AMFE title/name for identification
- type: enum - DFMEA or PFMEA analysis type
- description: string - Scope and purpose description
- status: enum - Draft, In Progress, Completed, Archived
- created_at: timestamp - Document creation timestamp
- updated_at: timestamp - Last modification timestamp
- created_by: string - Owner user ID (nullable for anonymous)

**TypeScript Interface:**
```typescript
interface AMFE {
  id: string;
  name: string;
  type: 'DFMEA' | 'PFMEA';
  description: string;
  scope?: string;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
  created_by?: string;
  npr_threshold?: number; // Custom threshold for high NPR
  metadata: {
    version: number;
    template_id?: string;
    tags: string[];
  };
}
```

**Relationships:**
- One-to-many with AMFEItem (analysis rows)
- One-to-many with CorrectiveAction
- Belongs to User (optional)

## AMFEItem

**Purpose:** Individual row in the AMFE matrix representing a specific failure mode analysis with all AIAG-VDA standard fields.

**Key Attributes:**
- id: string - Unique row identifier
- amfe_id: string - Parent AMFE document ID
- function: string - Process or product function analyzed
- failure_mode: string - How the failure occurs
- failure_effect: string - Consequences of failure
- failure_cause: string - Root cause of failure
- current_controls: string - Existing prevention/detection controls
- severity: number - Severity rating (1-10)
- occurrence: number - Occurrence rating (1-10)
- detection: number - Detection rating (1-10)
- npr: number - Calculated risk priority number
- risk_level: enum - Low, Medium, High, Critical

**TypeScript Interface:**
```typescript
interface AMFEItem {
  id: string;
  amfe_id: string;
  row_number: number;
  function: string;
  failure_mode: string;
  failure_effect: string;
  failure_cause: string;
  current_controls: string;
  severity: number; // 1-10
  occurrence: number; // 1-10
  detection: number; // 1-10
  npr: number; // Calculated: severity * occurrence * detection
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
  created_at: string;
  updated_at: string;
}
```

**Relationships:**
- Belongs to AMFE
- One-to-many with CorrectiveAction

## CorrectiveAction

**Purpose:** Tracks corrective actions for high NPR items including cost tracking, responsibility assignment, and status management.

**Key Attributes:**
- id: string - Unique action identifier
- amfe_item_id: string - Associated AMFE row
- description: string - Action description
- responsible: string - Person/team responsible
- contact: string - Email or phone for responsible
- due_date: date - Target completion date
- cost_estimated: number - Estimated implementation cost
- cost_actual: number - Actual implementation cost
- status: enum - Pending, In Progress, Completed, Verified
- completion_date: date - Actual completion date

**TypeScript Interface:**
```typescript
interface CorrectiveAction {
  id: string;
  amfe_item_id: string;
  description: string;
  responsible: string;
  contact: string;
  due_date: string;
  cost_estimated: number;
  cost_actual?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'verified';
  completion_date?: string;
  roi?: number; // Calculated ROI
  notes?: string;
  created_at: string;
  updated_at: string;
}
```

**Relationships:**
- Belongs to AMFEItem
- One-to-many with Evidence

## FailureMode

**Purpose:** Pre-loaded library of common failure modes organized by manufacturing categories to accelerate analysis.

**Key Attributes:**
- id: string - Unique identifier
- category: string - Manufacturing category
- mode: string - Failure mode description
- common_causes: array - List of typical causes
- severity_default: number - Suggested severity rating
- tags: array - Search tags

**TypeScript Interface:**
```typescript
interface FailureMode {
  id: string;
  category: string;
  mode: string;
  common_causes: string[];
  severity_default?: number;
  tags: string[];
  industry_type?: string;
}
```

**Relationships:**
- Many-to-many with AMFEItem (via selections)

## Evidence

**Purpose:** File attachments proving corrective action implementation and effectiveness.

**Key Attributes:**
- id: string - Unique evidence identifier
- action_id: string - Parent corrective action
- file_name: string - Original file name
- file_path: string - Storage path
- file_type: string - MIME type
- file_size: number - File size in bytes
- uploaded_by: string - Uploader information
- description: string - Evidence description

**TypeScript Interface:**
```typescript
interface Evidence {
  id: string;
  action_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by?: string;
  description?: string;
  created_at: string;
}
```

**Relationships:**
- Belongs to CorrectiveAction

## User

**Purpose:** Optional user accounts for cloud synchronization and multi-device access.

**Key Attributes:**
- id: string - User UUID
- email: string - User email (optional auth)
- name: string - Display name
- preferences: object - User preferences
- created_at: string - Account creation
- last_login: string - Last activity

**TypeScript Interface:**
```typescript
interface User {
  id: string;
  email?: string;
  name: string;
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    default_npr_threshold: number;
    auto_sync: boolean;
  };
  created_at: string;
  last_login?: string;
}
```

**Relationships:**
- One-to-many with AMFE (as owner)

---

**Data Model Design Decisions:**

1. **Nullable User IDs:** Supporting both anonymous (local-only) and authenticated usage
2. **Calculated Fields:** NPR and risk_level calculated but stored for performance
3. **Status Enums:** Standardized workflow states across all entities
4. **Timestamp Tracking:** Full audit trail with created/updated timestamps
5. **JSON Metadata:** Flexible fields for future expansion without schema changes

---
