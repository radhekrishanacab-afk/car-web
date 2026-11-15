import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const BulkSchema = z.object({
  showState: z.boolean(),
  showDistrict: z.boolean(),
})

export async function PATCH(req: NextRequest) {
  if (!await getSession()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const parsed = BulkSchema.safeParse(await req.json())
  if (!parsed.success) return Response.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })

  const result = await prisma.blogPost.updateMany({ data: parsed.data })
  revalidatePath('/')
  revalidatePath('/blog')
  return Response.json({ updated: result.count })
}
