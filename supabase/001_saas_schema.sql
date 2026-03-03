-- 001_saas_schema.sql
-- PostgreSQL native schema (Supabase bagimliligi yok)
-- Auth, session ve yetkilendirme n8n tarafindan yonetilir.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'plan_type_enum') then
    create type plan_type_enum as enum ('trial', 'premium', 'ultimate');
  end if;
  if not exists (select 1 from pg_type where typname = 'company_status_enum') then
    create type company_status_enum as enum ('active', 'pending');
  end if;
  if not exists (select 1 from pg_type where typname = 'process_type_enum') then
    create type process_type_enum as enum ('OCR', 'Gemini', 'Storage');
  end if;
  if not exists (select 1 from pg_type where typname = 'user_role_enum') then
    create type user_role_enum as enum ('admin', 'manager', 'staff');
  end if;
end $$;

create table if not exists companies (
  id bigserial primary key,
  name text not null,
  plan_type plan_type_enum not null default 'trial',
  monthly_limit integer not null default 20,
  extra_credits integer not null default 0,
  used_this_month integer not null default 0,
  status company_status_enum not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  company_id bigint not null references companies(id) on delete cascade,
  full_name text,
  email text not null unique,
  password_hash text not null,
  role user_role_enum not null default 'staff',
  telegram_id text unique,
  is_super_admin boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists user_sessions (
  id bigserial primary key,
  user_id uuid not null references users(id) on delete cascade,
  session_key text not null unique,
  user_agent text,
  ip_address inet,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists idx_user_sessions_user_id on user_sessions(user_id);
create index if not exists idx_user_sessions_session_key on user_sessions(session_key);
create index if not exists idx_user_sessions_active on user_sessions(expires_at, revoked_at);

create table if not exists api_usage_logs (
  id bigserial primary key,
  company_id bigint not null references companies(id) on delete cascade,
  process_type process_type_enum not null,
  token_count integer not null default 0,
  estimated_cost numeric(12, 6) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_api_usage_logs_company_date on api_usage_logs(company_id, created_at desc);

create table if not exists receipts (
  id uuid primary key default gen_random_uuid(),
  company_id bigint not null references companies(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  business_name text,
  category text,
  total_amount numeric(12, 2) not null default 0,
  image_url text,
  ocr_raw_text text,
  ai_json jsonb,
  status text not null default 'processed',
  created_at timestamptz not null default now()
);

create index if not exists idx_receipts_company_date on receipts(company_id, created_at desc);
create index if not exists idx_receipts_user_date on receipts(user_id, created_at desc);

create table if not exists storage_usage_daily (
  id bigserial primary key,
  usage_date date not null,
  used_gb numeric(10, 3) not null default 0,
  total_gb numeric(10, 3) not null default 0,
  unique(usage_date)
);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_companies_updated_at on companies;
create trigger trg_companies_updated_at
before update on companies
for each row execute function set_updated_at();

drop trigger if exists trg_users_updated_at on users;
create trigger trg_users_updated_at
before update on users
for each row execute function set_updated_at();

create or replace function create_trial_company_and_admin(
  p_company_name text,
  p_email text,
  p_password_hash text,
  p_telegram_id text default null
)
returns uuid
language plpgsql
as $$
declare
  v_company_id bigint;
  v_user_id uuid;
begin
  insert into companies (name, plan_type, monthly_limit, extra_credits, used_this_month, status)
  values (coalesce(nullif(trim(p_company_name), ''), 'Yeni Sirket'), 'trial', 20, 0, 0, 'pending')
  returning id into v_company_id;

  insert into users (company_id, email, password_hash, role, telegram_id, is_super_admin, is_active)
  values (v_company_id, lower(trim(p_email)), p_password_hash, 'admin', p_telegram_id, false, true)
  returning id into v_user_id;

  return v_user_id;
end;
$$;

create or replace function check_company_quota(p_company_id bigint)
returns boolean
language sql
stable
as $$
  select used_this_month < (monthly_limit + extra_credits)
  from companies
  where id = p_company_id
$$;

create or replace function increment_company_usage(p_company_id bigint, p_count integer default 1)
returns void
language sql
as $$
  update companies
  set used_this_month = used_this_month + greatest(p_count, 0)
  where id = p_company_id
$$;

create or replace function reset_monthly_usage()
returns void
language sql
as $$
  update companies
  set used_this_month = 0
$$;
