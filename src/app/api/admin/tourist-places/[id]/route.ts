import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

const UpdateSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  slug: z.string().min(2).max(220).regex(/^[a-z0-9-]+$/).optional(),
  shortDescription: z.string().max(1000).optional().nullable(),
  description: z.string().optional().nullable(),
  featuredImage: z.string().optional().nullable(),
  galleryImages: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  stateId: z.number().int().positive().optional(),
  districtId: z.number().int().positive().optional().nullable(),
  cityName: z.string().max(120).optional().nullable(),
  categoryId: z.number().int().positive().optional().nullable(),
  tags: z.string().max(500).optional().nullable(),
  visitingHours: z.string().max(300).optional().nullable(),
  entryFee: z.string().max(300).optional().nullable(),
  bestTimeToVisit: z.string().max(300).optional().nullable(),
  visitDuration: z.string().max(200).optional().nullable(),
  nearbyPlaces: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  isFeatured: z.boolean().optional(),
  seoTitle: z.string().max(120).optional().nullable(),
  seoDescription: z.string().max(300).optional().nullable(),
  seoKeywords: z.string().max(300).optional().nullable(),
})

async function auth() { return await getSession() }

function toNumber(v: unknown): number | undefined | null {
  if (v === null || v === undefined || v === '') return undefined
  const n = Number(v)
  return Number.isNaN(n) ? undefined : n
}

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/admin/tourist-places/[id]'>) {
  if (!await auth()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const place = await prisma.touristPlace.findUnique({
    where: { id: parseInt(id) },
    include: { state: true, district: true, category: true },
  })
  if (!place) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json({ place })
}

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/admin/tourist-places/[id]'>) {
  if (!await auth()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const body = await req.json()

  // Coerce numeric string fields to numbers
  const coerced = { ...body }
  if (coerced.stateId !== undefined) coerced.stateId = toNumber(coerced.stateId)
  if (coerced.districtId !== undefined) coerced.districtId = coerced.districtId === '' ? null : toNumber(coerced.districtId)
  if (coerced.categoryId !== undefined) coerced.categoryId = coerced.categoryId === '' ? null : toNumber(coerced.categoryId)
  if (coerced.latitude !== undefined) coerced.latitude = coerced.latitude === '' ? null : toNumber(coerced.latitude)
  if (coerced.longitude !== undefined) coerced.longitude = coerced.longitude === '' ? null : toNumber(coerced.longitude)

  const parsed = UpdateSchema.safeParse(coerced)
  if (!parsed.success) return Response.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })

  const existing = await prisma.touristPlace.findUnique({ where: { id: parseInt(id) } })
  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })

  const d = parsed.data
  // Ensure slug uniqueness if changed
  if (d.slug && d.slug !== existing.slug) {
    const dup = await prisma.touristPlace.findUnique({ where: { slug: d.slug } })
    if (dup) return Response.json({ error: 'Slug already exists' }, { status: 409 })
  }

  const place = await prisma.touristPlace.update({
    where: { id: parseInt(id) },
    data: {
      name: d.name,
      slug: d.slug,
      shortDescription: d.shortDescription,
      description: d.description,
      featuredImage: d.featuredImage,
      galleryImages: d.galleryImages,
      address: d.address,
      latitude: d.latitude,
      longitude: d.longitude,
      stateId: d.stateId,
      districtId: d.districtId,
      cityName: d.cityName,
      categoryId: d.categoryId,
      tags: d.tags,
      visitingHours: d.visitingHours,
      entryFee: d.entryFee,
      bestTimeToVisit: d.bestTimeToVisit,
      visitDuration: d.visitDuration,
      nearbyPlaces: d.nearbyPlaces,
      status: d.status,
      isFeatured: d.isFeatured,
      seoTitle: d.seoTitle,
      seoDescription: d.seoDescription,
      seoKeywords: d.seoKeywords,
    },
  })
  return Response.json({ place })
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/admin/tourist-places/[id]'>) {
  if (!await auth()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  await prisma.touristPlace.delete({ where: { id: parseInt(id) } })
  return Response.json({ success: true })
}
