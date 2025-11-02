-- Migration Safety Procedures
-- Additional safety measures for schema changes and migrations

-- =============================================================================
-- MIGRATION LOCKING AND CONCURRENCY CONTROL
-- =============================================================================

-- Migration lock table to prevent concurrent migrations
CREATE TABLE IF NOT EXISTS migration_locks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    migration_name TEXT NOT NULL UNIQUE,
    locked_by UUID REFERENCES user_profiles(id),
    locked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    lock_expires_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'active' -- 'active', 'completed', 'failed'
);

-- Function to acquire migration lock
CREATE OR REPLACE FUNCTION acquire_migration_lock(migration_name TEXT, lock_duration_minutes INTEGER DEFAULT 30)
RETURNS BOOLEAN AS $$
DECLARE
    lock_acquired BOOLEAN := FALSE;
    existing_lock RECORD;
BEGIN
    -- Check if migration is already locked
    SELECT * INTO existing_lock
    FROM migration_locks
    WHERE migration_name = migration_name
    AND status = 'active'
    AND (lock_expires_at IS NULL OR lock_expires_at > NOW());

    IF found THEN
        -- Migration is already locked
        RETURN FALSE;
    END IF;

    -- Acquire new lock
    INSERT INTO migration_locks (migration_name, locked_by, locked_at, lock_expires_at, status)
    VALUES (migration_name, auth.uid(), NOW(), NOW() + INTERVAL '1 minute' * lock_duration_minutes, 'active');

    lock_acquired := TRUE;
    RETURN lock_acquired;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to acquire migration lock: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to release migration lock
CREATE OR REPLACE FUNCTION release_migration_lock(migration_name TEXT, success BOOLEAN DEFAULT TRUE)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE migration_locks
    SET status = CASE WHEN success THEN 'completed' ELSE 'failed' END,
        lock_expires_at = NOW()
    WHERE migration_name = migration_name
    AND status = 'active';

    RETURN FOUND;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to release migration lock: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- SCHEMA VALIDATION
-- =============================================================================

-- Function to validate schema integrity
CREATE OR REPLACE FUNCTION validate_schema_integrity()
RETURNS TABLE (
    table_name TEXT,
    validation_type TEXT,
    status TEXT,
    details TEXT
) AS $$
DECLARE
    validation_result RECORD;
BEGIN
    -- Check required tables exist
    CREATE TEMPORARY TABLE IF NOT EXISTS required_tables (table_name TEXT);
    INSERT INTO required_tables VALUES
        ('amfes'), ('amfe_items'), ('corrective_actions'), ('evidence'),
        ('user_profiles'), ('failure_modes');

    FOR validation_result IN
        SELECT
            rt.table_name,
            'table_exists' as validation_type,
            CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = rt.table_name)
                 THEN 'PASS' ELSE 'FAIL' END as status,
            CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = rt.table_name)
                 THEN 'Table exists' ELSE 'Table missing' END as details
        FROM required_tables rt
    LOOP
        RETURN NEXT validation_result;
    END LOOP;

    -- Check RLS is enabled on required tables
    FOR validation_result IN
        SELECT
            schemaname||'.'||tablename as table_name,
            'rls_enabled' as validation_type,
            CASE WHEN rowsecurity THEN 'PASS' ELSE 'FAIL' END as status,
            CASE WHEN rowsecurity THEN 'RLS enabled' ELSE 'RLS not enabled' END as details
        FROM pg_tables
        WHERE tablename IN ('amfes', 'amfe_items', 'corrective_actions', 'evidence', 'user_profiles')
        AND schemaname = 'public'
    LOOP
        RETURN NEXT validation_result;
    END LOOP;

    -- Check foreign key constraints
    FOR validation_result IN
        SELECT
            tc.table_name,
            'foreign_key' as validation_type,
            'PASS' as status,
            'FK constraint present: ' || tc.constraint_name as details
        FROM information_schema.table_constraints tc
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
    LOOP
        RETURN NEXT validation_result;
    END LOOP;

    DROP TABLE IF EXISTS required_tables;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- DATA INTEGRITY CHECKS
-- =============================================================================

-- Function to check data integrity
CREATE OR REPLACE FUNCTION check_data_integrity()
RETURNS TABLE (
    check_name TEXT,
    status TEXT,
    issue_count BIGINT,
    description TEXT
) AS $$
DECLARE
    integrity_result RECORD;
