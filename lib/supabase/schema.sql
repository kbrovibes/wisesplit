-- wisesplit Supabase schema. Run this in the SQL editor of a fresh project.
-- Idempotent where reasonable.

create extension if not exists "pgcrypto";

-- profiles, owned 1:1 with auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  email text,
  default_currency text not null default 'USD',
  created_at timestamptz not null default now()
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null default 'indigo',
  icon text not null default 'sparkles',
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table if not exists public.friends (
  user_id uuid not null references auth.users(id) on delete cascade,
  friend_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, friend_user_id),
  check (user_id <> friend_user_id)
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete set null,
  paid_by uuid not null references auth.users(id) on delete cascade,
  amount_cents bigint not null check (amount_cents >= 0),
  currency text not null default 'USD',
  description text not null,
  category text,
  tags text[] not null default '{}',
  occurred_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists expenses_group_idx on public.expenses(group_id);
create index if not exists expenses_paid_by_idx on public.expenses(paid_by);
create index if not exists expenses_occurred_at_idx on public.expenses(occurred_at desc);

create table if not exists public.splits (
  expense_id uuid not null references public.expenses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  share_cents bigint not null,
  share_type text not null default 'equal',
  share_value numeric,
  primary key (expense_id, user_id)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references auth.users(id) on delete cascade,
  to_user uuid not null references auth.users(id) on delete cascade,
  amount_cents bigint not null check (amount_cents > 0),
  currency text not null default 'USD',
  note text,
  occurred_at timestamptz not null default now(),
  group_id uuid references public.groups(id) on delete set null
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses(id) on delete cascade,
  author uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

-- ===== Row-Level Security =====
alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.friends enable row level security;
alter table public.expenses enable row level security;
alter table public.splits enable row level security;
alter table public.payments enable row level security;
alter table public.comments enable row level security;

-- helper: am I a member of a group?
create or replace function public.is_group_member(g uuid)
returns boolean language sql security definer stable as $$
  select exists (select 1 from public.group_members where group_id = g and user_id = auth.uid())
$$;

-- profiles: a user reads any profile (display name only is exposed via the row);
--            inserts/updates only own row.
drop policy if exists "profiles select" on public.profiles;
create policy "profiles select" on public.profiles for select using (true);
drop policy if exists "profiles upsert self" on public.profiles;
create policy "profiles upsert self" on public.profiles for insert with check (id = auth.uid());
drop policy if exists "profiles update self" on public.profiles;
create policy "profiles update self" on public.profiles for update using (id = auth.uid());

-- groups: visible to members or creator
drop policy if exists "groups select members" on public.groups;
create policy "groups select members" on public.groups for select
  using (created_by = auth.uid() or public.is_group_member(id));
drop policy if exists "groups insert self" on public.groups;
create policy "groups insert self" on public.groups for insert with check (created_by = auth.uid());
drop policy if exists "groups update creator" on public.groups;
create policy "groups update creator" on public.groups for update using (created_by = auth.uid());

-- group_members
drop policy if exists "members select self/group" on public.group_members;
create policy "members select self/group" on public.group_members for select
  using (user_id = auth.uid() or public.is_group_member(group_id));
drop policy if exists "members insert self" on public.group_members;
create policy "members insert self" on public.group_members for insert with check (user_id = auth.uid() or public.is_group_member(group_id));
drop policy if exists "members delete self" on public.group_members;
create policy "members delete self" on public.group_members for delete using (user_id = auth.uid());

-- friends
drop policy if exists "friends select self" on public.friends;
create policy "friends select self" on public.friends for select using (user_id = auth.uid() or friend_user_id = auth.uid());
drop policy if exists "friends insert self" on public.friends;
create policy "friends insert self" on public.friends for insert with check (user_id = auth.uid());
drop policy if exists "friends delete self" on public.friends;
create policy "friends delete self" on public.friends for delete using (user_id = auth.uid());

-- expenses: visible if you're paid_by, created_by, a split participant, or in the group
drop policy if exists "expenses select participants" on public.expenses;
create policy "expenses select participants" on public.expenses for select using (
  paid_by = auth.uid() or created_by = auth.uid()
  or (group_id is not null and public.is_group_member(group_id))
  or exists (select 1 from public.splits s where s.expense_id = expenses.id and s.user_id = auth.uid())
);
drop policy if exists "expenses insert self" on public.expenses;
create policy "expenses insert self" on public.expenses for insert with check (created_by = auth.uid());
drop policy if exists "expenses update creator" on public.expenses;
create policy "expenses update creator" on public.expenses for update using (created_by = auth.uid());
drop policy if exists "expenses delete creator" on public.expenses;
create policy "expenses delete creator" on public.expenses for delete using (created_by = auth.uid());

-- splits
drop policy if exists "splits select via expense" on public.splits;
create policy "splits select via expense" on public.splits for select using (
  user_id = auth.uid() or exists (
    select 1 from public.expenses e where e.id = splits.expense_id
      and (e.paid_by = auth.uid() or e.created_by = auth.uid()
        or (e.group_id is not null and public.is_group_member(e.group_id)))
  )
);
drop policy if exists "splits write via expense" on public.splits;
create policy "splits write via expense" on public.splits for all
  using (exists (select 1 from public.expenses e where e.id = splits.expense_id and e.created_by = auth.uid()))
  with check (exists (select 1 from public.expenses e where e.id = splits.expense_id and e.created_by = auth.uid()));

-- payments
drop policy if exists "payments select participants" on public.payments;
create policy "payments select participants" on public.payments for select using (from_user = auth.uid() or to_user = auth.uid());
drop policy if exists "payments insert self" on public.payments;
create policy "payments insert self" on public.payments for insert with check (from_user = auth.uid() or to_user = auth.uid());

-- comments
drop policy if exists "comments select via expense" on public.comments;
create policy "comments select via expense" on public.comments for select using (
  exists (select 1 from public.expenses e where e.id = comments.expense_id
    and (e.paid_by = auth.uid() or e.created_by = auth.uid()
      or (e.group_id is not null and public.is_group_member(e.group_id))))
);
drop policy if exists "comments insert self" on public.comments;
create policy "comments insert self" on public.comments for insert with check (author = auth.uid());

-- ===== auto-create a profile when a new auth.user appears =====
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  ) on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
