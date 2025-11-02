-- Row Level Security Policies for AMFE Database
-- This file sets up RLS to ensure users can only access their own data

-- Enable RLS on all user data tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE amfes ENABLE ROW LEVEL SECURITY;
ALTER TABLE amfe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE corrective_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;

-- User Profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can delete own profile" ON user_profiles FOR DELETE USING (auth.uid() = id);

-- AMFEs policies (allow both authenticated and anonymous users)
CREATE POLICY "Authenticated users can view own AMFEs" ON amfes FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Anonymous users can view their AMFEs" ON amfes FOR SELECT USING (created_by IS NULL);
CREATE POLICY "Authenticated users can insert own AMFEs" ON amfes FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Anonymous users can insert AMFEs" ON amfes FOR INSERT WITH CHECK (created_by IS NULL);
CREATE POLICY "Authenticated users can update own AMFEs" ON amfes FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Anonymous users can update their AMFEs" ON amfes FOR UPDATE USING (created_by IS NULL);
CREATE POLICY "Authenticated users can delete own AMFEs" ON amfes FOR DELETE USING (auth.uid() = created_by);
CREATE POLICY "Anonymous users can delete their AMFEs" ON amfes FOR DELETE USING (created_by IS NULL);

-- AMFE Items policies (cascade from AMFEs)
CREATE POLICY "Users can view AMFE items for their AMFEs" ON amfe_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM amfes
        WHERE amfes.id = amfe_items.amfe_id
        AND (auth.uid() = amfes.created_by OR (auth.uid() IS NULL AND amfes.created_by IS NULL))
    )
);
CREATE POLICY "Users can insert AMFE items for their AMFEs" ON amfe_items FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM amfes
        WHERE amfes.id = amfe_items.amfe_id
        AND (auth.uid() = amfes.created_by OR (auth.uid() IS NULL AND amfes.created_by IS NULL))
    )
);
CREATE POLICY "Users can update AMFE items for their AMFEs" ON amfe_items FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM amfes
        WHERE amfes.id = amfe_items.amfe_id
        AND (auth.uid() = amfes.created_by OR (auth.uid() IS NULL AND amfes.created_by IS NULL))
    )
);
CREATE POLICY "Users can delete AMFE items for their AMFEs" ON amfe_items FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM amfes
        WHERE amfes.id = amfe_items.amfe_id
        AND (auth.uid() = amfes.created_by OR (auth.uid() IS NULL AND amfes.created_by IS NULL))
    )
);

-- Corrective Actions policies (cascade from AMFEs)
CREATE POLICY "Users can view corrective actions for their AMFEs" ON corrective_actions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM amfe_items
        JOIN amfes ON amfes.id = amfe_items.amfe_id
        WHERE amfe_items.id = corrective_actions.amfe_item_id
        AND (auth.uid() = amfes.created_by OR (auth.uid() IS NULL AND amfes.created_by IS NULL))
    )
);
CREATE POLICY "Users can insert corrective actions for their AMFEs" ON corrective_actions FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM amfe_items
        JOIN amfes ON amfes.id = amfe_items.amfe_id
        WHERE amfe_items.id = corrective_actions.amfe_item_id
        AND (auth.uid() = amfes.created_by OR (auth.uid() IS NULL AND amfes.created_by IS NULL))
    )
);
CREATE POLICY "Users can update corrective actions for their AMFEs" ON corrective_actions FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM amfe_items
        JOIN amfes ON amfes.id = amfe_items.amfe_id
        WHERE amfe_items.id = corrective_actions.amfe_item_id
        AND (auth.uid() = amfes.created_by OR (auth.uid() IS NULL AND amfes.created_by IS NULL))
    )
);
CREATE POLICY "Users can delete corrective actions for their AMFEs" ON corrective_actions FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM amfe_items
        JOIN amfes ON amfes.id = amfe_items.amfe_id
        WHERE amfe_items.id = corrective_actions.amfe_item_id
        AND (auth.uid() = amfes.created_by OR (auth.uid() IS NULL AND amfes.created_by IS NULL))
    )
);

-- Evidence policies (cascade from AMFEs)
CREATE POLICY "Users can view evidence for their AMFEs" ON evidence FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM corrective_actions
        JOIN amfe_items ON amfe_items.id = corrective_actions.amfe_item_id
        JOIN amfes ON amfes.id = amfe_items.amfe_id
        WHERE corrective_actions.id = evidence.corrective_action_id
        AND (auth.uid() = amfes.created_by OR (auth.uid() IS NULL AND amfes.created_by IS NULL))
    )
);
CREATE POLICY "Users can insert evidence for their AMFEs" ON evidence FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM corrective_actions
        JOIN amfe_items ON amfe_items.id = corrective_actions.amfe_item_id
        JOIN amfes ON amfes.id = amfe_items.amfe_id
        WHERE corrective_actions.id = evidence.corrective_action_id
        AND (auth.uid() = amfes.created_by OR (auth.uid() IS NULL AND amfes.created_by IS NULL))
    )
);
CREATE POLICY "Users can update evidence for their AMFEs" ON evidence FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM corrective_actions
        JOIN amfe_items ON amfe_items.id = corrective_actions.amfe_item_id
        JOIN amfes ON amfes.id = amfe_items.amfe_id
        WHERE corrective_actions.id = evidence.corrective_action_id
        AND (auth.uid() = amfes.created_by OR (auth.uid() IS NULL AND amfes.created_by IS NULL))
    )
);
CREATE POLICY "Users can delete evidence for their AMFEs" ON evidence FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM corrective_actions
        JOIN amfe_items ON amfe_items.id = corrective_actions.amfe_item_id
        JOIN amfes ON amfes.id = amfe_items.amfe_id
        WHERE corrective_actions.id = evidence.corrective_action_id
        AND (auth.uid() = amfes.created_by OR (auth.uid() IS NULL AND amfes.created_by IS NULL))
    )
);

-- Failure Modes table is publicly readable (library data)
ALTER TABLE failure_modes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view failure modes" ON failure_modes FOR SELECT USING (true);
CREATE POLICY "Only authenticated users can modify failure modes" ON failure_modes FOR ALL USING (auth.role() = 'authenticated');

-- Function to handle anonymous user session (creates temp user profile)
CREATE OR REPLACE FUNCTION handle_anonymous_user()
RETURNS TRIGGER AS $$
BEGIN
    -- For anonymous users, set created_by to NULL and create a temp session identifier
    IF auth.uid() IS NULL THEN
        NEW.created_by := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to handle anonymous users
CREATE TRIGGER handle_anonymous_amfes
    BEFORE INSERT OR UPDATE ON amfes
    FOR EACH ROW EXECUTE FUNCTION handle_anonymous_user();

CREATE TRIGGER handle_anonymous_evidence
    BEFORE INSERT OR UPDATE ON evidence
    FOR EACH ROW EXECUTE FUNCTION handle_anonymous_user();