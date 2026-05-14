# SideBySide 完整开发计划

> 基于 PRD-sidebyside.md v2.5 生成 | 2026-05-14

---

## 当前状态

| 维度 | 已有 | 待建 |
|------|------|------|
| 账单页 | 8 分类原型、Mock 数据 | 32 分类、Bottom Sheet 两段式、编辑流水、预算环形图、多维度统计 |
| 厨房页 | 盲盒抽菜、买菜清单（Mock） | 食谱库 CRUD、空状态、记忆墙、清单划线动画 |
| 日历页 | 占位页面 | 完整月视图、4 类事件标记、日期详情面板 |
| 设置页 | ❌ 不存在 | 分类/食谱/预算/日历事件管理 |
| 导航 | 3 Tab（📋/🍳/❤️） | 5 Tab（📋/🍳/➕/📅/⚙️） |
| 记账弹窗 | 单页 Modal | 两段式 Bottom Sheet（分类→金额） |
| 数据层 | Mock State | Firebase Firestore + 实时同步 + 离线 |
| AI | ❌ 不存在 | LLM API、财务分析、食谱推荐、提醒建议 |
| 测试 | ❌ 不存在 | Unit/Integration/E2E |
| 主题/动效 | Tailwind v4 + Framer Motion | 统一审查 + prefers-reduced-motion |

---

## 依赖关系总览

```
Phase 1 (Foundation)
  ├── Phase 2 (账单 MVP) ──┐
  ├── Phase 3 (食谱 MVP) ──┤
  ├── Phase 4 (日历 MVP) ──┤
  └── Phase 6 (Firebase) ──┤ ← 可与 Phase 2-4 并行
                            │
Phase 5 (设置 MVP) ←───────┤
                            │
Phase 7 (AI 接入) ←────────┘
       │
Phase 8 (P1 功能) ←──────── Phase 2-7
       │
Phase 9 (润色联调) ←─────── 全部
       │
Phase 10 (测试上线) ←─────── 全部
```

---

## Phase 1: Foundation（Week 1）

| # | 任务 | 详情 | 文件/组件 |
|---|------|------|-----------|
| 1.1 | 重构 BottomNav 为 5 Tab | 3 Tab → 5 Tab（📋账单/🍳食谱/➕/📅日历/⚙️设置），➕ 居中凸出 25%，渐变背景（brand-pink → brand-rose）+ 阴影，其余 4 Tab 激活时 framer-motion 弹簧缩放动画 | `src/components/BottomNav.tsx` |
| 1.2 | 添加新路由页面 | 创建 `/settings` 页面；补全日历页占位为可工作页面 | `src/app/settings/page.tsx` (新建) |
| 1.3 | 全局布局统一 | `h-screen` + `overflow-y-auto` 限制页面内滚动，验证 safe-area-inset-top/bottom，iOS 刘海屏适配 | `src/app/layout.tsx` |
| 1.4 | 统一交互规范 | 所有按钮 `active:scale-95 transition`，列表项 `hover:bg-gray-50` 持续 150ms，金额数字 `tabular-nums` 等宽字体 | `src/app/globals.css` |
| 1.5 | prefers-reduced-motion 支持 | 所有 framer-motion 动画降级为 opacity-only 过渡 | 全局 CSS + Framer Motion 配置 |

**交付物：** 5-Tab 可导航 App 壳子，路由打通

---

## Phase 2: 账单 MVP（Week 2-3）

