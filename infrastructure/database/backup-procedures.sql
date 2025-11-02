-- Database Backup and Recovery Procedures
-- Critical for preventing data loss during schema migrations and operations

-- =============================================================================
-- BACKUP PROCEDURES
-- =============================================================================

-- 1. Automated Backup Function
CREATE OR REPLACE FUNCTION create_full_database_backup()
RETURNS TEXT AS $$
DECLARE
    backup_timestamp TEXT;
    backup_filename TEXT;
    backup_result TEXT;
BEGIN
    -- Generate timestamp for backup filename
    backup_timestamp := TO_CHAR(NOW(), 'YYYY-MM-DD_HH24-MI-SS');
    backup_filename := 'amfe_backup_' || backup_timestamp || '.sql';

    -- Log backup attempt
    INSERT INTO backup_log (backup_type, filename, status, started_at)
    VALUES ('full', backup_filename, 'started', NOW())
    RETURNING id INTO backup_result;

    -- In a real Supabase environment, you would use pg_dump
    -- For this implementation, we create logical backups using SQL

    -- Create backup table structure and data
    EXECUTE format('CREATE TABLE IF NOT EXISTS backup_amfes_%I AS TABLE amfes;', backup_timestamp);
    EXECUTE format('CREATE TABLE IF NOT EXISTS backup_amfe_items_%I AS TABLE amfe_items;', backup_timestamp);
    EXECUTE format('CREATE TABLE IF NOT EXISTS backup_corrective_actions_%I AS TABLE corrective_actions;', backup_timestamp);
    EXECUTE format('CREATE TABLE IF NOT EXISTS backup_evidence_%I AS TABLE evidence;', backup_timestamp);
    EXECUTE format('CREATE TABLE IF NOT EXISTS backup_user_profiles_%I AS TABLE user_profiles;', backup_timestamp);
    EXECUTE format('CREATE TABLE IF NOT EXISTS backup_failure_modes_%I AS TABLE failure_modes;', backup_timestamp);

    -- Update backup log
    UPDATE backup_log
    SET status = 'completed', completed_at = NOW(), record_count = (
        SELECT COUNT(*) FROM amfes
    )
    WHERE id = backup_result::UUID;

    RETURN backup_filename;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Table-specific Backup Function
CREATE OR REPLACE FUNCTION create_table_backup(table_name TEXT)
RETURNS TEXT AS $$
DECLARE
    backup_timestamp TEXT;
    backup_table_name TEXT;
    record_count INTEGER;
BEGIN
    backup_timestamp := TO_CHAR(NOW(), 'YYYY-MM-DD_HH24-MI-SS');
    backup_table_name := 'backup_' || table_name || '_' || backup_timestamp;

    -- Validate table name to prevent SQL injection
    IF table_name NOT IN ('amfes', 'amfe_items', 'corrective_actions', 'evidence', 'user_profiles', 'failure_modes') THEN
        RAISE EXCEPTION 'Invalid table name for backup: %', table_name;
    END IF;

    -- Create backup table
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I AS TABLE %I;', backup_table_name, table_name);

    -- Get record count
    EXECUTE format('SELECT COUNT(*) FROM %I', table_name) INTO record_count;

    -- Log backup
    INSERT INTO backup_log (backup_type, filename, table_name, status, started_at, completed_at, record_count)
    VALUES ('table', backup_table_name, table_name, 'completed', NOW(), NOW(), record_count);

    RETURN backup_table_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Rollback Function
CREATE OR REPLACE FUNCTION rollback_to_backup(backup_timestamp TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    rollback_successful BOOLEAN := FALSE;
    tables_to_rollback TEXT[] := ARRAY['amfes', 'amfe_items', 'corrective_actions', 'evidence', 'user_profiles', 'failure_modes'];
    table_name TEXT;
BEGIN
    -- Validate timestamp format
    IF backup_timestamp !~ '^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$' THEN
        RAISE EXCEPTION 'Invalid backup timestamp format: %', backup_timestamp;
    END IF;

    -- Start transaction for atomic rollback
    BEGIN
        -- Disable foreign key constraints temporarily
        SET session_replication_role = replica;

        -- Truncate current tables
        FOREACH table_name IN ARRAY tables_to_rollback
        LOOP
            EXECUTE format('TRUNCATE TABLE %I CASCADE;', table_name);
        END LOOP;

        -- Restore data from backup tables
        FOREACH table_name IN ARRAY tables_to_rollback
        LOOP
            BEGIN
                EXECUTE format('INSERT INTO %I SELECT * FROM backup_%I_%I;',
                             table_name, table_name, backup_timestamp);
            EXCEPTION WHEN undefined_table THEN
                -- Backup table doesn't exist, continue with others
                CONTINUE;
            END;
        END LOOP;

        -- Re-enable constraints
        SET session_replication_role = DEFAULT;

        -- Log rollback
        INSERT INTO backup_log (backup_type, filename, status, started_at, completed_at)
        VALUES ('rollback', backup_timestamp, 'completed', NOW(), NOW());

        rollback_successful := TRUE;

    EXCEPTION WHEN OTHERS THEN
        -- Rollback on any error
        ROLLBACK;
        SET session_replication_role = DEFAULT;

        -- Log failed rollback
        INSERT INTO backup_log (backup_type, filename, status, started_at, error_message)
        VALUES ('rollback', backup_timestamp, 'failed', NOW(), SQLERRM);

        RAISE;
    END;

    RETURN rollback_successful;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Migration Safety Wrapper
CREATE OR REPLACE FUNCTION safe_migration(migration_function TEXT, create_backup BOOLEAN := TRUE)
RETURNS BOOLEAN AS $$
DECLARE
    backup_timestamp TEXT;
    migration_successful BOOLEAN := FALSE;
BEGIN
    -- Create backup if requested
    IF create_backup THEN
        backup_timestamp := TO_CHAR(NOW(), 'YYYY-MM-DD_HH24-MI-SS');
        PERFORM create_full_database_backup();
    END IF;

    -- Execute migration function
    BEGIN
        EXECUTE 'SELECT ' || migration_function || '()';
        migration_successful := TRUE;

        -- Log successful migration
        INSERT INTO backup_log (backup_type, filename, status, started_at, completed_at)
        VALUES ('migration', migration_function, 'completed', NOW(), NOW());

    EXCEPTION WHEN OTHERS THEN
        -- Migration failed, attempt rollback
        IF create_backup THEN
            PERFORM rollback_to_backup(backup_timestamp);
        END IF;

        -- Log failed migration
        INSERT INTO backup_log (backup_type, filename, status, started_at, error_message)
        VALUES ('migration', migration_function, 'failed', NOW(), SQLERRM);

        RAISE EXCEPTION 'Migration failed and has been rolled back: %', SQLERRM;
    END;

    RETURN migration_successful;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- BACKUP METADATA TABLES
-- =============================================================================

-- Backup log table
CREATE TABLE IF NOT EXISTS backup_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    backup_type TEXT NOT NULL, -- 'full', 'table', 'rollback', 'migration'
    filename TEXT,
    table_name TEXT,
    status TEXT NOT NULL, -- 'started', 'completed', 'failed'
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    record_count INTEGER,
    file_size_bytes BIGINT,
    error_message TEXT,
    created_by UUID REFERENCES user_profiles(id)
);

