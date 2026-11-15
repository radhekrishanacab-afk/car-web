import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const UpdateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  excerpt: z.string().max(500).optional().nullable(),
  content: z.string().min(10).optional(),
  featuredImage: z.string().optional().nullable(),
  category: z.string().max(80).optional().nullable(),
  showCategory: z.boolean().optional(),
  tags: z.string().max(500).optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  isFeatured: z.boolean().optional(),
  homepagePosition: z.number().int().min(1).max(4).optional().nullable(),
  homepageTitle: z.string().max(200).optional().nullable(),
  homepageDescription: z.string().max(500).optional().nullable(),
  homepageImage: z.string().max(2_500_000).optional().nullable(),
  homepageButtonLabel: z.string().max(80).optional().nullable(),
  homepageWhatsappMessage: z.string().max(500).optional().nullable(),
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

  const post = await prisma.$transaction(async tx => {
    if (d.homepagePosition) {
      await tx.blogPost.updateMany({
        where: { homepagePosition: d.homepagePosition, NOT: { id: parseInt(id) } },
        data: { homepagePosition: null },
      })
    }
    return tx.blogPost.update({
      where: { id: parseInt(id) },
      data: {
        ...d,
        publishedAt: d.status === 'PUBLISHED' && !existing.publishedAt ? new Date() : existing.publishedAt,
      },
    })
  })
  revalidatePath('/')
  revalidatePath('/blog')
  revalidatePath(`/blog/${post.slug}`)
  return Response.json({ post })
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/admin/blog/[id]'>) {
  if (!await auth()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const post = await prisma.blogPost.delete({ where: { id: parseInt(id) } })
  revalidatePath('/')
  revalidatePath('/blog')
  revalidatePath(`/blog/${post.slug}`)
  return Response.json({ success: true })
}
