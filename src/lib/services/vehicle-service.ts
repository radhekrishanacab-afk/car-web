import { prisma } from '../prisma'

export async function getActiveVehicles() {
  return prisma.vehicle.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
  })
}

export async function getVehicleBySlug(slug: string) {
  return prisma.vehicle.findUnique({
    where: { slug, isActive: true },
  })
}

export async function getAllVehicles() {
  return prisma.vehicle.findMany({
    orderBy: { displayOrder: 'asc' },
  })
}
