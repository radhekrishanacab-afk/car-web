import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function DELETE(_req: NextRequest) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Delete prices first (FK constraint), then routes
  const priceCount = await prisma.routePrice.deleteMany({})
  const routeCount = await prisma.route.deleteMany({})

  return Response.json({
    success: true,
    deleted: { routes: routeCount.count, prices: priceCount.count },
    message: `Deleted ${routeCount.count} routes and ${priceCount.count} price entries.`,
  })
}
