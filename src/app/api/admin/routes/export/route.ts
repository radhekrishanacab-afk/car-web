import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(_req: NextRequest) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Load all active vehicles for column headers
  const vehicles = await prisma.vehicle.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
    select: { id: true, name: true },
  })

  // Load all routes with prices
  const routes = await prisma.route.findMany({
    include: {
      originCity:      { select: { name: true } },
      destinationCity: { select: { name: true } },
      priceOverrides: {
        where: { isActive: true },
        include: { vehicle: { select: { id: true, name: true } } },
      },
    },
    orderBy: [{ originCity: { name: 'asc' } }, { destinationCity: { name: 'asc' } }],
  })

  // Build CSV
  const vehicleHeaders = vehicles.map(v => `${v.name} Fare`).join(',')
  const header = `Origin City,Destination City,Distance KM,Estimated Hours,${vehicleHeaders},Status`

  const rows = routes.map(route => {
    const fareCols = vehicles.map(v => {
      const price = route.priceOverrides.find(p => p.vehicle.id === v.id)
      return price ? Number(price.oneWayFare) : ''
    }).join(',')

    return [
      `"${route.originCity.name}"`,
      `"${route.destinationCity.name}"`,
      route.distanceKm ? Number(route.distanceKm) : '',
      route.estimatedHours ? Number(route.estimatedHours) : '',
      fareCols,
      route.isActive ? 'Active' : 'Inactive',
    ].join(',')
  })

  const csv = [header, ...rows].join('\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="routes-export-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
