/**
 * POST /api/admin/routes/import
 * Bulk import routes from parsed CSV data.
 *
 * Protected fields (never modified by this endpoint):
 *   originCityId, destinationCityId, distanceKm, price fields, booking relations
 *
 * The import body is a JSON array of validated rows (after client-side parse).
 * Each row: { originCity, destinationCity, distanceKm?, vehicles: [{name, oneWayFare}] }
 */
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

const VehiclePriceSchema = z.object({
  vehicleName: z.string().min(1),
  oneWayFare: z.number().min(0),
  roundTrip: z.number().min(0).optional().nullable(),
})

const ImportRowSchema = z.object({
  originCity: z.string().min(1),
  destinationCity: z.string().min(1),
  distanceKm: z.number().positive().optional().nullable(),
  estimatedHours: z.number().positive().optional().nullable(),
  vehicles: z.array(VehiclePriceSchema).optional().default([]),
})

const ImportBodySchema = z.object({
  rows: z.array(ImportRowSchema).min(1).max(500),
  dryRun: z.boolean().optional().default(false),
})

async function requireAdmin() {
  const session = await getSession()
  return session ?? null
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = ImportBodySchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
  }

  const { rows, dryRun } = parsed.data

  // Preload all cities once for fast lookup
  const allCities = await prisma.city.findMany({
    select: { id: true, name: true, slug: true, isActive: true },
  })
  const cityByName = new Map(allCities.map((c) => [c.name.toLowerCase(), c]))

  // Preload all vehicles once
  const allVehicles = await prisma.vehicle.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  })
  const vehicleByName = new Map(allVehicles.map((v) => [v.name.toLowerCase(), v]))

  type RowResult = {
    rowIndex: number
    originCity: string
    destinationCity: string
    status: 'valid' | 'duplicate' | 'conflict' | 'error'
    message: string
    conflictFields?: string[]
    routeId?: number
  }

  const results: RowResult[] = []
  let imported = 0
  let duplicates = 0
  let conflicts = 0
  let errors = 0

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const { originCity: oc, destinationCity: dc, distanceKm, estimatedHours, vehicles } = row

    // Resolve cities
    const originCityRecord = cityByName.get(oc.toLowerCase())
    const destCityRecord = cityByName.get(dc.toLowerCase())

    if (!originCityRecord) {
      results.push({ rowIndex: i, originCity: oc, destinationCity: dc, status: 'error', message: `Origin city "${oc}" not found in database. Add it from Cities first.` })
      errors++
      continue
    }
    if (!destCityRecord) {
      results.push({ rowIndex: i, originCity: oc, destinationCity: dc, status: 'error', message: `Destination city "${dc}" not found in database. Add it from Cities first.` })
      errors++
      continue
    }
    if (originCityRecord.id === destCityRecord.id) {
      results.push({ rowIndex: i, originCity: oc, destinationCity: dc, status: 'error', message: 'Origin and destination cannot be the same city.' })
      errors++
      continue
    }

    // Check if route already exists
    const existing = await prisma.route.findFirst({
      where: { originCityId: originCityRecord.id, destinationCityId: destCityRecord.id },
      include: { priceOverrides: { include: { vehicle: true } } },
    })

    if (existing) {
      // Detect conflicts in protected fields
      const conflictFields: string[] = []

      if (distanceKm != null && existing.distanceKm != null) {
        const existingKm = Number(existing.distanceKm)
        if (Math.abs(existingKm - distanceKm) > 0.5) {
          conflictFields.push(`distance: DB=${existingKm}km vs import=${distanceKm}km`)
        }
      }

      // Check vehicle price conflicts
      for (const vp of vehicles) {
        const vehicleRecord = vehicleByName.get(vp.vehicleName.toLowerCase())
        if (!vehicleRecord) continue
        const existingPrice = existing.priceOverrides.find((p) => p.vehicleId === vehicleRecord.id)
        if (existingPrice) {
          const existingFare = Number(existingPrice.oneWayFare)
          if (Math.abs(existingFare - vp.oneWayFare) > 1) {
            conflictFields.push(`${vp.vehicleName} fare: DB=₹${existingFare} vs import=₹${vp.oneWayFare}`)
          }
        }
      }

      if (conflictFields.length > 0) {
        results.push({
          rowIndex: i,
          originCity: oc,
          destinationCity: dc,
          status: 'conflict',
          message: `Route exists with different values. Review required before overwrite.`,
          conflictFields,
          routeId: existing.id,
        })
        conflicts++
      } else {
        results.push({
          rowIndex: i,
          originCity: oc,
          destinationCity: dc,
          status: 'duplicate',
          message: `Route already exists (ID ${existing.id}). Values match — no action needed.`,
          routeId: existing.id,
        })
        duplicates++
      }
      continue
    }

    // New route — create
    if (!dryRun) {
      try {
        const slug = `${originCityRecord.slug}-to-${destCityRecord.slug}`
        // Ensure slug uniqueness (append suffix if needed)
        let finalSlug = slug
        const slugConflict = await prisma.route.findFirst({ where: { slug } })
        if (slugConflict) {
          finalSlug = `${slug}-${originCityRecord.id}-${destCityRecord.id}`
        }

        const newRoute = await prisma.route.create({
          data: {
            originCityId: originCityRecord.id,
            destinationCityId: destCityRecord.id,
            slug: finalSlug,
            distanceKm: distanceKm ?? null,
            estimatedHours: estimatedHours ?? null,
            isActive: true,
          },
        })

        // Create vehicle prices
        for (const vp of vehicles) {
          const vehicleRecord = vehicleByName.get(vp.vehicleName.toLowerCase())
          if (!vehicleRecord) continue
          await prisma.routePrice.create({
            data: {
              routeId: newRoute.id,
              vehicleId: vehicleRecord.id,
              oneWayFare: vp.oneWayFare,
              roundTrip: vp.roundTrip ?? null,
              isActive: true,
            },
          })
        }

        results.push({
          rowIndex: i,
          originCity: oc,
          destinationCity: dc,
          status: 'valid',
          message: `Imported successfully (Route ID ${newRoute.id})`,
          routeId: newRoute.id,
        })
        imported++
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        results.push({ rowIndex: i, originCity: oc, destinationCity: dc, status: 'error', message: `Database error: ${msg}` })
        errors++
      }
    } else {
      // Dry run — just validate
      results.push({ rowIndex: i, originCity: oc, destinationCity: dc, status: 'valid', message: 'Valid — would be imported (dry run)' })
      imported++
    }
  }

  return Response.json({
    dryRun,
    summary: { total: rows.length, imported, duplicates, conflicts, errors },
    results,
  })
}
