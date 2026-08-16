-- MawaHub starter schema for Supabase/PostgreSQL.
-- Apply through a controlled migration process in production.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  country text,
  phone text,
  role text not null default 'customer' check (role in ('customer','seller','donor','moderator','finance','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.sellers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  business_name text not null,
  country text not null,
  category text,
  tier text not null default 'community' check (tier in ('community','pro','partner')),
  verification_status text not null default 'pending' check (verification_status in ('pending','verified','rejected','suspended')),
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers(id) on delete cascade,
  name text not null,
  description text,
  category text not null,
  price numeric(14,2) not null check (price >= 0),
  currency text not null default 'KES',
  stock integer not null default 0 check (stock >= 0),
  status text not null default 'draft' check (status in ('draft','published','paused','archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id),
  status text not null default 'pending' check (status in ('pending','paid','processing','shipped','delivered','cancelled','refunded','disputed')),
  currency text not null default 'KES',
  total numeric(14,2) not null default 0 check (total >= 0),
  delivery_address text,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null check (quantity > 0),
  unit_price numeric(14,2) not null check (unit_price >= 0)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  donation_id uuid,
  provider text not null,
  provider_reference text unique,
  amount numeric(14,2) not null check (amount > 0),
  currency text not null,
  status text not null default 'pending' check (status in ('pending','confirmed','failed','refunded')),
  created_at timestamptz not null default now()
);

create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  provider text not null,
  country text,
  destination_label text,
  enabled boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid references public.profiles(id) on delete set null,
  fund text not null,
  frequency text not null default 'one_time' check (frequency in ('one_time','monthly')),
  amount numeric(14,2) not null check (amount > 0),
  currency text not null,
  status text not null default 'pending' check (status in ('pending','confirmed','failed','refunded')),
  provider_reference text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.impact_projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pillar text not null,
  country text,
  status text not null default 'planned' check (status in ('planned','active','completed','paused')),
  lives_impacted integer not null default 0 check (lives_impacted >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  report_type text not null,
  period text,
  storage_path text,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.safeguarding_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_name text,
  reporter_contact text,
  country text,
  urgency text not null default 'standard' check (urgency in ('standard','urgent','emergency')),
  summary text not null,
  status text not null default 'new' check (status in ('new','reviewing','referred','closed')),
  created_at timestamptz not null default now()
);

-- IMPORTANT: Enable RLS and add production policies before exposing tables to a client.
-- Safeguarding reports must have stricter policies than ordinary user data.
alter table public.profiles enable row level security;
alter table public.sellers enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.payment_methods enable row level security;
alter table public.donations enable row level security;
alter table public.impact_projects enable row level security;
alter table public.reports enable row level security;
alter table public.safeguarding_reports enable row level security;
