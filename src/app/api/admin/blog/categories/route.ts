import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  if (!await getSession()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const posts = await prisma.blogPost.findMany({
    select: { category: true },
    where: { AND: [{ category: { not: null } }, { category: { not: '' } }] },
    distinct: ['category'],
    orderBy: { category: 'asc' },
  })
  const categories = posts.map(p => p.category).filter((c): c is string => !!c)
  return Response.json({ categories })
}
