
CREATE OR REPLACE FUNCTION get_due_websites()
RETURNS SETOF websites AS $$
BEGIN
  RETURN QUERY
    SELECT *
    FROM websites
    WHERE
      status = 'pending' OR
      last_checked IS NULL OR
      now() > (last_checked + make_interval(mins => check_interval));
END;
$$ LANGUAGE plpgsql;
