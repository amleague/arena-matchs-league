-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends Auth Users)
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  name text,
  role text default 'coach',
  city text
);

-- 2. TEAMS
create table teams (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  sport text not null,
  category text not null,
  level text,
  city text,
  owner_id uuid references auth.users not null,
  stats jsonb default '{"wins": 0, "loss": 0}'::jsonb
);

-- 3. CHALLENGES
create table challenges (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  from_team_id uuid references teams(id) not null,
  to_team_id uuid references teams(id) not null,
  date timestamp with time zone,
  location text,
  message text,
  status text default 'PENDING' -- PENDING, ACCEPTED, DECLINED
);

-- 4. MATCHES
create table matches (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  team_a_id uuid references teams(id) not null,
  team_b_id uuid references teams(id) not null,
  date timestamp with time zone,
  location text,
  status text default 'SCHEDULED', -- SCHEDULED, FINISHED
  score text
);

-- 5. TOURNAMENTS
create table tournaments (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  sport text,
  category text,
  date timestamp with time zone,
  location text,
  status text default 'OPEN',
  max_teams int default 8,
  owner_id uuid references auth.users not null
);

-- 6. TOURNAMENT REGISTRATIONS (Join Table)
create table tournament_registrations (
  tournament_id uuid references tournaments(id) not null,
  team_id uuid references teams(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (tournament_id, team_id)
);

-- RLS POLICIES (Simplified for MVP - assuming public read, owner write mostly)
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

alter table teams enable row level security;
create policy "Teams are viewable by everyone." on teams for select using (true);
create policy "Users can insert their own teams." on teams for insert with check (auth.uid() = owner_id);
create policy "Users can update their own teams." on teams for update using (auth.uid() = owner_id);

alter table challenges enable row level security;
create policy "Challenges are viewable by everyone." on challenges for select using (true);
create policy "Authenticated users can create challenges." on challenges for insert with check (auth.role() = 'authenticated');
create policy "Owners involved can update challenges." on challenges for update using (auth.role() = 'authenticated'); -- Simplified

alter table matches enable row level security;
create policy "Matches are viewable by everyone." on matches for select using (true);
create policy "Authenticated users can create matches." on matches for insert with check (auth.role() = 'authenticated');
create policy "Users can update matches." on matches for update using (auth.role() = 'authenticated');

alter table tournaments enable row level security;
create policy "Tournaments are viewable by everyone." on tournaments for select using (true);
create policy "Authenticated users can create tournaments." on tournaments for insert with check (auth.role() = 'authenticated');
create policy "Owners can update tournaments." on tournaments for update using (auth.uid() = owner_id);

alter table tournament_registrations enable row level security;
create policy "Registrations are viewable by everyone." on tournament_registrations for select using (true);
create policy "Authenticated users can register teams." on tournament_registrations for insert with check (auth.role() = 'authenticated');
