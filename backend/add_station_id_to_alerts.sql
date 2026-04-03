-- PostgreSQL Migration: Add station_id column to alerts table
-- Run this script using psql or pgAdmin

-- Check if column exists first
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'alerts' 
        AND column_name = 'station_id'
    ) THEN
        -- Add station_id column
        ALTER TABLE alerts ADD COLUMN station_id INTEGER;
        RAISE NOTICE 'Column station_id added to alerts table';
    ELSE
        RAISE NOTICE 'Column station_id already exists in alerts table';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'alerts'
ORDER BY ordinal_position;
