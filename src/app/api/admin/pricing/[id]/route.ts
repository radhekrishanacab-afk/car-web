import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

const UpdatePricingSchema = z.object({
  oneWayFare: z.number().min(0).optional(),
  roundTrip: z.number().min(0).optional().nullable(),
  driverAllowance: z.number().min(0).optional().nullable(),
  tollCharges: z.number().min(0).optional().nullable(),
  parkingCharges: z.number().min(0).optional().nullable(),
  nightCharges: z.number().min(0).optional().nullable(),
  otherCharges: z.number().min(0).optional().nullable(),
  isActive: z.boolean().optional(),
})

async function requireAdmin() {
  const session = await getSession()
  if (!session) return null
  return session
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<'/api/admin/pricing/[id]'>
) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const priceId = parseInt(id)

  const body = await request.json()
  const parsed = UpdatePricingSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
  }

  const data = parsed.data
  const price = await prisma.routePrice.update({
    where: { id: priceId },
    data: {
      ...(data.oneWayFare !== undefined && { oneWayFare: data.oneWayFare }),
      ...(data.roundTrip !== undefined && { roundTrip: data.roundTrip }),
      ...(data.driverAllowance !== undefined && { driverAllowance: data.driverAllowance }),
      ...(data.tollCharges !== undefined && { tollCharges: data.tollCharges }),
      ...(data.parkingCharges !== undefined && { parkingCharges: data.parkingCharges }),
      ...(data.nightCharges !== undefined && { nightCharges: data.nightCharges }),
      ...(data.otherCharges !== undefined && { otherCharges: data.otherCharges }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  })

  return Response.json({ price })
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<'/api/admin/pricing/[id]'>
) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  await prisma.routePrice.delete({ where: { id: parseInt(id) } })
  return Response.json({ success: true })
}
