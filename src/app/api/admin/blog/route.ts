import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

const BlogSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().min(2).max(220).regex(/^[a-z0-9-]+$/).optional(),
  excerpt: z.string().max(500).optional().nullable(),
  content: z.string().min(10),
  featuredImage: z.string().optional().nullable(),
  category: z.string().max(80).optional().nullable(),
  tags: z.string().max(500).optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  isFeatured: z.boolean().optional(),
  readingMinutes: z.number().int().min(1).max(60).optional(),
  authorName: z.string().max(100).optional(),
  seoTitle: z.string().max(120).optional().nullable(),
  seoDescription: z.string().max(300).optional().nullable(),
})

function slugify(t: string) {
  return t.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').slice(0, 220)
}

async function auth() { return await getSession() }

export async function GET(req: NextRequest) {
  if (!await auth()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const sp = req.nextUrl.searchParams
  const page = Math.max(1, parseInt(sp.get('page') ?? '1'))
  const search = sp.get('search') ?? ''
  const status = sp.get('status') ?? ''
  const perPage = 20
  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (search) where.OR = [{ title: { contains: search } }, { category: { contains: search } }]
  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page-1)*perPage, take: perPage }),
    prisma.blogPost.count({ where }),
  ])
  return Response.json({ posts, total, pages: Math.ceil(total/perPage) })
}

export async function POST(req: NextRequest) {
  if (!await auth()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const parsed = BlogSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
  const d = parsed.data
  const slug = d.slug ?? slugify(d.title)
  const existing = await prisma.blogPost.findUnique({ where: { slug } })
  if (existing) return Response.json({ error: 'Slug already exists' }, { status: 409 })
  const post = await prisma.blogPost.create({
    data: {
      title: d.title, slug, excerpt: d.excerpt ?? null, content: d.content,
      featuredImage: d.featuredImage ?? null, category: d.category ?? null,
      tags: d.tags ?? null, status: d.status ?? 'DRAFT',
      isFeatured: d.isFeatured ?? false, readingMinutes: d.readingMinutes ?? 3,
      authorName: d.authorName ?? 'Radhe Krishna Cab',
      seoTitle: d.seoTitle ?? null, seoDescription: d.seoDescription ?? null,
      publishedAt: d.status === 'PUBLISHED' ? new Date() : null,
    },
  })
  return Response.json({ post }, { status: 201 })
}
