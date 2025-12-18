-- Best practice: Use CREATE OR REPLACE to avoid dropping the function if it exists.
-- This also preserves dependencies, which was the cause of the previous error.
CREATE OR REPLACE FUNCTION public.get_teams_for_user()
RETURNS TABLE(id bigint, name text, role public.app_role, api_key text)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    t.id,
    t.name,
    tu.role,
    t.api_key
  FROM
    public.teams t
  JOIN
    public.team_users tu ON t.id = tu.team_id
  WHERE
    tu.user_id = auth.uid();
$$;
