-- src/lib/sql/002-fix-due-websites-function.sql

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS get_due_websites();

-- Recreate the function with the corrected logic
CREATE OR REPLACE FUNCTION get_due_websites()
RETURNS SETOF websites AS $$
BEGIN
  RETURN QUERY 
  SELECT *
  FROM websites
  WHERE status <> 'pending' AND last_checked IS NOT NULL AND last_checked + (check_interval * interval '1 minute') <= now()
  ORDER BY last_checked ASC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql;
