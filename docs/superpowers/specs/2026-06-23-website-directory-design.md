# 网站导航收藏 — 设计规格

## 概述

一个线上部署的网站导航工具，收集工作和生活中常用的网站，支持分类浏览、标签筛选、全文搜索。允许匿名用户提交推荐，管理员审核后上架，所有访客可对网站投票。

- **规模定位**：小范围使用（自己 + 团队/朋友，几十到几百人）
- **部署目标**：国内服务器，公网可访问

## 技术栈

| 层面 | 选择 | 原因 |
|------|------|------|
| 前端框架 | Next.js 14 (App Router) | 一套代码处理页面渲染和 API |
| 样式 | Tailwind CSS | 快速出 UI，小项目不需要组件库 |
| 语言 | TypeScript | 类型安全 |
| ORM | Prisma | 类型安全的数据库操作，迁移管理方便 |
| 数据库 | PostgreSQL (云数据库) | 成熟稳定，内置全文搜索 |
| 搜索 | PostgreSQL tsvector | 数据量小，不需要 Elasticsearch |
| 部署 | 阿里云/腾讯云轻量服务器 | 国内访问快，成本可控 |
| 运行 | PM2 守护 + Nginx 反向代理 | 简单可靠 |

## 数据模型

### Category 分类
- id, name, slug, sort_order
- 一对多关联 Website

### Website 网站
- id, title, url, description, favicon
- category_id (FK → Category)
- status: `pending | approved | rejected`
- submitter_name (可选，提交者署名)
- up_votes, down_votes (冗余计数)
- created_at, updated_at

### Tag 标签
- id, name, slug
- 多对多关联 Website（通过 WebsiteTag）

### Vote 投票
- id, website_id (FK → Website)
- vote_type: `up | down`
- visitor_id (IP + User-Agent 哈希)
- created_at
- 唯一约束：(website_id, visitor_id)

**设计要点**：
- 不建 User 表，与 "无需登录" 保持一致
- 投票计数冗余存储在 Website 表，避免高频 count 查询
- 提交就是一条 status=pending 的 Website 记录

## 页面与路由

### 用户端

| 路由 | 页面 | 内容 |
|------|------|------|
| `/` | 首页 | 热门推荐 (Top 10) + 分类卡片 + 最新添加 |
| `/category/[slug]` | 分类页 | 标签筛选 + 网站卡片列表 (按投票排序) |
| `/search?q=` | 搜索页 | 全文搜索结果，关键词高亮 |
| `/submit` | 提交页 | 匿名提交表单 |

### 管理端（密码保护）

| 路由 | 页面 | 内容 |
|------|------|------|
| `/admin` | 管理首页 | 待审核数量 + 快捷入口 |
| `/admin/review` | 审核页 | 待审核列表，逐条通过/拒绝/编辑 |
| `/admin/sites` | 网站管理 | 全量网站列表，支持编辑/删除 |

### 导航结构

顶部导航栏常驻：Logo | 分类下拉 | 搜索框 | 提交按钮

## 核心功能

### 匿名提交
1. 访客填写表单（网站名、URL、分类、标签、简介）
2. 提交前检查 URL 是否已存在
3. 写入数据库 status=pending
4. 提示 "提交成功，等待审核"

### 管理员审核
1. 访问 /admin，输入 ADMIN_PASSWORD
2. 设置加密 cookie，有效期 24h
3. 逐条审核：通过 / 拒绝 / 编辑后通过

### 投票
- 每个网站卡片显示 ▲ N ▼ M
- 点击即投票，无需登录
- 同一 visitor_id 对同一网站只能投一票，可切换 up/down
- 首页热门按 (up_votes - down_votes) 排序

### 搜索
- PostgreSQL tsvector 对 title + description 建立全文索引
- 导航栏搜索框常驻
- 结果页显示标题、URL、匹配片段高亮、分类、标签
- 可叠加分类 + 标签过滤

## 非功能需求

- **安全**：管理端密码通过环境变量注入，cookie 签名防篡改
- **性能**：投票计数冗余避免 count 查询；静态资源走 CDN
- **防滥用**：visitor_id 防重复投票；提交表单加 rate limit
- **待定**：备案域名（国内部署需要）
