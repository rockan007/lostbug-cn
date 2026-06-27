# AI 分类与种子数据

> **日期:** 2026-06-27  
> **目标:** 新增「AI 工具」分类，添加热门 AI 网站到种子数据

## 概述

当前站点缺少 AI 相关内容。新增 ai 分类，并添加 8 个热门 AI 网站（ChatGPT、Claude、Gemini、DeepSeek、Kimi、Perplexity、Midjourney、通义千问）。

## 数据库

### 新增分类

通过 seed 脚本 upsert，不涉及 schema 变更：

```typescript
{ name: 'AI 工具', slug: 'ai', sortOrder: 7 }
```

## 种子数据

| 网站 | URL | 描述 | 分类 | 标签 |
|------|-----|------|------|------|
| ChatGPT | https://chatgpt.com | OpenAI 对话式 AI 助手 | ai | AI, 对话 |
| Claude | https://claude.ai | Anthropic 出品的 AI 助手 | ai | AI, 对话 |
| Gemini | https://gemini.google.com | Google 多模态 AI 模型 | ai | AI, 多模态 |
| DeepSeek | https://chat.deepseek.com | 国产开源大语言模型 | ai | AI, 开源 |
| Kimi | https://kimi.moonshot.cn | 月之暗面 AI 长文本助手 | ai | AI, 长文本 |
| Perplexity | https://www.perplexity.ai | AI 驱动的搜索引擎 | ai | AI, 搜索 |
| Midjourney | https://www.midjourney.com | AI 图像生成工具 | ai | AI, 图像 |
| 通义千问 | https://tongyi.aliyun.com | 阿里云 AI 大模型 | ai | AI, 对话 |

## 前端

### Sidebar 图标

`Sidebar.tsx` 的 `ICONS` 映射新增 `ai: '🤖'`。

## favicon 发现

种子脚本已支持 `discoverFavicon` 动态获取 favicon，无需硬编码。
