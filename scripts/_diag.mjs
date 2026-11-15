import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // All routes from Amreli and Bagasara
  for (const city of ['Amreli', 'Bagasara']) {
    const rs = await prisma.route.findMany({
      where: { originCity: { name: city } },
      include: { destinationCity: { select: { name: true } } },
      orderBy: { destinationCity: { name: 'asc' } },
    })
    console.log(`\n=== ${city} -> (${rs.length} routes) ===`)
    console.log(rs.map(r => `${r.destinationCity.name}:${r.distanceKm}`).join('  '))
  }

  // Routes with 115 km
  const r115 = await prisma.route.findMany({
    where: { distanceKm: { gte: 114, lte: 116 } },
    include: { originCity: { select: { name: true } }, destinationCity: { select: { name: true } } },
    take: 40,
  })
  console.log(`\n=== Routes with ~115 km (${r115.length}) ===`)
  console.log(r115.map(r => `${r.originCity.name}->${r.destinationCity.name}:${r.distanceKm}`).join('  '))
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
