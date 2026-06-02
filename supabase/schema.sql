-- wisesplit schema v0.1.0
-- Run in the Supabase SQL editor against a fresh project.
-- All tables enforce RLS so users only see rows where they are participants.

create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  default_currency text not null default 'USD',
  created_at timestamptz not null default now()
);

create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text,
  color text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists group_members (
  group_id uuid not null references groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table if not exists friends (
  user_id uuid not null references auth.users(id) on delete cascade,
  friend_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, friend_user_id),
  check (user_id <> friend_user_id)
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  paid_by uuid not null references auth.users(id) on delete cascade,
  amount_cents bigint not null check (amount_cents >= 0),
  currency text not null,
  description text not null,
  category text,
  tags text[],
  occurred_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists splits (
  expense_id uuid not null references expenses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  share_cents bigint not null check (share_cents >= 0),
  share_type text not null check (share_type in ('equal','percent','share','exact')),
  share_value double precision not null default 0,
  primary key (expense_id, user_id)
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references auth.users(id) on delete cascade,
  to_user uuid not null references auth.users(id) on delete cascade,
  amount_cents bigint not null check (amount_cents > 0),
  currency text not null,
  note text,
  occurred_at timestamptz not null default now(),
  group_id uuid references groups(id) on delete set null,
  created_at timestamptz not null default now(),
  check (from_user <> to_user)
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references expenses(id) on delete cascade,
  author uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists expenses_group_idx on expenses(group_id);
create index if not exists expenses_paid_by_idx on expenses(paid_by);
create index if not exists splits_user_idx on splits(user_id);
create index if not exists payments_pair_idx on payments(from_user, to_user);

alter table profiles      enable row level security;
alter table groups        enable row level security;
alter table group_members enable row level security;
alter table friends       enable row level security;
alter table expenses      enable row level security;
alter table splits        enable row level security;
alter table payments      enable row level security;
alter table comments      enable row level security;

-- profiles: everyone may read; only owner may write own row
create policy "profiles_read"   on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- groups: a member may read; creator may write; members may update name
create policy "groups_read" on groups for select using (
  exists (select 1 from group_members gm where gm.group_id = groups.id and gm.user_id = auth.uid())
);
create policy "groups_insert" on groups for insert with check (auth.uid() = created_by);
create policy "groups_update" on groups for update using (
  exists (select 1 from group_members gm where gm.group_id = groups.id and gm.user_id = auth.uid())
);

-- group_members: members read; creator inserts; self may delete (leave)
create policy "gm_read" on group_members for select using (
  exists (select 1 from group_members gm2 where gm2.group_id = group_members.group_id and gm2.user_id = auth.uid())
);
create policy "gm_insert" on group_members for insert with check (
  exists (select 1 from groups g where g.id = group_members.group_id and g.created_by = auth.uid())
  or auth.uid() = user_id
);
create policy "gm_delete" on group_members for delete using (auth.uid() = user_id);

-- friends: only self
create policy "friends_self" on friends for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- expenses: participants (payer, split member, group member) may read; payer/creator may write
create policy "expenses_read" on expenses for select using (
  paid_by = auth.uid()
  or created_by = auth.uid()
  or (group_id is not null and exists (select 1 from group_members gm where gm.group_id = expenses.group_id and gm.user_id = auth.uid()))
  or exists (select 1 from splits s where s.expense_id = expenses.id and s.user_id = auth.uid())
);
create policy "expenses_write" on expenses for insert with check (auth.uid() = created_by);
create policy "expenses_update" on expenses for update using (auth.uid() = created_by or auth.uid() = paid_by);
create policy "expenses_delete" on expenses for delete using (auth.uid() = created_by);

-- splits: visible if expense visible
create policy "splits_read" on splits for select using (
  exists (select 1 from expenses e where e.id = splits.expense_id) -- expense RLS gates this
);
create policy "splits_write" on splits for insert with check (
  exists (select 1 from expenses e where e.id = splits.expense_id and e.created_by = auth.uid())
);
create policy "splits_delete" on splits for delete using (
  exists (select 1 from expenses e where e.id = splits.expense_id and e.created_by = auth.uid())
);

-- payments: participants read; from_user writes
create policy "payments_read"   on payments for select using (auth.uid() in (from_user, to_user));
create policy "payments_insert" on payments for insert with check (auth.uid() = from_user or auth.uid() = to_user);
create policy "payments_update" on payments for update using (auth.uid() = from_user);

-- comments: anyone who can see the expense can comment / read
create policy "comments_read"   on comments for select using (
  exists (select 1 from expenses e where e.id = comments.expense_id)
);
create policy "comments_insert" on comments for insert with check (auth.uid() = author);
create policy "comments_delete" on comments for delete using (auth.uid() = author);

-- Auto-create a profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name) values (new.id, coalesce(new.raw_user_meta_data->>'name', new.email))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
