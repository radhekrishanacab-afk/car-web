import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  if (!await getSession()) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const categories = await prisma.blogCategory.findMany({
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
  })

  // Also include legacy categories from posts that aren't in the BlogCategory table yet
  const legacyPosts = await prisma.blogPost.findMany({
    select: { category: true },
    where: { AND: [{ category: { not: null } }, { category: { not: '' } }] },
    distinct: ['category'],
  })
  const managedNames = new Set(categories.map(c => c.name.toLowerCase()))
  const legacy = legacyPosts
    .map(p => p.category)
    .filter((c): c is string => !!c && !managedNames.has(c.toLowerCase()))

  return Response.json({ categories, legacy })
}

export async function POST(req: Request) {
  if (!await getSession()) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const name = String(body.name ?? '').trim()
  if (!name) return Response.json({ error: 'Category name is required' }, { status: 400 })

  const displayOrder = body.displayOrder != null ? parseInt(body.displayOrder) : 0
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').slice(0, 100)

  try {
    const category = await prisma.blogCategory.create({
      data: { name, slug, displayOrder: isNaN(displayOrder) ? 0 : displayOrder },
    })
    return Response.json({ category })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to create category'
    if (msg.includes('Unique constraint')) {
      return Response.json({ error: 'A category with this name already exists' }, { status: 409 })
    }
    return Response.json({ error: msg }, { status: 500 })
  }
}