| # | 任务 | 详情 | 文件/组件 |
|---|------|------|-----------|
| 2.1 | 扩展分类体系 | 8 分类 → 32 分类（7 组：🍔饮食/🏠居住/🚗出行/🛍️消费/📚成长/❤️人情/🧰杂项），每组带 emoji + 着色（饮食→amber/居住→sage/出行→blue/消费→purple），更新类型定义 | `src/types/index.ts` |
| 2.2 | 底部 ➕ Tab 触发记账 | 点击 ➕ 直接弹出分类选择器 Bottom Sheet，不切换页面 | `src/components/BottomNav.tsx` |
| 2.3 | 两段式记账 Bottom Sheet | 第一阶段：32 分类分 7 组网格排列，组标题 + emoji 图标；第二阶段：收起分类器展开金额输入（数字键盘）+ 备注 + 日期选择器（默认今天，可改为过去日期） | `src/components/AddExpenseModal.tsx` 重构 |
| 2.4 | 预算环形卡片 | 月度总预算/已花/剩余 + SVG 环形进度条，≤80% 绿、80-100% 琥珀、>100% 红 + "已超支" | `src/app/page.tsx` |
| 2.5 | 流水列表 | 按日期倒序分组，日合计小计，分类圆形底色（按组着色），描述文字，右侧 `-¥金额` | `src/app/page.tsx` |
| 2.6 | 编辑流水 | 点击条目弹出与新建相同布局的编辑面板，预填当前数据，可修改金额/分类/备注/日期 | `src/components/AddExpenseModal.tsx` |
| 2.7 | 日期分组 sticky | 日期分组头使用 sticky 定位，滚动时固定在顶部直到下一组出现 | `src/app/page.tsx` |
| 2.8 | 今日快览条 | 可折叠：展示今日支出金额 + 本月已记笔数，淡入动画 | `src/components/DailySummary.tsx` (新建) |
| 2.9 | 多维度统计页面 | 三维筛选（人员👩女方/👨男方/👫双方 × 时间粒度年/季/月/周/日 × 排序金额降序/频次降序），趋势折线图 + AI 大分类环形图 + 支出排横向条形 | `src/app/stats/page.tsx` (新建) |
| 2.10 | 预算防 0 校验 | 前端校验预算不允许 ≤0，默认 5000 | 设置页联动 |

**交付物：** 📋 账单页完整可用（含多维度统计）

---

## Phase 3: 食谱 MVP（Week 3-4）

| # | 任务 | 详情 | 文件/组件 |
|---|------|------|-----------|
| 3.1 | 食谱库 CRUD | 添加/编辑/删除菜谱（菜名、emoji、食材列表、标签），支持名称搜索 + 标签筛选 | `src/app/kitchen/page.tsx` |
| 3.2 | 盲盒空状态 | 食谱库为空时显示空状态插画 + 引导文案"还没有菜谱哦，先去添加一道吧 →" | `src/components/BlindBox.tsx` (新建) |
| 3.3 | 盲盒抽菜 | 随机抽取 + spring 动画（emoji 闪烁放大 → 菜名 + 食材列表渐入 0.8s），"换一道"重新抽取 | `src/components/BlindBox.tsx` (新建) |
| 3.4 | 买菜清单 | 双人同步：添加/勾选（划线动画）/删除，`AnimatePresence` 过渡 | `src/components/ShoppingList.tsx` (新建) |
| 3.5 | 食材快捷加入清单 | 盲盒食材列表点击 "+" 直接加入购物清单 | 3.3 + 3.4 |
| 3.6 | 美食记忆墙 MVP | 时间线排列：日期 + 菜名 + emoji，按时间倒序，"记录到记忆墙"入口 | `src/components/FoodMemoryWall.tsx` (新建) |

**交付物：** 🍳 厨房页完整可用

---

## Phase 4: 日历 MVP（Week 4-5）

| # | 任务 | 详情 | 文件/组件 |
|---|------|------|-----------|
| 4.1 | 日历组件 | 月视图，上下月切换，今天高亮，周日/一/二/...表头 | `src/components/Calendar.tsx` (新建) |
| 4.2 | 生理期标记 | 点击日期标记"开始"/"结束"，渐变粉色区间高亮，双人可见 | `src/app/calendar/page.tsx` |
| 4.3 | 纪念日标记 | 自定义日期 + 标题 + 每年重复/单次，❤️ 图标高亮 | `src/app/calendar/page.tsx` |
| 4.4 | 生日标记 | 自定义日期 + 姓名 + 每年重复，🎂 图标高亮 | `src/app/calendar/page.tsx` |
| 4.5 | 日程事件（P1） | 自定义单次日程 + 标题 + 备注 | `src/app/calendar/page.tsx` |
| 4.6 | 日期详情面板 | 选中日期展示当天所有事件列表，AI 提醒卡片 | `src/components/CalendarDayDetail.tsx` (新建) |
| 4.7 | 日期小圆点聚合 | 日期下方小圆点标记事件类型（生理期/纪念日/生日/日程） | 日历组件 |
| 4.8 | 跨月生理期 | 开始月末结束下月，日历视图自动衔接 | 日历组件 |
| 4.9 | 重复事件删除 | 弹窗确认"仅删除今年"或"删除所有" | 4.3 + 4.4 |

**交付物：** 📅 日历页完整可用

---

## Phase 5: 设置 MVP（Week 5-6）

