-- Drop existing policies on team_users
DROP POLICY IF EXISTS "Users can view memberships of their own teams" ON public.team_users;
DROP POLICY IF EXISTS "Admins can manage members of their own teams" ON public.team_users;

-- Create a new, simpler policy for team_users
CREATE POLICY "Users can view their own team memberships"
ON public.team_users
FOR SELECT
USING (auth.uid() = user_id);

-- Drop the existing policy on teams
DROP POLICY IF EXISTS "Users can view and manage teams they belong to" ON public.teams;

-- Create a new policy for teams
CREATE POLICY "Users can view teams they are a member of"
ON public.teams
FOR SELECT
USING (id IN (SELECT team_id FROM public.team_users WHERE user_id = auth.uid()));


-- New function to efficiently get team members with emails
-- This function is SECURITY DEFINER, meaning it runs with the privileges of the user who defined it (the postgres superuser).
-- This allows it to bypass RLS and join with the auth.users table to fetch emails,
-- but it can only be called by authenticated users and is restricted by the logic inside.
CREATE OR REPLACE FUNCTION get_team_members_with_emails(p_team_id bigint)
RETURNS TABLE (
  user_id uuid,
  role public.app_role,
  email text
)
SECURITY DEFINER
AS $$
BEGIN
  -- Security check: Ensure the calling user is an admin of the team they are requesting.
  -- This prevents a member of one team from listing members of another team.
  IF NOT EXISTS (
    SELECT 1
    FROM public.team_users tu
    WHERE tu.team_id = p_team_id
      AND tu.user_id = auth.uid()
      AND tu.role = 'ADMIN'
  ) THEN
    RAISE EXCEPTION 'You do not have permission to view members for this team.';
  END IF;

  -- If the security check passes, return the team members with their emails.
  RETURN QUERY
  SELECT
    tu.user_id,
    tu.role,
    u.email
  FROM public.team_users tu
  JOIN auth.users u ON tu.user_id = u.id
  WHERE tu.team_id = p_team_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the new function to authenticated users
GRANT EXECUTE ON FUNCTION public.get_team_members_with_emails(bigint) TO authenticated;
