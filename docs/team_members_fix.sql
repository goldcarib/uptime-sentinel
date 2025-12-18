
-- This function securely fetches team members and their emails for a given team.
-- It should be called by a trusted server-side client (e.g., using the service_role_key).
create or replace function public.get_team_members_with_emails(p_team_id bigint)
returns table (user_id uuid, email text, role public.app_role)
language sql
security definer
set search_path = public
as $$
    select
        tu.user_id,
        au.email,
        tu.role
    from
        public.team_users tu
    join
        auth.users au on tu.user_id = au.id
    where
        tu.team_id = p_team_id;
$$;

grant execute on function public.get_team_members_with_emails(bigint) to service_role;
