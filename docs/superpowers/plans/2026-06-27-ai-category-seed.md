# AI 分类与种子数据 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增「AI 工具」分类，添加 8 个热门 AI 网站种子数据，Sidebar 显示 🤖 图标

**Architecture:** 纯种子数据扩展 — `prisma/seed.ts` 新增分类和网站，`Sidebar.tsx` 新增图标映射。无 schema 变更。

**Tech Stack:** Prisma 7, PostgreSQL, React 19, TypeScript

## Global Constraints

- favicon 通过 `discoverFavicon` 动态获取，严禁硬编码
- 分类 slug 为 `ai`，sortOrder 为 7
- Sidebar 图标 `ai: '🤖'`

---

### Task 1: 新增 AI 分类 + 种子数据 + Sidebar 图标

**Files:**
- Modify: `prisma/seed.ts`
- Modify: `src/components/Sidebar.tsx`

**Interfaces:**
- 无外部依赖，纯数据追加

- [ ] **Step 1: 在 seed.ts categories 数组新增 ai 分类**

在 `prisma/seed.ts` 的 `categories` 数组末尾追加：

```typescript
  { name: 'AI 工具', slug: 'ai', sortOrder: 7 },
```

- [ ] **Step 2: 在 seed.ts sampleSites 数组新增 8 个 AI 网站**

在 `prisma/seed.ts` 的 `sampleSites` 数组末尾追加：

```typescript
    { title: 'ChatGPT', url: 'https://chatgpt.com', description: 'OpenAI 对话式 AI 助手', category: 'ai', tags: ['AI', '对话'] },
    { title: 'Claude', url: 'https://claude.ai', description: 'Anthropic 出品的 AI 助手', category: 'ai', tags: ['AI', '对话'] },
    { title: 'Gemini', url: 'https://gemini.google.com', description: 'Google 多模态 AI 模型', category: 'ai', tags: ['AI', '多模态'] },
    { title: 'DeepSeek', url: 'https://chat.deepseek.com', description: '国产开源大语言模型', category: 'ai', tags: ['AI', '开源'] },
    { title: 'Kimi', url: 'https://kimi.moonshot.cn', description: '月之暗面 AI 长文本助手', category: 'ai', tags: ['AI', '长文本'] },
    { title: 'Perplexity', url: 'https://www.perplexity.ai', description: 'AI 驱动的搜索引擎', category: 'ai', tags: ['AI', '搜索'] },
    { title: 'Midjourney', url: 'https://www.midjourney.com', description: 'AI 图像生成工具', category: 'ai', tags: ['AI', '图像'] },
    { title: '通义千问', url: 'https://tongyi.aliyun.com', description: '阿里云 AI 大模型', category: 'ai', tags: ['AI', '对话'] },
```

- [ ] **Step 3: Sidebar ICONS 新增 ai 图标**

在 `src/components/Sidebar.tsx` 的 `ICONS` 对象中追加：

```typescript
  ai: '🤖',
```

- [ ] **Step 4: Build 验证**

```bash
npx next build 2>&1 | tail -5
```

Expected: Build 成功，无错误。

- [ ] **Step 5: 运行 seed 验证**

```bash
npx tsx prisma/seed.ts
```

Expected: 输出新站点的 favicon 发现结果，无报错。

- [ ] **Step 6: Commit**

```bash
git add prisma/seed.ts src/components/Sidebar.tsx
git commit -m "feat: add AI category and seed data"
```
