import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

const CreateSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(220).regex(/^[a-z0-9-]+$/).optional(),
  shortDescription: z.string().max(1000).optional().nullable(),
  description: z.string().optional().nullable(),
  featuredImage: z.string().optional().nullable(),
  galleryImages: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  stateId: z.number().int().positive(),
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

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').slice(0, 220)
}

async function auth() { return await getSession() }

export async function GET(req: NextRequest) {
  if (!await auth()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const sp = req.nextUrl.searchParams
  const page = Math.max(1, parseInt(sp.get('page') ?? '1'))
  const search = sp.get('search') ?? ''
  const status = sp.get('status') ?? ''
  const perPage = 50
  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { cityName: { contains: search, mode: 'insensitive' } }]
  const [places, total] = await Promise.all([
    prisma.touristPlace.findMany({ where, include: { state: true, category: true }, orderBy: { updatedAt: 'desc' }, skip: (page - 1) * perPage, take: perPage }),
    prisma.touristPlace.count({ where }),
  ])
  return Response.json({ places, total, pages: Math.ceil(total / perPage) })
}

export async function POST(req: NextRequest) {
  if (!await auth()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()

  const coerced = { ...body }
  if (coerced.latitude === '' || coerced.latitude === undefined) coerced.latitude = null
  if (coerced.longitude === '' || coerced.longitude === undefined) coerced.longitude = null
  if (coerced.districtId === '' || coerced.districtId === undefined) coerced.districtId = null
  if (coerced.categoryId === '' || coerced.categoryId === undefined) coerced.categoryId = null
  coerced.stateId = Number(coerced.stateId)
  if (coerced.districtId) coerced.districtId = Number(coerced.districtId)
  if (coerced.categoryId) coerced.categoryId = Number(coerced.categoryId)
  if (coerced.latitude != null) coerced.latitude = Number(coerced.latitude)
  if (coerced.longitude != null) coerced.longitude = Number(coerced.longitude)

  const parsed = CreateSchema.safeParse(coerced)
  if (!parsed.success) return Response.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })

  const d = parsed.data
  const slug = d.slug ?? slugify(d.name)
  const existing = await prisma.touristPlace.findUnique({ where: { slug } })
  if (existing) return Response.json({ error: 'Slug already exists' }, { status: 409 })

  const place = await prisma.touristPlace.create({
    data: {
      name: d.name, slug,
      shortDescription: d.shortDescription ?? null,
      description: d.description ?? null,
      featuredImage: d.featuredImage ?? null,
      galleryImages: d.galleryImages ?? null,
      address: d.address ?? null,
      latitude: d.latitude ?? null,
      longitude: d.longitude ?? null,
      stateId: d.stateId,
      districtId: d.districtId ?? null,
      cityName: d.cityName ?? null,
      categoryId: d.categoryId ?? null,
      tags: d.tags ?? null,
      visitingHours: d.visitingHours ?? null,
      entryFee: d.entryFee ?? null,
      bestTimeToVisit: d.bestTimeToVisit ?? null,
      visitDuration: d.visitDuration ?? null,
      nearbyPlaces: d.nearbyPlaces ?? null,
      status: d.status ?? 'DRAFT',
      isFeatured: d.isFeatured ?? false,
      seoTitle: d.seoTitle ?? null,
      seoDescription: d.seoDescription ?? null,
      seoKeywords: d.seoKeywords ?? null,
    },
  })
  return Response.json({ place }, { status: 201 })
}
