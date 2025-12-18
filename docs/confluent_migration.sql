
-- Add columns to the teams table for Confluent integration settings
ALTER TABLE public.teams
ADD COLUMN confluent_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN confluent_rest_endpoint TEXT,
ADD COLUMN confluent_api_key TEXT,
ADD COLUMN confluent_api_secret TEXT;

-- Add columns to the checks table for more detailed logging
ALTER TABLE public.checks
ADD COLUMN reason TEXT,
ADD COLUMN location TEXT,
ADD COLUMN host TEXT;

-- Create a function to get check data from the last minute for a specific team
CREATE OR REPLACE FUNCTION get_recent_checks_for_team(p_team_id BIGINT)
RETURNS TABLE (
    timestamp_ms BIGINT,
    check_id BIGINT,
    target_url TEXT,
    latency_ms INT,
    http_status_code INT,
    error_flag BOOLEAN,
    check_location TEXT,
    host_ip_or_name TEXT,
    check_result_message TEXT,
    tags TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (EXTRACT(EPOCH FROM c.created_at) * 1000)::BIGINT AS timestamp_ms,
        c.id AS check_id,
        w.url AS target_url,
        c.response_time AS latency_ms,
        -- Extract status code from reason, default to 0/500 for up/down
        (CASE
            WHEN c.status = 'up' THEN COALESCE(substring(c.reason from '\((\d{3})\)')::INT, 200)
            ELSE COALESCE(substring(c.reason from '\((\d{3})\)')::INT, 500)
        END) AS http_status_code,
        (c.status = 'down') AS error_flag,
        c.location AS check_location,
        c.host AS host_ip_or_name,
        c.reason AS check_result_message,
        ARRAY['prod', 'auth_service', 'critical']::TEXT[] AS tags -- Placeholder tags as requested
    FROM
        public.checks c
    JOIN
        public.websites w ON c.website_id = w.id
    WHERE
        w.team_id = p_team_id
        AND c.created_at >= NOW() - INTERVAL '1 minute';
END;
$$ LANGUAGE plpgsql;
