-- AMFE Database Schema
-- This file creates all necessary tables for the AMFE application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Failure Modes table (public library)
CREATE TABLE IF NOT EXISTS failure_modes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Profiles table (optional authentication)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE,
    full_name TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AMFEs table (main FMEA documents)
CREATE TABLE IF NOT EXISTS amfes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('DFMEA', 'PFMEA')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'archived')),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AMFE Items table (individual analysis rows)
CREATE TABLE IF NOT EXISTS amfe_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    amfe_id UUID NOT NULL REFERENCES amfes(id) ON DELETE CASCADE,
    failure_mode_id UUID REFERENCES failure_modes(id),
    process_step TEXT,
    function TEXT,
    failure_mode TEXT NOT NULL,
    failure_effects TEXT,
    severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 10),
    occurrence INTEGER NOT NULL CHECK (occurrence >= 1 AND occurrence <= 10),
    detection INTEGER NOT NULL CHECK (detection >= 1 AND detection <= 10),
    npr INTEGER GENERATED ALWAYS AS (severity * occurrence * detection) STORED,
    risk_level TEXT GENERATED ALWAYS AS (
        CASE
            WHEN (severity * occurrence * detection) >= 100 THEN 'High'
            WHEN (severity * occurrence * detection) >= 50 THEN 'Medium'
            ELSE 'Low'
        END
    ) STORED,
    current_controls TEXT,
    recommendations TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Corrective Actions table
CREATE TABLE IF NOT EXISTS corrective_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    amfe_item_id UUID NOT NULL REFERENCES amfe_items(id) ON DELETE CASCADE,
    action_text TEXT NOT NULL,
    responsible_party TEXT,
    due_date DATE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    effectiveness INTEGER CHECK (effectiveness >= 1 AND effectiveness <= 10),
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Evidence table (file attachments)
CREATE TABLE IF NOT EXISTS evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    corrective_action_id UUID REFERENCES corrective_actions(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    uploaded_by UUID REFERENCES user_profiles(id),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at on all tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_failure_modes_updated_at BEFORE UPDATE ON failure_modes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_amfes_updated_at BEFORE UPDATE ON amfes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_amfe_items_updated_at BEFORE UPDATE ON amfe_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_corrective_actions_updated_at BEFORE UPDATE ON corrective_actions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_evidence_updated_at BEFORE UPDATE ON evidence FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_amfes_created_by ON amfes(created_by);
CREATE INDEX IF NOT EXISTS idx_amfes_status ON amfes(status);
CREATE INDEX IF NOT EXISTS idx_amfes_type ON amfes(type);

CREATE INDEX IF NOT EXISTS idx_amfe_items_amfe_id ON amfe_items(amfe_id);
CREATE INDEX IF NOT EXISTS idx_amfe_items_failure_mode_id ON amfe_items(failure_mode_id);
CREATE INDEX IF NOT EXISTS idx_amfe_items_risk_level ON amfe_items(risk_level);

CREATE INDEX IF NOT EXISTS idx_corrective_actions_amfe_item_id ON corrective_actions(amfe_item_id);
CREATE INDEX IF NOT EXISTS idx_corrective_actions_status ON corrective_actions(status);
CREATE INDEX IF NOT EXISTS idx_corrective_actions_due_date ON corrective_actions(due_date);

CREATE INDEX IF NOT EXISTS idx_evidence_corrective_action_id ON evidence(corrective_action_id);
CREATE INDEX IF NOT EXISTS idx_evidence_uploaded_by ON evidence(uploaded_by);

-- Insert some basic failure modes for common usage
INSERT INTO failure_modes (name, description, category) VALUES
('No Response', 'Equipment fails to respond to input', 'System'),
('Incorrect Output', 'Equipment produces wrong results', 'Quality'),
('Intermittent Failure', 'Equipment works sometimes but not always', 'Reliability'),
('Slow Performance', 'Equipment operates too slowly', 'Performance'),
('Complete Failure', 'Equipment stops working entirely', 'Critical'),
('Partial Failure', 'Equipment works partially', 'Major'),
('Data Corruption', 'Data becomes corrupted or lost', 'Data'),
('Safety Hazard', 'Equipment creates unsafe conditions', 'Safety')
ON CONFLICT (name) DO NOTHING;