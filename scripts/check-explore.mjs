import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
const [count, places, states, cats] = await Promise.all([
  p.touristPlace.count(),
  p.touristPlace.findMany({ select: { name: true, status: true, stateId: true, isFeatured: true } }),
  p.indianState.count(),
  p.placeCategory.count(),
])
console.log('Total places:', count)
console.log('Places:', JSON.stringify(places, null, 2))
console.log('States:', states, 'Categories:', cats)
await p.$disconnect()
