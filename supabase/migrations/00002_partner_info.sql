-- 为 pairs 表添加 metadata 字段，用于存储伴侣邮箱等信息
alter table pairs add column if not exists metadata jsonb default null;
