-- ============================================================
-- LeodSearch AI — Supabase / PostgreSQL schema
-- ============================================================
-- Run this in the Supabase SQL editor (Project -> SQL Editor -> New query)
-- after enabling Supabase Authentication for the project.
--
-- Every user-owned table has Row-Level Security (RLS) enabled, with
-- policies that only let a user read/write their own rows, identified by
-- auth.uid(). This schema is written but NOT yet connected to the backend
-- or frontend — that wiring is a separate stage, so nothing in the app
-- should claim "saved" or "synced" until it has actually been tested
-- against a live Supabase project.
-- ============================================================

-- ------------------------------------------------------------
-- profiles: one row per authenticated user, extends auth.users
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ------------------------------------------------------------
-- user_preferences: one row per user, app-wide settings
-- ------------------------------------------------------------
create table if not exists public.user_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  theme text not null default 'dark',
  private_search_mode boolean not null default false,
  store_search_history boolean not null default true,
  default_search_mode text not null default 'web' check (default_search_mode in ('web', 'knowledge')),
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

create policy "Users manage their own preferences"
  on public.user_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- search_history: every search a user performs (Privacy Shield
-- lets users clear this or disable logging entirely)
-- ------------------------------------------------------------
create table if not exists public.search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  query text not null,
  mode text not null check (mode in ('web', 'knowledge')),
  created_at timestamptz not null default now()
);

create index if not exists idx_search_history_user_id on public.search_history (user_id, created_at desc);

alter table public.search_history enable row level security;

create policy "Users manage their own search history"
  on public.search_history for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- saved_searches: a search the user explicitly bookmarked
-- ------------------------------------------------------------
create table if not exists public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  query text not null,
  mode text not null check (mode in ('web', 'knowledge')),
  ai_summary text,
  created_at timestamptz not null default now()
);

create index if not exists idx_saved_searches_user_id on public.saved_searches (user_id, created_at desc);

alter table public.saved_searches enable row level security;

create policy "Users manage their own saved searches"
  on public.saved_searches for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- saved_sources: a bookmarked individual web result
-- ------------------------------------------------------------
create table if not exists public.saved_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  url text not null,
  snippet text,
  source_domain text,
  created_at timestamptz not null default now()
);

create index if not exists idx_saved_sources_user_id on public.saved_sources (user_id, created_at desc);

alter table public.saved_sources enable row level security;

create policy "Users manage their own saved sources"
  on public.saved_sources for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- research_collections: a named folder of research (Pocket Intelligence)
-- ------------------------------------------------------------
create table if not exists public.research_collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_research_collections_user_id on public.research_collections (user_id, updated_at desc);

alter table public.research_collections enable row level security;

create policy "Users manage their own research collections"
  on public.research_collections for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- research_items: an individual saved answer/source inside a collection
-- ------------------------------------------------------------
create table if not exists public.research_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.research_collections (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  item_type text not null check (item_type in ('ai_answer', 'web_source', 'note')),
  title text not null,
  content text,
  url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_research_items_collection_id on public.research_items (collection_id, created_at desc);

alter table public.research_items enable row level security;

create policy "Users manage their own research items"
  on public.research_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- quizzes: a generated quiz (LearnFromSearch)
-- ------------------------------------------------------------
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  topic text not null,
  difficulty text not null default 'beginner' check (difficulty in ('beginner', 'intermediate', 'advanced')),
  created_at timestamptz not null default now()
);

create index if not exists idx_quizzes_user_id on public.quizzes (user_id, created_at desc);

alter table public.quizzes enable row level security;

create policy "Users manage their own quizzes"
  on public.quizzes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- quiz_questions: questions belonging to a quiz
-- ------------------------------------------------------------
create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  question text not null,
  choices jsonb not null, -- e.g. ["A", "B", "C", "D"]
  correct_index int not null,
  explanation text,
  position int not null default 0
);

create index if not exists idx_quiz_questions_quiz_id on public.quiz_questions (quiz_id, position);

alter table public.quiz_questions enable row level security;

create policy "Users view questions for their own quizzes"
  on public.quiz_questions for select
  using (exists (
    select 1 from public.quizzes q
    where q.id = quiz_questions.quiz_id and q.user_id = auth.uid()
  ));

create policy "Users manage questions for their own quizzes"
  on public.quiz_questions for all
  using (exists (
    select 1 from public.quizzes q
    where q.id = quiz_questions.quiz_id and q.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.quizzes q
    where q.id = quiz_questions.quiz_id and q.user_id = auth.uid()
  ));

-- ------------------------------------------------------------
-- quiz_attempts: a user's attempt/score history for a quiz
-- ------------------------------------------------------------
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  score int not null,
  total_questions int not null,
  completed_at timestamptz not null default now()
);

create index if not exists idx_quiz_attempts_user_id on public.quiz_attempts (user_id, completed_at desc);

alter table public.quiz_attempts enable row level security;

create policy "Users manage their own quiz attempts"
  on public.quiz_attempts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- flashcards: generated flashcards (LearnFromSearch)
-- ------------------------------------------------------------
create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  topic text not null,
  front text not null,
  back text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_flashcards_user_id on public.flashcards (user_id, created_at desc);

alter table public.flashcards enable row level security;

create policy "Users manage their own flashcards"
  on public.flashcards for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- updated_at helper trigger, reused by a few tables above
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_research_collections_updated_at
  before update on public.research_collections
  for each row execute function public.set_updated_at();
