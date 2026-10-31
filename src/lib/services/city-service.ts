import { Prisma } from '@prisma/client'
import { prisma } from '../prisma'

export async function getCitiesWithRouteCounts(page = 1, perPage = 24, search = '') {
  const where: Prisma.CityWhereInput = {
    isActive: true,
    ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
  }

  const [cities, total] = await Promise.all([
    prisma.city.findMany({
      where,
      include: {
        _count: {
          select: { routesFrom: { where: { isActive: true } } },
        },
      },
      orderBy: { name: 'asc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.city.count({ where }),
  ])

  return {
    cities: cities.map((c) => ({ ...c, routeCount: c._count.routesFrom })),
    total,
    pages: Math.ceil(total / perPage),
  }
}

export async function getPopularCities() {
  const cities = await prisma.city.findMany({
    where: { isActive: true, isPopular: true },
    include: {
      _count: {
        select: { routesFrom: { where: { isActive: true } } },
      },
    },
    orderBy: { popularOrder: 'asc' },
  })
  return cities.map((c) => ({ ...c, routeCount: c._count.routesFrom }))
}

export async function getCityBySlug(slug: string) {
  return prisma.city.findUnique({
    where: { slug, isActive: true },
  })
}

export async function getAllActiveCities() {
  const cities = await prisma.city.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true },
  })
  return cities
}