BEGIN
    -- Check for orphaned amfe_items
    SELECT
        'orphaned_amfe_items' as check_name,
        CASE WHEN COUNT(*) > 0 THEN 'FAIL' ELSE 'PASS' END as status,
        COUNT(*) as issue_count,
        'AMFE items without parent AMFE' as description
    INTO integrity_result
    FROM amfe_items ai
    LEFT JOIN amfes a ON ai.amfe_id = a.id
    WHERE a.id IS NULL;

    RETURN NEXT integrity_result;

    -- Check for orphaned corrective_actions
    SELECT
        'orphaned_corrective_actions' as check_name,
        CASE WHEN COUNT(*) > 0 THEN 'FAIL' ELSE 'PASS' END as status,
        COUNT(*) as issue_count,
        'Corrective actions without parent AMFE item' as description
    INTO integrity_result
    FROM corrective_actions ca
    LEFT JOIN amfe_items ai ON ca.amfe_item_id = ai.id
    WHERE ai.id IS NULL;

    RETURN NEXT integrity_result;

    -- Check for orphaned evidence
    SELECT
        'orphaned_evidence' as check_name,
        CASE WHEN COUNT(*) > 0 THEN 'FAIL' ELSE 'PASS' END as status,
        COUNT(*) as issue_count,
        'Evidence without parent corrective action' as description
    INTO integrity_result
    FROM evidence e
    LEFT JOIN corrective_actions ca ON e.corrective_action_id = ca.id
    WHERE ca.id IS NULL;

    RETURN NEXT integrity_result;

    -- Check for invalid NPR calculations
    SELECT
        'invalid_npr_calculations' as check_name,
        CASE WHEN COUNT(*) > 0 THEN 'FAIL' ELSE 'PASS' END as status,
        COUNT(*) as issue_count,
        'AMFE items with incorrect NPR calculations' as description
    INTO integrity_result
    FROM amfe_items
    WHERE npr != (severity * occurrence * detection);

    RETURN NEXT integrity_result;

    -- Check for users without profiles
    SELECT
        'users_without_profiles' as check_name,
        CASE WHEN COUNT(*) > 0 THEN 'WARNING' ELSE 'PASS' END as status,
        COUNT(*) as issue_count,
        'Authenticated users without user profiles' as description
    INTO integrity_result
    FROM auth.users u
    LEFT JOIN user_profiles up ON u.id = up.id
    WHERE u.id IS NOT NULL
    AND up.id IS NULL;

    RETURN NEXT integrity_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- SAFE MIGRATION TEMPLATES
-- =============================================================================

-- Template for safe column addition
CREATE OR REPLACE FUNCTION safe_add_column(table_name TEXT, column_name TEXT, column_type TEXT, default_value TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    full_migration_name TEXT;
    backup_timestamp TEXT;
BEGIN
    -- Validate inputs
    IF table_name NOT IN ('amfes', 'amfe_items', 'corrective_actions', 'evidence', 'user_profiles', 'failure_modes') THEN
        RAISE EXCEPTION 'Invalid table name: %', table_name;
    END IF;

    -- Create migration identifier
    full_migration_name := 'add_column_' || table_name || '_' || column_name;

    -- Acquire lock
    IF NOT acquire_migration_lock(full_migration_name) THEN
        RAISE EXCEPTION 'Migration already in progress: %', full_migration_name;
    END IF;

    BEGIN
        -- Create backup
        backup_timestamp := TO_CHAR(NOW(), 'YYYY-MM-DD_HH24-MI-SS');
        PERFORM create_table_backup(table_name);

        -- Add column safely
        IF default_value IS NOT NULL THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS %I %I DEFAULT %s;',
                          table_name, column_name, column_type, default_value);
        ELSE
            EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS %I %I;',
                          table_name, column_name, column_type);
        END IF;

        -- Validate schema
        PERFORM * FROM validate_schema_integrity();

        -- Release lock with success
        PERFORM release_migration_lock(full_migration_name, TRUE);

        RETURN TRUE;

    EXCEPTION WHEN OTHERS THEN
        -- Rollback and release lock with failure
        PERFORM rollback_to_backup(backup_timestamp);
        PERFORM release_migration_lock(full_migration_name, FALSE);
        RAISE EXCEPTION 'Migration failed and rolled back: %', SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- GRANTS AND SECURITY
-- =============================================================================

-- Migration functions require elevated privileges
GRANT EXECUTE ON FUNCTION acquire_migration_lock(TEXT, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION release_migration_lock(TEXT, BOOLEAN) TO service_role;
GRANT EXECUTE ON FUNCTION safe_add_column(TEXT, TEXT, TEXT, TEXT) TO service_role;

-- Validation functions can be used by authenticated users
GRANT EXECUTE ON FUNCTION validate_schema_integrity() TO authenticated;
GRANT EXECUTE ON FUNCTION check_data_integrity() TO authenticated;

-- Lock table access
GRANT SELECT ON migration_locks TO authenticated;
GRANT ALL ON migration_locks TO service_role;

-- =============================================================================
-- SAMPLE USAGE
-- =============================================================================

/*
-- Validate current schema
SELECT * FROM validate_schema_integrity();

-- Check data integrity
SELECT * FROM check_data_integrity();

-- Safely add a column
SELECT safe_add_column('amfes', 'priority_level', 'INTEGER', '1');

-- Check if a migration is locked
SELECT * FROM migration_locks WHERE status = 'active';
*/