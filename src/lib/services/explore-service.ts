import { prisma } from '../prisma'

// ── Public queries — only PUBLISHED places ────────────────────────────────

export async function getFeaturedPlaces(limit = 8) {
  return prisma.touristPlace.findMany({
    where: { status: 'PUBLISHED', isFeatured: true },
    include: {
      state: { select: { name: true, slug: true } },
      district: { select: { name: true, slug: true } },
      category: { select: { name: true, slug: true, icon: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: limit,
  })
}

export async function getAllPublishedPlaces(opts?: {
  stateSlug?: string
  categorySlug?: string
  search?: string
  page?: number
  perPage?: number
}) {
  const { stateSlug, categorySlug, search, page = 1, perPage = 12 } = opts ?? {}

  // Build where clause for SQLite (no nested OR with relations — use sub-queries)
  const stateFilter = stateSlug
    ? { stateId: (await prisma.indianState.findUnique({ where: { slug: stateSlug }, select: { id: true } }))?.id }
    : undefined

  const categoryFilter = categorySlug
    ? { categoryId: (await prisma.placeCategory.findUnique({ where: { slug: categorySlug }, select: { id: true } }))?.id }
    : undefined

  const where: Record<string, unknown> = { status: 'PUBLISHED' }

  if (stateFilter?.stateId) where.stateId = stateFilter.stateId
  if (categoryFilter?.categoryId) where.categoryId = categoryFilter.categoryId
  if (search) {
    // SQLite doesn't support contains with OR at relation level — filter on flat fields
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { cityName: { contains: search, mode: 'insensitive' } },
      { tags: { contains: search, mode: 'insensitive' } },
      { shortDescription: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [places, total] = await Promise.all([
    prisma.touristPlace.findMany({
      where,
      include: {
        state: { select: { name: true, slug: true } },
        district: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true, icon: true } },
      },
      orderBy: [{ isFeatured: 'desc' }, { name: 'asc' }],
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.touristPlace.count({ where }),
  ])

  return { places, total, pages: Math.ceil(total / perPage) }
}

export async function getPlaceBySlug(slug: string) {
  return prisma.touristPlace.findFirst({
    where: { slug, status: 'PUBLISHED' },
    include: { state: true, district: true, category: true },
  })
}

export async function getPlacesByState(stateSlug: string, limit = 20) {
  const state = await prisma.indianState.findUnique({ where: { slug: stateSlug }, select: { id: true } })
  if (!state) return []
  return prisma.touristPlace.findMany({
    where: { status: 'PUBLISHED', stateId: state.id },
    include: {
      state: { select: { name: true, slug: true } },
      district: { select: { name: true, slug: true } },
      category: { select: { name: true, slug: true, icon: true } },
    },
    orderBy: [{ isFeatured: 'desc' }, { name: 'asc' }],
    take: limit,
  })
}

export async function getAllActiveStates() {
  const states = await prisma.indianState.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })
  // Get place counts separately (SQLite-safe)
  const counts = await prisma.touristPlace.groupBy({
    by: ['stateId'],
    where: { status: 'PUBLISHED' },
    _count: { id: true },
  })
  const countMap = new Map(counts.map(c => [c.stateId, c._count.id]))
  return states.map(s => ({ ...s, placeCount: countMap.get(s.id) ?? 0 }))
}

export async function getAllCategories() {
  const cats = await prisma.placeCategory.findMany({ orderBy: { displayOrder: 'asc' } })
  const counts = await prisma.touristPlace.groupBy({
    by: ['categoryId'],
    where: { status: 'PUBLISHED' },
    _count: { id: true },
  })
  const countMap = new Map(counts.map(c => [c.categoryId, c._count.id]))
  return cats.map(c => ({ ...c, placeCount: countMap.get(c.id) ?? 0 }))
}

export async function getPublishedPlacesWithCoords() {
  return prisma.touristPlace.findMany({
    where: { status: 'PUBLISHED', NOT: [{ latitude: null }, { longitude: null }] },
    select: {
      id: true, name: true, slug: true,
      latitude: true, longitude: true, cityName: true, featuredImage: true,
      category: { select: { name: true, icon: true } },
      state: { select: { name: true, slug: true } },
      district: { select: { name: true, slug: true } },
    },
  })
}

export async function getDistrictsByState(stateSlug: string) {
  const state = await prisma.indianState.findUnique({ where: { slug: stateSlug }, select: { id: true } })
  if (!state) return []
  return prisma.indianDistrict.findMany({
    where: { stateId: state.id, isActive: true },
    orderBy: { name: 'asc' },
  })
}

export async function getPlacesByDistrict(districtSlug: string) {
  const district = await prisma.indianDistrict.findFirst({ where: { slug: districtSlug }, select: { id: true } })
  if (!district) return []
  return prisma.touristPlace.findMany({
    where: { status: 'PUBLISHED', districtId: district.id },
    include: {
      state: { select: { name: true, slug: true } },
      district: { select: { name: true, slug: true } },
      category: { select: { name: true, slug: true, icon: true } },
    },
    orderBy: [{ isFeatured: 'desc' }, { name: 'asc' }],
  })
}

// ── Admin queries ─────────────────────────────────────────────────────────

export async function adminListPlaces(opts?: { search?: string; stateSlug?: string; status?: string; page?: number }) {
  const { search, stateSlug, status, page = 1 } = opts ?? {}
  const perPage = 20

  const where: Record<string, unknown> = {}
  if (status) where.status = status

  if (stateSlug) {
    const state = await prisma.indianState.findUnique({ where: { slug: stateSlug }, select: { id: true } })
    if (state) where.stateId = state.id
  }

  if (search) {
    where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { cityName: { contains: search, mode: 'insensitive' } }]
  }

  const [places, total] = await Promise.all([
    prisma.touristPlace.findMany({
      where,
      include: {
        state: { select: { name: true } },
        category: { select: { name: true } },
      },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.touristPlace.count({ where }),
  ])

  return { places, total, pages: Math.ceil(total / perPage) }
}
