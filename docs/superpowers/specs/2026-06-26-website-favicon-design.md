# 网站 Favicon 图标 — 设计规格

## 概述

为网站导航卡片添加 favicon 图标展示，替代当前纯文字列表的单调外观。提交时自动获取 favicon URL，展示时优先显示图标，无图标时显示域名首字母头像。

## 技术方案

### Favicon 获取（后端，提交时触发）

在网站提交创建时，自动尝试获取 favicon URL：

1. **先试 HEAD `https://域名/favicon.ico`**：如果返回 200，直接用这个 URL
2. **如果 404，fetch 网站首页 HTML**：解析 `<link rel="icon">` 或 `<link rel="shortcut icon">` 标签的 `href`，拼成完整 URL
3. **都没找到**：favicon 字段留空

实现为 `src/lib/favicon.ts` 中的 `discoverFavicon(url)` 函数，在 `POST /api/websites` 创建网站时调用，结果写入 `Website.favicon` 字段。

超时设置 5 秒，避免拖慢提交流程。fetch 失败时静默降级，不影响提交成功率。

### 展示（前端，WebsiteCard 组件）

在 `WebsiteCard` 左侧（投票按钮和文字之间）添加图标：

- **有 favicon URL**：渲染 `<img>` 标签，32x32px，圆角，带 fallback 处理
- **空或加载失败**：显示域名首字母圆形头像（蓝色背景 + 白色字母）

字母头像的实现：取 hostname 的第一个字符转大写，用 Tailwind 的 `rounded-full` + `bg-blue-500` + `flex items-center justify-center` 实现，不需要额外依赖。

### 已有数据补录

种子数据中的 8 个网站补充 favicon URL。已知的公共网站 favicon：
- Figma: `https://www.figma.com/favicon.ico`
- GitHub: `https://github.com/favicon.ico`
- 其他类似，手动写入 seed 脚本或 ALTER 数据库

## 涉及文件

| 文件 | 变更 |
|------|------|
| `src/lib/favicon.ts` | **新增** — `discoverFavicon(url)` 函数 |
| `src/app/api/websites/route.ts` | **修改** — POST 创建时调用 `discoverFavicon` |
| `src/components/WebsiteCard.tsx` | **修改** — 渲染 favicon 或字母头像 |
| `prisma/seed.ts` | **修改** — 种子数据补充 favicon URL |
