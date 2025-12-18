-- Add api_key column to teams table
alter table public.teams
add column api_key uuid not null default gen_random_uuid();

-- Create a unique index on the api_key
create unique index if not exists teams_api_key_idx on public.teams (api_key);

-- Create a function to regenerate the api_key for a team
create or replace function regenerate_api_key(p_team_id int)
returns uuid
language plpgsql
security definer -- grants the function the permissions of the user that created it
as $$
declare
  new_key uuid;
begin
  if not exists (select 1 from team_users where team_id = p_team_id and user_id = auth.uid() and role = 'ADMIN') then
    raise exception 'Only admins can regenerate API keys.';
  end if;

  update public.teams
  set api_key = gen_random_uuid()
  where id = p_team_id
  returning api_key into new_key;
  
  return new_key;
end;
$$;