| # | 任务 | 详情 | 文件/组件 |
|---|------|------|-----------|
| 5.1 | 分类管理 | 32 分类网格列表（emoji + 名称 + 启用开关），停用分类在记账入口隐藏但保留历史数据 | `src/app/settings/categories/page.tsx` (新建) |
| 5.2 | 分类拖拽排序 | drag-and-drop 自定义分类排序 | `src/app/settings/categories/page.tsx` |
| 5.3 | 食谱管理 | 食谱库全部菜谱列表，搜索/标签筛选/编辑/删除 | `src/app/settings/recipes/page.tsx` (新建) |
| 5.4 | 预算设置 | 修改月度总预算上限（默认 5000，防 ≤0），为每个分类独立设定上限 | `src/app/settings/budget/page.tsx` (新建) |
| 5.5 | 日历事件管理（P1） | 列表展示全部事件按日期排序，编辑/删除，重复事件删除处理 | `src/app/settings/calendar/page.tsx` (新建) |

**交付物：** ⚙️ 设置页完整可用

---

## Phase 6: Firebase & 数据层（Week 5-7）

> 可与 Phase 2-4 并行进行，完成后逐步替换 Mock 数据。

| # | 任务 | 详情 | 文件/组件 |
|---|------|------|-----------|
| 6.1 | Firebase 项目配置 | 创建 Firebase 项目，安装 `firebase` SDK，配置 Firestore 索引 | `src/lib/firebase.ts` (新建) |
| 6.2 | Firestore 数据模型 | 实现 PRD Data Model 所有集合：pairs、expenses、recipes、shoppingList、foodMemories、calendarEvents、aiReports | `src/lib/firestore.ts` (新建) |
| 6.3 | 双人配对 | 邀请码/链接配对，pairId 关联两位用户 | `src/lib/pairing.ts` (新建) |
| 6.4 | 状态管理 hooks | 抽取自定义 hooks：`useExpenses`、`useRecipes`、`useShoppingList`、`useCalendarEvents`、`useBudget`、`useFoodMemories` | `src/hooks/` (新建目录) |
| 6.5 | 实时同步 | Firestore `onSnapshot` 实现双人实时同步 | 各 hooks |
| 6.6 | 离线支持 | Firestore `enableMultiTabIndexedDbPersistence`，乐观更新 + 冲突处理（最后写入胜出） | `src/lib/firebase.ts` |
| 6.7 | 离线状态指示器 | 弱网时展示"离线"状态指示，联网自动恢复同步 | `src/components/OfflineIndicator.tsx` (新建) |

**交付物：** 真实数据层 + 双人实时同步

---

## Phase 7: AI 接入（Week 6-7）

| # | 任务 | 详情 | 文件/组件 |
|---|------|------|-----------|
| 7.1 | LLM API 集成 | 接入 OpenAI GPT-4o-mini / Claude 3 Haiku，创建 API route 或 client 调用层 | `src/lib/ai.ts` (新建) |
| 7.2 | AI 智能归类 | 32 小分类归并为大分类（3-8 个），结果缓存到 Firestore aiReports | `src/lib/ai/classify.ts` (新建) |
| 7.3 | 月度财务分析 | 每月 1 号自动触发（或用户主动），输出：一句话总结 + 大/小分类双层分析 + 环比 + 异常检测标红 + 3 条优化建议 | `src/lib/ai/monthly-analysis.ts` (新建) |
| 7.4 | AI 食谱推荐 | 经期→暖宫食谱，当前月份→季节食谱，从已有食谱库推荐 | `src/lib/ai/recipe-recommend.ts` (新建) |
| 7.5 | AI 提醒建议 | 日历事件 T-1 天生成行动建议文案（纪念日→礼物/餐厅，生理期→食谱） | `src/lib/ai/reminder.ts` (新建) |
| 7.6 | AI 缓存策略 | AI 结果存 Firestore，每次打开先读缓存，过期/用户主动再刷新 | 7.3-7.5 |
| 7.7 | AI 卡片 UI | 首页/日历/厨房页 AI 建议卡片，流式打字效果，右上角 X 关闭，👍/👎 反馈 | `src/components/AICard.tsx` (新建) |
| 7.8 | AI API 异常降级 | 调用失败→显示"AI 暂不可用"+ 展示缓存的上次结果，不阻塞页面 | 7.7 |

**交付物：** 🤖 AI 层首次可用

---

## Phase 8: P1 功能（Week 7-8）

