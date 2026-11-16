/**
 * Apply city-pair distances from an Excel sheet to the Route table,
 * then recalculate all RoutePrice fares.
 *
 * Usage:
 *   node scripts/apply-excel-distances.mjs "<path.xlsx>"           # dry run
 *   node scripts/apply-excel-distances.mjs "<path.xlsx>" --apply   # write to DB
 *
 * Expected sheet columns (header row required, order used):
 *   A: Origin City   B: Destination City   C: distance in km
 *
 * Behaviour:
 *   - A backup of the current Route.distanceKm values is written to
 *     scripts/backup-route-distances-<timestamp>.json before any write,
 *     so the change can be reverted.
 *   - Route.distanceKm is set to the exact Excel value (decimals preserved).
 *   - Route.estimatedHours keeps the existing convention: round(km / 50, 1).
 *   - RoutePrice (oneWayFare / roundTrip) is recalculated for every route
 *     that has a distance × every active vehicle, using the same rounding
 *     as POST /api/admin/vehicles/recalculate (ceil to the nearest 100).
 */
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { PrismaClient } from '@prisma/client'

const excelPath = process.argv[2]
const APPLY = process.argv.includes('--apply')
if (!excelPath) {
  console.error('Usage: node scripts/apply-excel-distances.mjs "<path.xlsx>" [--apply]')
  process.exit(1)
}

const prisma = new PrismaClient()
const ROUTE_BATCH = 1000

function readExcel(path) {
  const py = `
import openpyxl, json
wb = openpyxl.load_workbook(r"${path}", read_only=True, data_only=True)
ws = wb[wb.sheetnames[0]]
out = []
for i, row in enumerate(ws.iter_rows(values_only=True)):
    if i == 0:
        continue
    r = ["" if c is None else c for c in row]
    if len(r) < 3:
        continue
    out.append([str(r[0]).strip(), str(r[1]).strip(), r[2]])
print(json.dumps(out, ensure_ascii=False))
`
  return JSON.parse(execFileSync('python', ['-c', py], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 }))
}

