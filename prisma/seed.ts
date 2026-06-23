import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

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
  console.log('Seeded categories')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
