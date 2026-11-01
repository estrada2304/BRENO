create table public.workspace_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.workspace_data enable row level security;
revoke all on table public.workspace_data from anon, public;
grant select, insert, update, delete on table public.workspace_data to authenticated;

create policy "Users manage their own BRENO workspace"
  on public.workspace_data
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
