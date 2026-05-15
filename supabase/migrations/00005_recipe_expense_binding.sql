-- 账单与菜谱双向绑定：允许将一笔支出关联到某道菜谱
alter table public.expenses
  add column recipe_id uuid references public.recipes(id) on delete set null;

-- 加入实时同步
alter publication supabase_realtime add table public.expenses;
