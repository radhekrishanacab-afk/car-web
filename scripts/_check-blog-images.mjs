import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
const posts = await p.blogPost.findMany({ select: { id: true, title: true, featuredImage: true, status: true } })
posts.forEach(b => console.log(b.id, '|', b.status, '|', b.title.substring(0, 45), '|', b.featuredImage ? 'HAS IMG: ' + b.featuredImage.substring(0, 50) : 'NO IMG'))
await p.$disconnect()
