
-- This function retrieves all members for a given team, including their emails.
-- It is a SECURITY DEFINER function, which is necessary to access the auth.users table.
-- It first verifies that the calling user is an ADMIN of the specified team before returning any data.
CREATE OR REPLACE FUNCTION public.get_team_members_with_emails(p_team_id bigint)
RETURNS TABLE(user_id uuid, email text, role public.app_role)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin boolean;
BEGIN
  -- Check if the current user is an admin of the specified team.
  -- Note: We use auth.uid() which is the id of the user calling the function.
  SELECT EXISTS (
    SELECT 1
    FROM team_users tu
    WHERE tu.team_id = p_team_id
      AND tu.user_id = auth.uid()
      AND tu.role = 'ADMIN'
  ) INTO is_admin;

  -- If the user is an admin, return the team members' details.
  IF is_admin THEN
    RETURN QUERY
    SELECT
      tu.user_id,
      au.email,
      tu.role
    FROM
      public.team_users tu
    JOIN
      auth.users au ON tu.user_id = au.id
    WHERE
      tu.team_id = p_team_id;
  END IF;
END;
$$;
