import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  if (!await getSession()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const [states, districts, categories] = await Promise.all([
    prisma.indianState.findMany({ where: { isActive: true }, select: { id: true, name: true, slug: true }, orderBy: { name: 'asc' } }),
    prisma.indianDistrict.findMany({ where: { isActive: true }, select: { id: true, name: true, slug: true, stateId: true }, orderBy: { name: 'asc' } }),
    prisma.placeCategory.findMany({ select: { id: true, name: true, slug: true }, orderBy: { displayOrder: 'asc' } }),
  ])
  return Response.json({ states, districts, categories })
}