-- Backup retention policy
CREATE OR REPLACE FUNCTION cleanup_old_backups(retention_days INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete backup tables older than retention period
    WITH old_backups AS (
        SELECT
            CASE
                WHEN backup_type = 'table' THEN filename
                ELSE NULL
            END as table_name
        FROM backup_log
        WHERE started_at < NOW() - INTERVAL '1 day' * retention_days
        AND backup_type IN ('table', 'full')
    )
    DELETE FROM backup_log
    WHERE started_at < NOW() - INTERVAL '1 day' * retention_days
    AND backup_type IN ('table', 'full')
    RETURNING id INTO deleted_count;

    -- In a real implementation, you would also delete the actual backup tables/files
    -- For now, we just log the cleanup

    RETURN COALESCE(deleted_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- MONITORING AND ALERTS
-- =============================================================================

-- Function to check backup health
CREATE OR REPLACE FUNCTION backup_health_check()
RETURNS TABLE (
    backup_status TEXT,
    last_backup TIMESTAMP WITH TIME ZONE,
    backup_count_today INTEGER,
    failed_backups INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        CASE
            WHEN MAX(bl.started_at) > NOW() - INTERVAL '24 hours' THEN 'HEALTHY'
            WHEN MAX(bl.started_at) > NOW() - INTERVAL '48 hours' THEN 'WARNING'
            ELSE 'CRITICAL'
        END as backup_status,
        MAX(bl.started_at) as last_backup,
        COUNT(*) FILTER (WHERE DATE(bl.started_at) = CURRENT_DATE) as backup_count_today,
        COUNT(*) FILTER (WHERE bl.status = 'failed' AND bl.started_at > NOW() - INTERVAL '7 days') as failed_backups
    FROM backup_log bl
    WHERE bl.backup_type IN ('full', 'table')
    AND bl.started_at > NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Automated backup scheduler (placeholder for cron job)
CREATE OR REPLACE FUNCTION schedule_daily_backup()
RETURNS TEXT AS $$
DECLARE
    backup_filename TEXT;
BEGIN
    -- This function should be called by a cron job or scheduler
    backup_filename := create_full_database_backup();

    -- Send alert if backup failed (in real implementation)
    IF backup_filename IS NULL THEN
        -- Send alert to administrators
        RAISE WARNING 'Daily backup failed';
    END IF;

    RETURN backup_filename;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- GRANTS AND SECURITY
-- =============================================================================

-- Only authenticated users can create backups
GRANT EXECUTE ON FUNCTION create_full_database_backup() TO authenticated;
GRANT EXECUTE ON FUNCTION create_table_backup(TEXT) TO authenticated;

-- Only service role can perform rollbacks and migrations
GRANT EXECUTE ON FUNCTION rollback_to_backup(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION safe_migration(TEXT, BOOLEAN) TO service_role;

-- Authenticated users can view backup logs
GRANT SELECT ON backup_log TO authenticated;
GRANT EXECUTE ON FUNCTION backup_health_check() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_backups(INTEGER) TO service_role;

-- =============================================================================
-- SAMPLE USAGE
-- =============================================================================

/*
-- Create a full backup
SELECT create_full_database_backup();

-- Backup specific table
SELECT create_table_backup('amfes');

-- Perform a safe migration with automatic backup
SELECT safe_migration('my_migration_function', true);

-- Rollback to a specific backup (use with caution!)
SELECT rollback_to_backup('2025-01-12_14-30-45');

-- Check backup health
SELECT * FROM backup_health_check();

-- Clean up old backups
SELECT cleanup_old_backups(30);
*/