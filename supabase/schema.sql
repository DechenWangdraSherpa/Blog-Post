-- Supabase schema, RLS policies, triggers, and auth hook function
-- Full-Stack Blog Platform — Dw4ngSh3rs Blog

-- 1. Enable required extensions
create extension if not exists pgcrypto;

-- 2. profiles table (auto-created on user signup via trigger)
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- 3. posts table
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  cover_image_url text,
  content text not null,
  excerpt text,
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. comments table
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  body text not null,
  created_at timestamptz default now()
);

-- 5. likes table
create table if not exists likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  unique(post_id, user_id)
);

-- 6. Enable RLS on all tables
alter table profiles enable row level security;
alter table posts enable row level security;
alter table comments enable row level security;
alter table likes enable row level security;

-- 7. Admin email helper function
-- IMPORTANT: Replace the email below with your NEXT_PUBLIC_ADMIN_EMAIL value
-- Using a function avoids ALTER DATABASE / ALTER ROLE which require superuser in Supabase.
create or replace function public.admin_email()
returns text as $$
  select '02230281.cst@rub.edu.bt'::text;
$$ language sql immutable;

-- 8. RLS Policies
-- NOTE: Admin policies use BOTH jwt email check (reliable, always works)
--       AND the role claim check (works only after auth hook is configured).
--       The email check ensures admin can create/edit posts even before
--       the auth hook is set up.

-- posts table
drop policy if exists "Public can view published posts" on posts;
drop policy if exists "Admin can insert posts" on posts;
drop policy if exists "Admin can update posts" on posts;
drop policy if exists "Admin can delete posts" on posts;
drop policy if exists "Admin can select all posts" on posts;

create policy "Public can view published posts" on posts
  for select using (published = true);

create policy "Admin can insert posts" on posts
  for insert with check (
    auth.jwt() ->> 'email' = public.admin_email()
    OR auth.jwt() ->> 'role' = 'admin'
  );

create policy "Admin can update posts" on posts
  for update using (
    auth.jwt() ->> 'email' = public.admin_email()
    OR auth.jwt() ->> 'role' = 'admin'
  );

create policy "Admin can delete posts" on posts
  for delete using (
    auth.jwt() ->> 'email' = public.admin_email()
    OR auth.jwt() ->> 'role' = 'admin'
  );

-- Admin also needs to SELECT all posts (not just published) for the dashboard
create policy "Admin can select all posts" on posts
  for select using (
    auth.jwt() ->> 'email' = public.admin_email()
    OR auth.jwt() ->> 'role' = 'admin'
  );

-- comments table
drop policy if exists "Anyone can select comments" on comments;
drop policy if exists "Members can insert their own comments" on comments;
drop policy if exists "Admin can delete any comment" on comments;
drop policy if exists "Admin or owner can delete comment" on comments;

create policy "Anyone can select comments" on comments
  for select using (true);

create policy "Members can insert their own comments" on comments
  for insert with check (auth.uid() = user_id);

create policy "Admin or owner can delete comment" on comments
  for delete using (
    auth.uid() = user_id
    OR auth.jwt() ->> 'email' = public.admin_email()
    OR auth.jwt() ->> 'role' = 'admin'
  );

-- likes table
drop policy if exists "Anyone can select likes" on likes;
drop policy if exists "Authenticated users can insert their own like" on likes;
drop policy if exists "Users can delete their own like" on likes;

create policy "Anyone can select likes" on likes
  for select using (true);

create policy "Authenticated users can insert their own like" on likes
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own like" on likes
  for delete using (auth.uid() = user_id);

-- profiles table
drop policy if exists "Anyone can select profiles" on profiles;
drop policy if exists "Users can insert their own profile" on profiles;
drop policy if exists "Users can update their own profile" on profiles;

create policy "Anyone can select profiles" on profiles
  for select using (true);

create policy "Users can insert their own profile" on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile" on profiles
  for update using (auth.uid() = id);

-- 9. Trigger: Insert profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 10. Trigger: Update updated_at on posts
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on posts;
create trigger set_updated_at
  before update on posts
  for each row execute procedure public.set_updated_at();

-- 11. Auth Hook: Set custom claim 'role' for admin (optional but recommended)
-- This adds role:'admin' to the JWT so RLS can also check via auth.jwt()->>'role'
create or replace function public.set_admin_role(event jsonb)
returns jsonb as $$
declare
  claims jsonb := event->'claims';
begin
  if (event->'user'->>'email') = public.admin_email() then
    claims := jsonb_set(claims, '{role}', '"admin"');
  end if;
  return jsonb_set(event, '{claims}', claims);
end;
$$ language plpgsql security definer;

-- After running this SQL:
-- 1. In Supabase Dashboard: Authentication > Hooks > Custom Access Token
--    > select function: public.set_admin_role  (optional but recommended)
-- 2. Storage: Create bucket named "blog-images" with Public enabled
-- 3. Storage policies: see configuration.md for the INSERT policy
-- 4. Database > Replication > enable Realtime for "comments" table
