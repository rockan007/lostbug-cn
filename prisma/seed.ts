import { PrismaClient } from '../src/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import { discoverFavicon } from '../src/lib/favicon'

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
})

const categories = [
  { name: 'AI 工具', slug: 'ai', sortOrder: 0 },
  { name: '设计工具', slug: 'design', sortOrder: 1 },
  { name: '开发资源', slug: 'dev', sortOrder: 2 },
  { name: '效率工具', slug: 'productivity', sortOrder: 3 },
  { name: '学习资源', slug: 'learning', sortOrder: 4 },
  { name: '资讯阅读', slug: 'news', sortOrder: 5 },
  { name: '生活服务', slug: 'life', sortOrder: 6 },
]

async function main() {
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    })
  }
  const sampleSites = [
    { title: 'Figma', url: 'https://www.figma.com', description: '协作式界面设计工具', category: 'design', tags: ['UI', '原型'] },
    { title: 'GitHub', url: 'https://github.com', description: '代码托管与协作平台', category: 'dev', tags: ['代码', '协作'] },
    { title: 'Notion', url: 'https://www.notion.so', description: '多功能笔记与知识管理', category: 'productivity', tags: ['笔记', '协作'] },
    { title: 'Obsidian', url: 'https://obsidian.md', description: '本地化 Markdown 笔记与知识库', category: 'productivity', tags: ['笔记', '知识库'] },
    { title: 'Canva', url: 'https://www.canva.cn', description: '在线平面设计工具', category: 'design', tags: ['设计', '模板'] },
    { title: 'MDN', url: 'https://developer.mozilla.org', description: 'Web 开发技术文档', category: 'dev', tags: ['文档', '前端'] },
    { title: '掘金', url: 'https://juejin.cn', description: '开发者技术社区', category: 'dev', tags: ['社区', '文章'] },
    { title: 'InfoQ', url: 'https://www.infoq.cn', description: '技术资讯与行业动态', category: 'news', tags: ['技术', '资讯'] },
    { title: '豆瓣', url: 'https://www.douban.com', description: '图书电影音乐社区', category: 'life', tags: ['书籍', '电影'] },
    { title: 'ChatGPT', url: 'https://chatgpt.com', description: 'OpenAI 对话式 AI 助手', category: 'ai', tags: ['AI', '对话'] },
    { title: 'Claude', url: 'https://claude.ai', description: 'Anthropic 出品的 AI 助手', category: 'ai', tags: ['AI', '对话'] },
    { title: 'Gemini', url: 'https://gemini.google.com', description: 'Google 多模态 AI 模型', category: 'ai', tags: ['AI', '多模态'] },
    { title: 'DeepSeek', url: 'https://chat.deepseek.com', description: '国产开源大语言模型', category: 'ai', tags: ['AI', '开源'] },
    { title: 'Kimi', url: 'https://kimi.moonshot.cn', description: '月之暗面 AI 长文本助手', category: 'ai', tags: ['AI', '长文本'] },
    { title: 'Perplexity', url: 'https://www.perplexity.ai', description: 'AI 驱动的搜索引擎', category: 'ai', tags: ['AI', '搜索'] },
    { title: 'Midjourney', url: 'https://www.midjourney.com', description: 'AI 图像生成工具', category: 'ai', tags: ['AI', '图像'] },
    { title: '通义千问', url: 'https://tongyi.aliyun.com', description: '阿里云 AI 大模型', category: 'ai', tags: ['AI', '对话'] },
    { title: '智谱AI', url: 'https://open.bigmodel.cn', description: '智谱AI大模型开放平台', category: 'ai', tags: ['AI', '大模型'] },
    { title: 'Coursera', url: 'https://www.coursera.org', description: '全球名校在线课程平台', category: 'learning', tags: ['课程', '名校'] },
    { title: 'B站', url: 'https://www.bilibili.com', description: '海量免费中文视频教程', category: 'learning', tags: ['视频', '教程'] },
    { title: 'freeCodeCamp', url: 'https://www.freecodecamp.org', description: '免费编程学习平台', category: 'learning', tags: ['编程', '免费'] },
    { title: 'LeetCode', url: 'https://leetcode.cn', description: '算法面试刷题平台', category: 'learning', tags: ['算法', '面试'] },
    { title: '网易公开课', url: 'https://open.163.com', description: '国内外名校公开课', category: 'learning', tags: ['课程', '公开课'] },
    { title: 'd2l.ai', url: 'https://d2l.ai', description: '动手学深度学习在线教材', category: 'learning', tags: ['深度学习', '教材'] },
    { title: 'Google Developers', url: 'https://developers.google.com', description: 'Google 开发者文档', category: 'learning', tags: ['文档', '开发'] },
  ]

  for (const site of sampleSites) {
    const category = await prisma.category.findUnique({ where: { slug: site.category } })
    if (!category) continue

    // Dynamically discover the favicon — no hardcoded URLs
    const favicon = await discoverFavicon(site.url)
    console.log(`  ${site.title}: ${favicon || '(no favicon found)'}`)

    await prisma.website.upsert({
      where: { url: site.url },
      update: favicon ? { favicon } : {},
      create: {
        title: site.title,
        url: site.url,
        description: site.description,
        favicon,
        categoryId: category.id,
        status: 'approved',
        jumpCount: Math.floor(Math.random() * 100),
        tags: {
          create: site.tags.map(tagName => ({
            tag: {
              connectOrCreate: {
                where: { slug: tagName.toLowerCase() },
                create: { name: tagName, slug: tagName.toLowerCase() },
              },
            },
          })),
        },
      },
    })
  }
  console.log('Seeded sample websites')

  console.log('Seeded categories')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
