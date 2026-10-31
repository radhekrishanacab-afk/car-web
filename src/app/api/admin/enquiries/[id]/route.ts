import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

async function requireAdmin() {
  const session = await getSession()
  if (!session) return null
  return session
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<'/api/admin/enquiries/[id]'>
) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const body = await request.json()

  const enquiry = await prisma.contactEnquiry.update({
    where: { id: parseInt(id) },
    data: { isRead: body.isRead ?? true },
  })

  return Response.json({ enquiry })
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<'/api/admin/enquiries/[id]'>
) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  await prisma.contactEnquiry.delete({ where: { id: parseInt(id) } })
  return Response.json({ success: true })
}
