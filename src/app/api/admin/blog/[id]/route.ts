import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

const UpdateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  excerpt: z.string().max(500).optional().nullable(),
  content: z.string().min(10).optional(),
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

async function auth() { return await getSession() }

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/admin/blog/[id]'>) {
  if (!await auth()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const post = await prisma.blogPost.findUnique({ where: { id: parseInt(id) } })
  if (!post) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json({ post })
}

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/admin/blog/[id]'>) {
  if (!await auth()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const body = await req.json()
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
  const d = parsed.data
  const existing = await prisma.blogPost.findUnique({ where: { id: parseInt(id) } })
  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })
  const post = await prisma.blogPost.update({
    where: { id: parseInt(id) },
    data: {
      ...d,
      publishedAt: d.status === 'PUBLISHED' && !existing.publishedAt ? new Date() : existing.publishedAt,
    },
  })
  return Response.json({ post })
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/admin/blog/[id]'>) {
  if (!await auth()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  await prisma.blogPost.delete({ where: { id: parseInt(id) } })
  return Response.json({ success: true })
}
