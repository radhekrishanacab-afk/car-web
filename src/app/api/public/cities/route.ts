import { prisma } from '@/lib/prisma'

export async function GET() {
  const cities = await prisma.city.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true },
    orderBy: { name: 'asc' },
  })
  return Response.json({ cities })
}
