import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
const v = await p.vehicle.findMany({ orderBy: { displayOrder: 'asc' } })
console.log(JSON.stringify(v, null, 2))
await p.$disconnect()
