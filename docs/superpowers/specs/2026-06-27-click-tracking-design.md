# Click-Based Ranking Design

> **日期:** 2026-06-27  
> **目标:** 去掉手动点赞/踩，改为按网站点击跳转次数统计热度排名

## 概述

移除人工投票机制（▲/▼），替换为自动点击追踪。用户点击网站链接跳转到外站时，服务端记录点击事件。统计逻辑与旧投票相同：按 IP+UA hash 生成 visitorId，每个访客每个网站只计一次。现有投票数据迁移为初始点击量。

## 数据库

### 新增 Jump 表

```prisma
model Jump {
  id        Int      @id @default(autoincrement())
  websiteId Int      @map("website_id")
  visitorId String   @map("visitor_id")
  website   Website  @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now()) @map("created_at")

  @@unique([websiteId, visitorId])
  @@map("jumps")
}
```

### Website 表改动

- **新增** `jumpCount Int @default(0) @map("jump_count")`
- **新增索引** `@@index([jumpCount])`
- 保留 `upVotes`、`downVotes`、`votes` 关系（稍后清理）

### 数据迁移

```sql
UPDATE websites SET jump_count = up_votes;
```

每条现有投票视为一次"访问点击"。

## API

### 新增: `POST /api/websites/[id]/jump`

- **入参**: 无 body
- **鉴权**: visitorId 由 `getVisitorId()` 自动生成（IP + User-Agent SHA256）
- **逻辑**:
  1. 查 Jump 是否存在（`websiteId_visitorId` unique 约束）
  2. 存在 → 幂等返回 200，不重复计数
  3. 不存在 → 创建 Jump 记录，`website.jumpCount` 原子 +1
  4. 返回 `{ jumpCount: number }`

### 待清理: `POST /api/websites/[id]/vote`

前端移除 VoteButtons 后删除此路由及 votes API。

## 前端

### WebsiteCard 改动

- 标题链接 `<a>` 保持原始 `href`，增加 `onClick` 调用 `navigator.sendBeacon('/api/websites/[id]/jump')`
- 移除 `VoteButtons` 组件（▲ ▼ 按钮）
- 右下角替换为只读数字展示：`jumpCount` 次访问
- Props: 去掉 `upVotes`/`downVotes`，加入 `jumpCount`

### 首页 page.tsx

- 热门网站排序: `jumpCount desc`（原 `upVotes desc, downVotes asc`）
- 组件属性从 votes 改为 `jumpCount`

### 删除

- `src/components/VoteButtons.tsx` — 不再需要

## 去重逻辑

与旧投票系统完全一致：

1. 服务端从请求头提取 `x-forwarded-for` / `x-real-ip` 和 `User-Agent`
2. `SHA256(ip:ua)` 取前 32 字符 = visitorId
3. 每个 `(websiteId, visitorId)` 组合只记录一条 Jump 记录
4. 重复点击：幂等返回，不增加计数

## 边界情况

- **用户禁用 JS**: sendBeacon 不触发，不影响正常跳转，但点击不计数（降级优雅）
- **同一 IP 多次点击**: 数据库 unique 约束阻止重复计数
- **代理/内网**: 按 `x-forwarded-for` 第一跳 IP 识别
- **现有投票数迁移失败**: 若 jump_count 为 NULL，排序时降级为 0
