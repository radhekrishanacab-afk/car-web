import { NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const SettingsSchema = z.object({
  heading: z.string().min(1).max(120),
  description: z.string().max(300),
})

export async function PATCH(request: NextRequest) {
  if (!await getSession()) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = SettingsSchema.safeParse(await request.json())
  if (!parsed.success) {
    return Response.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
  }

  const settings = await prisma.homepageBlogSettings.upsert({
    where: { id: 1 },
    create: { id: 1, ...parsed.data },
    update: parsed.data,
  })
  revalidatePath('/')
  return Response.json({ settings })
}
