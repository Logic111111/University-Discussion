-- Campus: signed-in authors, ideas, comments and endorsements.
-- Reads are public; every write is limited to the signed-in user's own rows by RLS.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  university text not null check (char_length(btrim(university)) between 1 and 120),
  department text not null default '' check (char_length(department) <= 120),
  -- Set by trigger from the verified sign-in email; clients cannot write it.
  email_domain text not null default '',
  created_at timestamptz not null default now()
);

create function public.set_profile_email_domain()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.email_domain := lower(split_part(coalesce(auth.jwt() ->> 'email', ''), '@', 2));
  return new;
end;
$$;

create trigger profiles_set_email_domain
before insert or update on public.profiles
for each row execute function public.set_profile_email_domain();

create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 200),
  department text not null default '' check (char_length(department) <= 120),
  abstract text not null check (char_length(btrim(abstract)) between 1 and 4000),
  tags text[] not null default '{}' check (cardinality(tags) <= 12),
  hardware_specs jsonb not null default '{}' check (jsonb_typeof(hardware_specs) = 'object' and pg_column_size(hardware_specs) <= 4000),
  code_language text not null default '' check (char_length(code_language) <= 30),
  code text not null default '' check (char_length(code) <= 20000),
  created_at timestamptz not null default now()
);
create index ideas_author_id_idx on public.ideas (author_id);
create index ideas_created_at_idx on public.ideas (created_at desc);

create table public.idea_comments (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas (id) on delete cascade,
  author_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  content text not null check (char_length(btrim(content)) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index idea_comments_idea_id_idx on public.idea_comments (idea_id);
create index idea_comments_author_id_idx on public.idea_comments (author_id);

create table public.idea_endorsements (
  idea_id uuid not null references public.ideas (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (idea_id, user_id)
);
create index idea_endorsements_user_id_idx on public.idea_endorsements (user_id);

alter table public.profiles enable row level security;
alter table public.ideas enable row level security;
alter table public.idea_comments enable row level security;
alter table public.idea_endorsements enable row level security;

-- Profiles: public read, own row only for writes.
create policy "Profiles are readable by everyone" on public.profiles
  for select to anon, authenticated using (true);
create policy "Users create their own profile" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);
create policy "Users update their own profile" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Ideas
create policy "Ideas are readable by everyone" on public.ideas
  for select to anon, authenticated using (true);
create policy "Users post ideas as themselves" on public.ideas
  for insert to authenticated with check ((select auth.uid()) = author_id);
create policy "Users edit their own ideas" on public.ideas
  for update to authenticated
  using ((select auth.uid()) = author_id) with check ((select auth.uid()) = author_id);
create policy "Users delete their own ideas" on public.ideas
  for delete to authenticated using ((select auth.uid()) = author_id);

-- Comments
create policy "Comments are readable by everyone" on public.idea_comments
  for select to anon, authenticated using (true);
create policy "Users comment as themselves" on public.idea_comments
  for insert to authenticated with check ((select auth.uid()) = author_id);
create policy "Users delete their own comments" on public.idea_comments
  for delete to authenticated using ((select auth.uid()) = author_id);

-- Endorsements: one per user per idea (primary key).
create policy "Endorsements are readable by everyone" on public.idea_endorsements
  for select to anon, authenticated using (true);
create policy "Users endorse as themselves" on public.idea_endorsements
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users remove their own endorsements" on public.idea_endorsements
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Data API exposure (new projects expose nothing by default). Column lists keep
-- author ids, email_domain and timestamps out of client writes.
grant select on public.profiles, public.ideas, public.idea_comments, public.idea_endorsements to anon, authenticated;
grant insert (id, name, university, department), update (name, university, department) on public.profiles to authenticated;
grant insert (title, department, abstract, tags, hardware_specs, code_language, code),
      update (title, department, abstract, tags, hardware_specs, code_language, code),
      delete on public.ideas to authenticated;
grant insert (idea_id, content), delete on public.idea_comments to authenticated;
grant insert (idea_id), delete on public.idea_endorsements to authenticated;