async function main() {
  console.log(APPLY ? '🚀 APPLY mode — database will be updated\n' : '🔍 DRY RUN — no changes will be written\n')

  const rows = readExcel(excelPath)
  console.log(`Excel rows read: ${rows.length}`)

  const excelKm = new Map()
  const invalid = []
  for (const [o, d, km] of rows) {
    const n = Number(km)
    if (!o || !d || !Number.isFinite(n) || n <= 0) {
      invalid.push(`${o} -> ${d}: "${km}"`)
      continue
    }
    excelKm.set(`${o}|${d}`, n)
  }
  console.log(`Usable pairs: ${excelKm.size} | invalid rows skipped: ${invalid.length}`)
  if (invalid.length) console.log('  ' + invalid.slice(0, 10).join('\n  '))

  const routes = await prisma.route.findMany({
    select: {
      id: true,
      distanceKm: true,
      originCity: { select: { name: true } },
      destinationCity: { select: { name: true } },
    },
  })
  console.log(`DB routes: ${routes.length}`)

  const updates = []
  const missing = []
  for (const r of routes) {
    const key = `${r.originCity.name}|${r.destinationCity.name}`
    if (!excelKm.has(key)) {
      missing.push(key)
      continue
    }
    const km = excelKm.get(key)
    const old = r.distanceKm == null ? null : Number(r.distanceKm)
    updates.push({ id: r.id, key, old, km, hours: Math.round((km / 50) * 10) / 10 })
  }

  console.log(`Routes matched to Excel: ${updates.length} | not found in Excel: ${missing.length}`)
  if (missing.length) console.log('  ' + missing.slice(0, 10).join('\n  '))

  const changed = updates.filter((u) => u.old !== u.km)
  console.log(`Distances changing: ${changed.length} | already identical: ${updates.length - changed.length}`)
  const increased = changed.filter((u) => u.old != null && u.km > u.old).length
  const decreased = changed.filter((u) => u.old != null && u.km < u.old).length
  console.log(`  increasing: ${increased} | decreasing: ${decreased}`)

  // Backup (always written, dry run included) so the previous state is recoverable
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = `scripts/backup-route-distances-${stamp}.json`
  writeFileSync(
    backupPath,
    JSON.stringify(updates.map((u) => ({ id: u.id, pair: u.key, distanceKm: u.old, estimatedHours: null })), null, 2),
    'utf8',
  )
  console.log(`\nBackup of previous distances written: ${backupPath}`)

  const verifyPairs = [
    'Amreli|Bagasara', 'Bagasara|Amreli', 'Ahmedabad|Amreli', 'Ahmedabad|Rajkot',
    'Ahmedabad|Dwarka', 'Rajkot|Junagadh',
  ]
  console.log('\nVerification samples:')
  for (const key of verifyPairs) {
    const u = updates.find((x) => x.key === key)
    if (u) console.log(`  ${key.replace('|', ' -> ')}:  ${u.old} km  ->  ${u.km} km`)
    else console.log(`  ${key.replace('|', ' -> ')}:  (not matched)`)
  }

  if (!APPLY) {
    console.log('\n(dry run — re-run with --apply to write changes)')
    return
  }

  console.log('\nStep 1: Updating route distances...')
  for (let i = 0; i < updates.length; i += ROUTE_BATCH) {
    const batch = updates.slice(i, i + ROUTE_BATCH)
    const values = batch.map((u) => `(${u.id},${u.km},${u.hours})`).join(',')
    await prisma.$executeRawUnsafe(
      `UPDATE "Route" AS r
         SET "distanceKm" = v.km::float8,
             "estimatedHours" = v.hours::float8,
             "updatedAt" = NOW()
       FROM (VALUES ${values}) AS v(id, km, hours)
       WHERE r.id = v.id::int`,
    )
    process.stdout.write(`\r  Routes: ${Math.min(i + ROUTE_BATCH, updates.length)}/${updates.length}`)
  }
  console.log('\n')

  console.log('Step 2: Recalculating fares...')
  const fareTargets = await prisma.route.findMany({
    where: { distanceKm: { not: null } },
    select: { id: true },
    orderBy: { id: 'asc' },
  })
  let fareCount = 0
  for (let i = 0; i < fareTargets.length; i += ROUTE_BATCH) {
    const batch = fareTargets.slice(i, i + ROUTE_BATCH)
    const ids = batch.map((c) => c.id).join(',')
    const affected = await prisma.$executeRawUnsafe(
      `INSERT INTO "RoutePrice"
         ("routeId","vehicleId","oneWayFare","roundTrip","isActive","createdAt","updatedAt")
       SELECT r.id, v.id,
         CEIL(GREATEST(
           GREATEST(r."distanceKm", COALESCE(NULLIF(v."minimumBillableKm", 0), r."distanceKm")) * v."perKmRate",
           v."minimumFare"
         ) / 100.0) * 100.0,
         CEIL(
           (CEIL(GREATEST(
             GREATEST(r."distanceKm", COALESCE(NULLIF(v."minimumBillableKm", 0), r."distanceKm")) * v."perKmRate",
             v."minimumFare"
           ) / 100.0) * 100.0) * v."roundTripRateMultiplier" / 100.0
         ) * 100.0,
         true, NOW(), NOW()
       FROM "Route" r
       CROSS JOIN "Vehicle" v
       WHERE r.id IN (${ids})
         AND r."distanceKm" IS NOT NULL
         AND v."isActive" = true
       ON CONFLICT ("routeId","vehicleId") DO UPDATE
         SET "oneWayFare" = EXCLUDED."oneWayFare",
             "roundTrip"  = EXCLUDED."roundTrip",
             "isActive"   = true,
             "updatedAt"  = NOW()`,
    )
    fareCount += affected
    process.stdout.write(`\r  Fares: ${fareCount}`)
  }
  console.log('\n\n✅ Done.')
}

main()
  .catch((e) => {
    console.error('\nError:', e.message)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