| # | 任务 | 详情 | 依赖 |
|---|------|------|------|
| 8.1 | 美食拍照上传 | 相机/相册选择，图片附在记忆墙条目，上传失败→本地暂存→联网重试 | Phase 3 + 6 |
| 8.2 | 买菜清单一键转记账 | 勾选的清单项直接生成记账条目 | Phase 2 + 3 |
| 8.3 | 分类独立预算预警 | 各分类独立预算上限，超额时首页 AI 卡片"本月 X 分类已超支" | Phase 2 + 5 + 7 |
| 8.4 | AI 环比分析升级 | 对比上月、检出异常支出、具体省钱方案 | Phase 7 |
| 8.5 | AI 季节食材推荐 | 根据月份给出时令食材建议 + 匹配菜谱推荐 | Phase 7 |
| 8.6 | 经济模式过渡动画 | 低电量/省电模式下动画降级 | Phase 1 |

---

## Phase 9: 润色 & 联调（Week 7-8）

| # | 任务 | 详情 | 涉及模块 |
|---|------|------|----------|
| 9.1 | Framer Motion 动效统一 | 审查全部页面动效一致性：页面切换 `AnimatePresence`，列表 `layout` 动画，按钮缩放 | 全局 |
| 9.2 | 触感反馈审查 | 确保所有可点击元素 `active:scale-95 transition` | 全局 |
| 9.3 | iOS 真机测试 | safe-area 适配、状态栏颜色、全屏表现、禁止全局滚动 | 全局 |
| 9.4 | Firestore Security Rules | 编写规则：仅 pair 成员可读写，expense 只能追加不能删除 | Phase 6 |
| 9.5 | 分模块加载 | 动态导入 `next/dynamic` + `React.lazy`，首屏 JS <1MB | 全局 |
| 9.6 | PWA 更新策略 | `serviceWorker.update()` 检测新版本，弹窗提示更新 | `src/app/layout.tsx` |
| 9.7 | 引导流程 | 首次使用：情侣昵称 → 预设示例账单 + 示例食谱 | 全局 |
| 9.8 | Edge Cases 覆盖 | 对照 PRD Edge Cases 表逐一验证修复 | 全局 |
| 9.9 | 双人同时编辑冲突 | Firestore 最后写入胜出 + 短暂提示"清单已更新" | Phase 6 |

---

## Phase 10: 测试 & 上线（Week 8）

| # | 任务 | 详情 | 工具 |
|---|------|------|------|
| 10.1 | 单元测试 | 工具函数、hooks、数据转换逻辑 | Vitest / Jest |
| 10.2 | 集成测试 | 核心流程：记账→统计→AI 分析，盲盒→清单→记忆墙，日历→AI 提醒 | Testing Library |
| 10.3 | E2E 测试 | 用户旅程：打开→记账→盲盒→日历→设置 | Playwright / Cypress |
| 10.4 | Beta 内测 | 邀请真实情侣内测，收集反馈 | — |
| 10.5 | 修复上线 | 内测 bug 修复 → 正式发布 | — |

---

## 里程碑时间线

| 节点 | 时间 | 交付物 | 验收标准 |
|------|------|--------|----------|
| **M1: App 壳子** | Week 1 末 | 5-Tab 导航、路由全通 | 所有 Tab 可切换、➕ 凸出弹出记账、safe-area 正常 |
| **M2: 账单 MVP** | Week 3 末 | 完整记账流程 | 32 分类选择→金额→保存→预算更新→流水列表→编辑→统计页 |
| **M3: 食谱 + 日历 MVP** | Week 5 末 | 厨房 + 日历完整可用 | 盲盒抽菜/清单/记忆墙 + 月视图/生理期/纪念日/生日标记 |
| **M4: 设置 + 数据层** | Week 6 末 | 设置页 + Firebase 数据层 | 分类管理/食谱管理/预算设置 + 双人实时同步/离线 |
| **M5: AI 接入** | Week 7 末 | AI 全功能可用 | 财务分析/食谱推荐/提醒建议/智能归类 |
| **🏁 Beta Launch** | Week 8 末 | 全功能 Beta 版本 | 内测、E2E 通过、iOS 真机验证 |

---

## 关键技术决策备忘

| 决策项 | 选择 | 理由 |
|--------|------|------|
| LLM API | GPT-4o-mini / Claude Haiku | 平衡成本与中文质量 |
| 双人配对 | 邀请码 + 扫码 | 简单安全，无需邮箱 |
| 离线策略 | Firestore 离线持久化 | 原生支持，无需额外工作 |
| AI 生成时机 | 每月 1 号自动 + 用户主动触发 | 体验与成本兼顾 |
| 照片存储 | Firebase Storage（压缩后上传） | 成本可控，不走 Firestore base64 |
| PWA 更新 | 检测到新版 → Toast "更新可用" → 手动刷新 | 不打断用户 |
| 测试工具 | Vitest + Testing Library + Playwright | 生态成熟，配置轻量 |
