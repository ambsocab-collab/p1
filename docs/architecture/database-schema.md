# Database Schema

Transforming the conceptual data models into PostgreSQL schema optimized for Supabase:

```sql
-- AMFE Documents Table
CREATE TABLE amfes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('DFMEA', 'PFMEA')),
    description TEXT,
    scope TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'archived')),
    npr_threshold INTEGER DEFAULT 100,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- AMFE Analysis Items Table
CREATE TABLE amfe_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amfe_id UUID NOT NULL REFERENCES amfes(id) ON DELETE CASCADE,
    row_number INTEGER NOT NULL,
    function TEXT NOT NULL,
    failure_mode TEXT NOT NULL,
    failure_effect TEXT NOT NULL,
    failure_cause TEXT NOT NULL,
    current_controls TEXT NOT NULL,
    severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 10),
    occurrence INTEGER NOT NULL CHECK (occurrence BETWEEN 1 AND 10),
    detection INTEGER NOT NULL CHECK (detection BETWEEN 1 AND 10),
    npr INTEGER GENERATED ALWAYS AS (severity * occurrence * detection) STORED,
    risk_level TEXT GENERATED ALWAYS AS (
        CASE
            WHEN (severity * occurrence * detection) >= 240 THEN 'critical'
            WHEN (severity * occurrence * detection) >= 120 THEN 'high'
            WHEN (severity * occurrence * detection) >= 60 THEN 'medium'
            ELSE 'low'
        END
    ) STORED,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(amfe_id, row_number)
);

-- Corrective Actions Table
CREATE TABLE corrective_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amfe_item_id UUID NOT NULL REFERENCES amfe_items(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    responsible TEXT NOT NULL,
    contact TEXT,
    due_date DATE NOT NULL,
    cost_estimated DECIMAL(12,2),
    cost_actual DECIMAL(12,2),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'verified')),
    completion_date DATE,
    roi DECIMAL(12,2) GENERATED ALWAYS AS (
        CASE
            WHEN cost_actual > 0 AND cost_estimated > 0
            THEN ((cost_estimated - cost_actual) / cost_actual) * 100
            ELSE NULL
        END
    ) STORED,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Evidence Files Table
CREATE TABLE evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_id UUID NOT NULL REFERENCES corrective_actions(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    description TEXT,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Failure Modes Library Table
CREATE TABLE failure_modes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    mode TEXT NOT NULL,
    common_causes TEXT[] DEFAULT '{}',
    severity_default INTEGER CHECK (severity_default BETWEEN 1 AND 10),
    tags TEXT[] DEFAULT '{}',
    industry_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Profiles Table (extends auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    preferences JSONB DEFAULT '{
        "theme": "light",
        "language": "es",
        "default_npr_threshold": 100,
        "auto_sync": true
    }',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Indexes for Performance
CREATE INDEX idx_amfes_user_status ON amfes(created_by, status);
CREATE INDEX idx_amfes_type_status ON amfes(type, status);
CREATE INDEX idx_amfe_items_amfe ON amfe_items(amfe_id);
CREATE INDEX idx_actions_item_status ON corrective_actions(amfe_item_id, status);
CREATE INDEX idx_actions_responsible ON corrective_actions(responsible);
CREATE INDEX idx_actions_due_date ON corrective_actions(due_date);
CREATE INDEX idx_evidence_action ON evidence(action_id);
CREATE INDEX idx_failure_modes_category ON failure_modes(category);
CREATE INDEX idx_failure_modes_search ON failure_modes USING gin(to_tsvector('english', mode || ' ' || array_to_string(tags, ' ')));

-- Row Level Security Policies
ALTER TABLE amfes ENABLE ROW LEVEL SECURITY;
ALTER TABLE amfe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE corrective_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;

-- Users can only access their own AMFEs
CREATE POLICY "Users can view own AMFEs" ON amfes FOR SELECT USING (created_by = auth.uid());
CREATE POLICY "Users can create own AMFEs" ON amfes FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own AMFEs" ON amfes FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Users can delete own AMFEs" ON amfes FOR DELETE USING (created_by = auth.uid());

-- Anonymous users (created_by IS NULL) can access their local data
CREATE POLICY "Anonymous can view local AMFEs" ON amfes FOR SELECT USING (created_by IS NULL);
CREATE POLICY "Anonymous can create local AMFEs" ON amfes FOR INSERT WITH CHECK (created_by IS NULL);
CREATE POLICY "Anonymous can update local AMFEs" ON amfes FOR UPDATE USING (created_by IS NULL);
CREATE POLICY "Anonymous can delete local AMFEs" ON amfes FOR DELETE USING (created_by IS NULL);

-- Cascading policies for related tables
CREATE POLICY "Users can access AMFE items" ON amfe_items FOR ALL USING (
    amfe_id IN (
        SELECT id FROM amfes
        WHERE created_by = auth.uid() OR created_by IS NULL
    )
);

CREATE POLICY "Users can access actions" ON corrective_actions FOR ALL USING (
    amfe_item_id IN (
        SELECT id FROM amfe_items
        WHERE amfe_id IN (
            SELECT id FROM amfes
            WHERE created_by = auth.uid() OR created_by IS NULL
        )
    )
);

CREATE POLICY "Users can access evidence" ON evidence FOR ALL USING (
    action_id IN (
        SELECT id FROM corrective_actions
        WHERE amfe_item_id IN (
            SELECT id FROM amfe_items
            WHERE amfe_id IN (
                SELECT id FROM amfes
                WHERE created_by = auth.uid() OR created_by IS NULL
            )
        )
    )
);

-- Failure modes are publicly readable
CREATE POLICY "Everyone can read failure modes" ON failure_modes FOR SELECT USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_amfes_updated_at BEFORE UPDATE ON amfes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_amfe_items_updated_at BEFORE UPDATE ON amfe_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_corrective_actions_updated_at BEFORE UPDATE ON corrective_actions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

**Schema Design Notes:**

1. **Generated Columns:** NPR and risk_level are calculated automatically but stored for performance
2. **UUID Primary Keys:** Supports distributed generation and prevents ID conflicts
3. **Row Level Security:** Enables both authenticated and anonymous usage patterns
4. **JSONB Metadata:** Flexible storage for future feature expansion
5. **Optimized Indexes:** Support common query patterns from dashboard and filtering
