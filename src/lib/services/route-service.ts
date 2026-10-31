import { prisma } from '../prisma'

export async function getRouteBySlug(slug: string) {
  return prisma.route.findUnique({
    where: { slug, isActive: true },
    include: {
      originCity: true,
      destinationCity: true,
      priceOverrides: { include: { vehicle: true } },
    },
  })
}

export async function getRoutesByOriginCity(citySlug: string) {
  return prisma.route.findMany({
    where: { isActive: true, originCity: { slug: citySlug } },
    include: { originCity: true, destinationCity: true },
    orderBy: { destinationCity: { name: 'asc' } },
  })
}

export async function getPopularRoutes(limit = 8) {
  return prisma.route.findMany({
    where: { isActive: true },
    include: { originCity: true, destinationCity: true },
    take: limit,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getRoutesWithFares(limit = 8) {
  const rows = await prisma.route.findMany({
    where: { isActive: true },
    include: {
      originCity: true,
      destinationCity: true,
      priceOverrides: {
        include: { vehicle: true },
        orderBy: { vehicle: { displayOrder: 'asc' } },
      },
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
  })
  return rows.map((r) => ({
    ...r,
    distanceKm: r.distanceKm != null ? Number(r.distanceKm) : null,
    priceOverrides: r.priceOverrides.map((p) => ({
      ...p,
      oneWayFare: Number(p.oneWayFare),
    })),
  }))
}
