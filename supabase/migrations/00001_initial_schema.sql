-- SideBySide 初始数据库 Schema
-- 在 Supabase Dashboard → SQL Editor 中执行此脚本

-- 开启 UUID 扩展
create extension if not exists "uuid-ossp";

/* ─── Pairs（情侣对）─────────────────────────── */
create table if not exists pairs (
  id          uuid primary key default uuid_generate_v4(),
  pair_code   text unique not null,
  members     uuid[] not null default '{}',
  budget_total numeric default 5000 not null,
  budget_categories jsonb default null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

/* ─── Expenses（支出流水）────────────────────── */
create table if not exists expenses (
  id              uuid primary key default uuid_generate_v4(),
  pair_id         uuid not null references pairs(id) on delete cascade,
  amount          numeric not null check (amount > 0),
  category        text not null,
  description     text not null default '',
  date            date not null,
  created_by      uuid default null,
  created_at      timestamptz default now(),
  last_edited_at   timestamptz default now()
);
create index if not exists idx_expenses_pair on expenses(pair_id, date desc);

/* ─── Recipes（食谱库）───────────────────────── */
create table if not exists recipes (
  id          uuid primary key default uuid_generate_v4(),
  pair_id     uuid not null references pairs(id) on delete cascade,
  name        text not null,
  emoji       text not null default '🍳',
  ingredients text[] not null default '{}',
  tags        text[] not null default '{}',
  image_url   text default null,
  created_by  uuid default null,
  created_at  timestamptz default now()
);
create index if not exists idx_recipes_pair on recipes(pair_id);

/* ─── Shopping List（买菜清单）──────────────── */
create table if not exists shopping_list (
  id           uuid primary key default uuid_generate_v4(),
  pair_id      uuid not null references pairs(id) on delete cascade,
  name         text not null,
  completed    boolean not null default false,
  note         text default null,
  added_by     uuid default null,
  completed_by uuid default null,
  created_at   timestamptz default now()
);
create index if not exists idx_shopping_pair on shopping_list(pair_id);

/* ─── Food Memories（美食记忆墙）────────────── */
create table if not exists food_memories (
  id          uuid primary key default uuid_generate_v4(),
  pair_id     uuid not null references pairs(id) on delete cascade,
  recipe_id   uuid default null references recipes(id) on delete set null,
  recipe_name text not null,
  emoji       text not null default '🍽️',
  image_url   text default null,
  note        text default null,
  date        date not null,
  created_by  uuid default null,
  created_at  timestamptz default now()
);
create index if not exists idx_memories_pair on food_memories(pair_id, date desc);

/* ─── Calendar Events（日历事件）────────────── */
create table if not exists calendar_events (
  id          uuid primary key default uuid_generate_v4(),
  pair_id     uuid not null references pairs(id) on delete cascade,
  type        text not null check (type in ('period_start','period_end','anniversary','birthday','schedule')),
  title       text not null,
  date        date not null,
  repeat      boolean not null default false,
  note        text default null,
  metadata    jsonb default null,
  created_by  uuid default null,
  created_at  timestamptz default now()
);
create index if not exists idx_events_pair on calendar_events(pair_id, date);

/* ─── AI Reports（AI 缓存报告）──────────────── */
create table if not exists ai_reports (
  id            uuid primary key default uuid_generate_v4(),
  pair_id       uuid not null references pairs(id) on delete cascade,
  type          text not null check (type in ('monthly_analysis','recipe_recommendation','reminder_suggestion')),
  content       text not null,
  related_data  jsonb default null,
  user_feedback text default null check (user_feedback in ('thumbs_up','thumbs_down')),
  created_at    timestamptz default now()
);
create index if not exists idx_reports_pair on ai_reports(pair_id, type, created_at desc);

/* ─── 自动更新 updated_at ───────────────────── */
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_pairs_updated_at
  before update on pairs
  for each row execute function update_updated_at();

/* ─── Row Level Security ─────────────────────── */
-- 注意：在 Supabase Dashboard → Authentication → Policies 中配置
-- 以下为 RLS 策略 SQL，每张表启用后执行

-- 启用 RLS
alter table pairs enable row level security;
alter table expenses enable row level security;
alter table recipes enable row level security;
alter table shopping_list enable row level security;
alter table food_memories enable row level security;
alter table calendar_events enable row level security;
alter table ai_reports enable row level security;

-- 通用策略：仅 pair 成员可读写自己的数据
-- 注意：以下策略假设已启用 Supabase Auth。
-- 如果 v1.0 暂不使用 Auth，可先关闭 RLS 或使用宽松策略。

-- Pairs: 用户只可读写自己所在的 pair
create policy "pair_member_select" on pairs
  for select using (auth.uid() = any(members));
create policy "pair_member_update" on pairs
  for update using (auth.uid() = any(members));

-- Expenses: pair 成员可读写
create policy "expenses_select" on expenses
  for select using (
    exists (select 1 from pairs where id = expenses.pair_id and auth.uid() = any(members))
  );
create policy "expenses_insert" on expenses
  for insert with check (
    exists (select 1 from pairs where id = pair_id and auth.uid() = any(members))
  );
create policy "expenses_update" on expenses
  for update using (
    exists (select 1 from pairs where id = expenses.pair_id and auth.uid() = any(members))
  );
create policy "expenses_delete" on expenses
  for delete using (
    exists (select 1 from pairs where id = expenses.pair_id and auth.uid() = any(members))
  );

-- 其余表同理，用相同模式
create policy "recipes_select" on recipes for select
  using (exists (select 1 from pairs where id = recipes.pair_id and auth.uid() = any(members)));
create policy "recipes_insert" on recipes for insert
  with check (exists (select 1 from pairs where id = pair_id and auth.uid() = any(members)));
create policy "recipes_update" on recipes for update
  using (exists (select 1 from pairs where id = recipes.pair_id and auth.uid() = any(members)));
create policy "recipes_delete" on recipes for delete
  using (exists (select 1 from pairs where id = recipes.pair_id and auth.uid() = any(members)));

create policy "shopping_select" on shopping_list for select
  using (exists (select 1 from pairs where id = shopping_list.pair_id and auth.uid() = any(members)));
create policy "shopping_insert" on shopping_list for insert
  with check (exists (select 1 from pairs where id = pair_id and auth.uid() = any(members)));
create policy "shopping_update" on shopping_list for update
  using (exists (select 1 from pairs where id = shopping_list.pair_id and auth.uid() = any(members)));
create policy "shopping_delete" on shopping_list for delete
  using (exists (select 1 from pairs where id = shopping_list.pair_id and auth.uid() = any(members)));

create policy "memories_select" on food_memories for select
  using (exists (select 1 from pairs where id = food_memories.pair_id and auth.uid() = any(members)));
create policy "memories_insert" on food_memories for insert
  with check (exists (select 1 from pairs where id = pair_id and auth.uid() = any(members)));
create policy "memories_update" on food_memories for update
  using (exists (select 1 from pairs where id = food_memories.pair_id and auth.uid() = any(members)));
create policy "memories_delete" on food_memories for delete
  using (exists (select 1 from pairs where id = food_memories.pair_id and auth.uid() = any(members)));

create policy "events_select" on calendar_events for select
  using (exists (select 1 from pairs where id = calendar_events.pair_id and auth.uid() = any(members)));
create policy "events_insert" on calendar_events for insert
  with check (exists (select 1 from pairs where id = pair_id and auth.uid() = any(members)));
create policy "events_update" on calendar_events for update
  using (exists (select 1 from pairs where id = calendar_events.pair_id and auth.uid() = any(members)));
create policy "events_delete" on calendar_events for delete
  using (exists (select 1 from pairs where id = calendar_events.pair_id and auth.uid() = any(members)));

create policy "reports_select" on ai_reports for select
  using (exists (select 1 from pairs where id = ai_reports.pair_id and auth.uid() = any(members)));
create policy "reports_insert" on ai_reports for insert
  with check (exists (select 1 from pairs where id = pair_id and auth.uid() = any(members)));
create policy "reports_update" on ai_reports for update
  using (exists (select 1 from pairs where id = ai_reports.pair_id and auth.uid() = any(members)));
create policy "reports_delete" on ai_reports for delete
  using (exists (select 1 from pairs where id = ai_reports.pair_id and auth.uid() = any(members)));
