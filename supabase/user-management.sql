create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  full_name text not null,
  role text not null check (role in ('admin', 'editor', 'viewer')),
  password_hash text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.app_users(id) on delete set null,
  actor_username text,
  action text not null,
  entity_type text not null,
  entity_id text,
  description text not null,
  metadata jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.project_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  role text not null check (role in ('editor', 'viewer')),
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, project_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_app_users_updated_at on public.app_users;

create trigger trg_app_users_updated_at
before update on public.app_users
for each row
execute function public.set_updated_at();

alter table public.app_users enable row level security;
alter table public.audit_logs enable row level security;
alter table public.project_memberships enable row level security;

-- No RLS policies are created on purpose.
-- The application should access these tables only through the server-side
-- SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS safely.
