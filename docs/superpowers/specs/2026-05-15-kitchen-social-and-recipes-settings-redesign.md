# 厨房社交模块 & 食谱管理设置页重设计

## 背景

厨房 Tab 中原有的「食谱库」与设置页的「食谱管理」功能重复，且设置页一次加载 300+ 条食谱导致性能问题。需要：
1. 移除厨房 Tab 中的食谱库，替换为情侣社交互动模块
2. 重新设计设置页的食谱管理，支持大规模数据的分页浏览

## 一、厨房 Tab — 社交模块

### 位置
替换原来「📚 食谱库」的折叠区域，位于 BlindBox + ShoppingList 之下。

### 三个社交功能

#### 1. 做菜打卡
- 盲盒抽到菜后，增加「做完啦，打卡！」按钮
- 点击弹出评分浮层（1-5 星 + 可选文字点评）
- 提交后生成一条动态，显示在厨房动态 feed 中
- 每日对同一道菜只能打卡一次（通过 `recipe_ratings` 的 `recipe_id + user_id + date` 唯一约束实现）

#### 2. 评分点评
- 打卡时附带评分（1-5 星）和短评
- 每道菜累计显示平均分和评价数
- 评分数据存储在 `recipe_ratings` 表中

#### 3. 烹饪挑战
- 在动态 feed 中或菜谱详情中发起挑战
- 对方收到挑战通知（通过动态 feed 显示）
- 挑战状态：待接受 → 已接受 → 已完成
- 完成后自动生成打卡动态

### 厨房动态 Feed
- 时间倒序显示所有社交活动
- 动态类型：
  - 🍳 `[用户] 做了 [菜名]` + 评分星星 + 点评
  - 🔥 `[用户] 挑战 [用户] 做 [菜名]` + 状态
  - ✅ `[用户] 完成了 [用户] 的挑战 [菜名]`
- 每条动态显示：用户标识、动作、菜名、时间、互动按钮

### 新增数据表

```sql
create table recipe_ratings (
  id uuid default gen_random_uuid() primary key,
  recipe_id uuid not null references recipes(id) on delete cascade,
  user_id text not null,
  rating smallint not null check (rating >= 1 and rating <= 5),
  comment text default null,
  date date not null default current_date,
  created_at timestamptz default now(),
  unique (recipe_id, user_id, date)
);

create table cooking_challenges (
  id uuid default gen_random_uuid() primary key,
  recipe_id uuid not null references recipes(id) on delete cascade,
  from_user text not null,
  to_user text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'completed')),
  created_at timestamptz default now(),
  completed_at timestamptz default null
);
```

## 二、设置-食谱管理重设计

### 布局

```
┌─────────────────────────────────────────┐
│  ← 🍳 食谱管理                          │
├─────────────────────────────────────────┤
│  [搜索框 🔍]                            │
├─────────────────────────────────────────┤
│  分类 tab: 全部 | 🍳家常菜 | 🌶️川菜 | ... │ (水平滑动)
├─────────────────────────────────────────┤
│  难度: [全部] [简单] [中等] [困难]        │
│  标签: [全部] [炒锅] [带小贴士] ...       │
├─────────────────────────────────────────┤
│  ┌──────────────────────────────────┐   │
│  │ 🍳 B52轰炸机  饮品  中等  ★★★★☆  │   │
│  │ 🌶️ 麻婆豆腐   川菜  简单  ★★★☆☆  │   │
│  │ 🍰 提拉米苏   甜品  困难  ★★★★★  │   │
│  │ ...                               │   │
│  └──────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  ← 1  2  3  ...  15 →                  │ (分页)
└─────────────────────────────────────────┘
```

### 关键设计

- **分页查询**：每页 20 条，使用 Supabase 的 `.range()` + `.order()`
- **搜索**：按菜名或食材名模糊搜索
- **分类过滤**：水平滑动 tab 栏，切换分类时重置页码
- **难度/标签筛选**：chips 按钮，可多选组合
- **排序**：默认按创建时间倒序，可切换按评分/名称排序
- **点击菜谱项**：进入详情弹窗或展开行，显示完整信息（食材列表、步骤）、编辑/删除按钮

### 数据加载策略

- 初始加载：仅请求第一页
- 切换分类/筛选/排序时重置到第一页
- 翻页/滚动加载更多时请求下一页
- 搜索时使用 `ilike` 查询，结合分页
- 所有查询带 `count: 'exact'` 以显示总条数和总页数

### hook 改动

```typescript
// 新增分页查询 hook
function useRecipesPaginated(filters: {
  category?: string
  difficulty?: string
  tags?: string[]
  search?: string
  page: number
  pageSize: number
}) {
  // 返回 { recipes, totalCount, totalPages, loading }
}
```

## 三、数据表变更

新增两张表：
- `recipe_ratings` — 存储评分和点评
- `cooking_challenges` — 存储挑战记录

无需修改现有 `recipes` 表结构。

## 四、未来迭代（本次不实现）

- AI 推荐：「今晚推荐你做 XX」「根据你们的口味偏好推荐」
- 照片上传：打卡时上传成品照片
- 通知推送：挑战提醒、对方打卡提醒
