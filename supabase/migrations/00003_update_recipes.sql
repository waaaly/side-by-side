-- 1. 使用 CASCADE 级联删除 recipes 表，这会自动切断并清除 food_memories 上的旧外键约束
drop table if exists public.recipes cascade;

-- 2. 重新建立符合「厨房计划」高兼容性要求的食谱表
create table public.recipes (
  id uuid default gen_random_uuid() primary key,
  name text not null,                     -- 菜名 (如: 红烧肉)
  difficulty text,                        -- 难度 (如: 中等)
  category text,                          -- 分类 (如: 家常菜)
  tags text[],                            -- 标签数组
  ingredients jsonb not null default '[]'::jsonb, -- 存储食材清单 JSON
  steps jsonb not null default '[]'::jsonb,       -- 存储分步步骤 JSON
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. 极其重要：把之前被断开的外键约束重新绑定回来，确保你们的「美食记忆」功能不崩塌
alter table public.food_memories 
  add constraint food_memories_recipe_id_fkey 
  foreign key (recipe_id) 
  references public.recipes(id) 
  on delete cascade; -- 如果未来删除了某道菜，对应的美食记忆也会自动跟着清理，防止产生垃圾数据

-- 4. 重新将 recipes 表加入新版 Supabase 实时同步发布组
alter publication supabase_realtime add table public.recipes;
