import { PrismaClient } from '../src/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
})

const categories = [
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
    { title: 'Figma', url: 'https://www.figma.com', description: '协作式界面设计工具', category: 'design', tags: ['UI', '原型'], favicon: 'https://www.figma.com/favicon.ico' },
    { title: 'GitHub', url: 'https://github.com', description: '代码托管与协作平台', category: 'dev', tags: ['代码', '协作'], favicon: 'https://github.com/favicon.ico' },
    { title: 'Notion', url: 'https://www.notion.so', description: '多功能笔记与知识管理', category: 'productivity', tags: ['笔记', '协作'], favicon: 'https://www.notion.so/favicon.ico' },
    { title: 'Canva', url: 'https://www.canva.com', description: '在线平面设计工具', category: 'design', tags: ['设计', '模板'], favicon: 'https://www.canva.com/favicon.ico' },
    { title: 'MDN', url: 'https://developer.mozilla.org', description: 'Web 开发技术文档', category: 'dev', tags: ['文档', '前端'], favicon: 'https://developer.mozilla.org/favicon.ico' },
    { title: '掘金', url: 'https://juejin.cn', description: '开发者技术社区', category: 'dev', tags: ['社区', '文章'], favicon: 'https://juejin.cn/favicon.ico' },
    { title: 'InfoQ', url: 'https://www.infoq.cn', description: '技术资讯与行业动态', category: 'news', tags: ['技术', '资讯'], favicon: 'https://www.infoq.cn/favicon.ico' },
    { title: '豆瓣', url: 'https://www.douban.com', description: '图书电影音乐社区', category: 'life', tags: ['书籍', '电影'], favicon: 'https://www.douban.com/favicon.ico' },
  ]

  for (const site of sampleSites) {
    const category = await prisma.category.findUnique({ where: { slug: site.category } })
    if (!category) continue
    await prisma.website.upsert({
      where: { url: site.url },
      update: {},
      create: {
        title: site.title,
        url: site.url,
        description: site.description,
        favicon: site.favicon,
        categoryId: category.id,
        status: 'approved',
        upVotes: Math.floor(Math.random() * 20) + 1,
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
