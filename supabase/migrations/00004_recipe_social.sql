-- 1. 食谱评分/打卡表
create table if not exists public.recipe_ratings (
  id uuid default gen_random_uuid() primary key,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  created_by text not null default 'me',
  rating smallint not null check (rating >= 1 and rating <= 5),
  comment text default null,
  date date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (recipe_id, created_by, date)
);

-- 2. 烹饪挑战表
create table if not exists public.cooking_challenges (
  id uuid default gen_random_uuid() primary key,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  from_user text not null,
  to_user text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'completed')),
  note text default null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone default null
);

-- 3. 加入实时同步
alter publication supabase_realtime add table public.recipe_ratings;
alter publication supabase_realtime add table public.cooking_challenges;
