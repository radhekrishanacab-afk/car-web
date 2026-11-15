/**
 * Fix ALL route distances using real road routing (OpenStreetMap / OSRM),
 * then recalculate fares from the corrected distances.
 *
 * Why: route distances were previously estimated with a rough formula
 * (based on each city's distance from Ahmedabad), which produced very wrong
 * values for nearby cities — e.g. Bagasara -> Amreli showed 115 km instead
 * of ~33 km.
 *
 * Usage:
 *   node scripts/fix-all-distances.mjs           # dry run (report only)
 *   node scripts/fix-all-distances.mjs --apply   # write changes to DB
 *
 * Steps:
 *   1. Geocode every city (Nominatim) — cached in scripts/city-coords.json
 *   2. Compute real road distances for all city pairs (OSRM table service)
 *   3. Update Route.distanceKm + estimatedHours
 *   4. Recalculate RoutePrice (one-way + round-trip) for every vehicle
 */
import { PrismaClient } from '@prisma/client'
import { readFileSync, writeFileSync, existsSync } from 'fs'

const prisma = new PrismaClient()
const CACHE_FILE = 'scripts/city-coords.json'
const APPLY = process.argv.includes('--apply')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Correct names for cities whose DB spelling is unusual / hard to geocode
const GEO_OVERRIDE = {
  'Abu': 'Mount Abu, Rajasthan, India',
  'Kutch': 'Bhuj, Kutch, Gujarat, India',
  'Bawla': 'Bavla, Gujarat, India',
  'Limdi': 'Limbdi, Gujarat, India',
  'Mumbai Airport': 'Chhatrapati Shivaji Maharaj International Airport, Mumbai, India',
  'Mumbai Central': 'Mumbai Central railway station, Mumbai, India',
  'Wadhwan': 'Wadhwan, Surendranagar, Gujarat, India',
  'Bagodara': 'Bagodara, Ahmedabad, Gujarat, India',
  'Ranip': 'Ranip, Ahmedabad, Gujarat, India',
  'Nizar': 'Nizar, Tapi, Gujarat, India',
  'Delvada': 'Delwada, Una, Gujarat, India',
  'Khambhaliya': 'Khambhalia, Gujarat, India',
  'Dholka': 'Dholka, Gujarat, India',
  'Dakor': 'Dakor, Gujarat, India',
  'Vyara': 'Vyara, Gujarat, India',
  'Songadh': 'Songadh, Tapi, Gujarat, India',
  'Talaja': 'Talaja, Bhavnagar, Gujarat, India',
  'Sihor': 'Sihor, Gujarat, India',
  'Sachin': 'Sachin, Surat, Gujarat, India',
  'Dahej': 'Dahej, Bharuch, Gujarat, India',
}

async function geocodeOne(name) {
  const query = GEO_OVERRIDE[name] || `${name}, Gujarat, India`
  const tries = [query, `${name}, India`]
  for (const q of tries) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`
      const res = await fetch(url, {
        headers: { 'User-Agent': 'car-web-distance-fix/1.0 (radhekrishanacab.com)' },
      })
      if (!res.ok) { await sleep(1100); continue }
      const data = await res.json()
      if (Array.isArray(data) && data[0]) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
      }
    } catch { /* try next */ }
    await sleep(1100)
  }
  return null
}

async function loadCoords(cities) {
  let cache = {}
  if (existsSync(CACHE_FILE)) {
    try { cache = JSON.parse(readFileSync(CACHE_FILE, 'utf8')) } catch { cache = {} }
  }

  let added = 0
  for (const c of cities) {
    if (cache[c.name]) continue
    const co = await geocodeOne(c.name)
    if (co) {
      cache[c.name] = co
      added++
      process.stdout.write(`\r  Geocoded ${added} new (${c.name})            `)
    } else {
      console.log(`\n  ⚠ Could not geocode: ${c.name}`)
    }
    await sleep(1100)
  }
  writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8')
  return cache
}

// ── OSRM road distance matrix ──────────────────────────────────────────────
async function osrmTable(coords, srcIdx, dstIdx, attempt = 1) {
  const path = coords.map((c) => `${c.lon},${c.lat}`).join(';')
  const url =
    `https://router.project-osrm.org/table/v1/driving/${path}` +
    `?sources=${srcIdx.join(';')}&destinations=${dstIdx.join(';')}&annotations=distance`
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const data = await res.json()
    if (data.code !== 'Ok') throw new Error(data.code || 'OSRM error')
    return data.distances // meters
  } catch (e) {
    if (attempt >= 4) { console.log(`\n  ⚠ OSRM failed (${e.message}) — leaving those pairs unchanged`); return null }
    await sleep(1500 * attempt)
    return osrmTable(coords, srcIdx, dstIdx, attempt + 1)
  }
}

async function buildMatrix(cities, coordsByName) {
  const N = cities.length
  const matrix = Array.from({ length: N }, () => new Array(N).fill(null))
  const CH = 40

  for (let i = 0; i < N; i += CH) {
    for (let j = 0; j < N; j += CH) {
      const srcChunk = cities.slice(i, i + CH)
      const dstChunk = cities.slice(j, j + CH)

      let coords, srcIdx, dstIdx
      if (i === j) {
        coords = srcChunk
        srcIdx = srcChunk.map((_, k) => k)
        dstIdx = srcChunk.map((_, k) => k)
      } else {
        coords = [...srcChunk, ...dstChunk]
        if (coords.length > 100) {
          // Fallback: shrink to keep under the public API limit
          coords = [...srcChunk.slice(0, 30), ...dstChunk.slice(0, 30)]
        }
        srcIdx = srcChunk.map((_, k) => k)
        dstIdx = dstChunk.map((_, k) => srcChunk.length + k)
      }

      const missing = coords.some((c) => !c)
      if (missing) continue

      const dist = await osrmTable(coords, srcIdx, dstIdx)
      if (!dist) continue

      for (let a = 0; a < srcChunk.length; a++) {
        for (let b = 0; b < dstChunk.length; b++) {
          const m = dist[a]?.[b]
          if (m != null) matrix[i + a][j + b] = m
        }
      }
      await sleep(250)
      process.stdout.write(`\r  OSRM matrix: block ${i}/${N} × ${j}/${N}      `)
    }
  }
  return matrix
}

function calcFare(km, perKm, minFare, minKm) {
  const billable = minKm ? Math.max(km, minKm) : km
  return Math.ceil(Math.max(billable * perKm, minFare) / 100) * 100
}

async function main() {
  console.log(APPLY ? '🚀 APPLY mode — will write to database\n' : '🔍 DRY RUN — no changes will be written\n')

  const cities = await prisma.city.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: 'asc' } })
  console.log(`Cities: ${cities.length}`)

  console.log('\nStep 1: Geocoding cities (cached)...')
  const coords = await loadCoords(cities)
  const cityCoords = cities.map((c) => ({ ...c, ...coords[c.name] }))
  const geoFail = cityCoords.filter((c) => !c.lat)
  console.log(`\n  Geocoded: ${cities.length - geoFail.length}/${cities.length}`)
  if (geoFail.length) console.log(`  Missing coords: ${geoFail.map((c) => c.name).join(', ')}`)

  console.log('\nStep 2: Building road-distance matrix via OSRM...')
  const matrix = await buildMatrix(cityCoords, coords)
  console.log('\n')

  const idxByName = new Map(cities.map((c, i) => [c.name, i]))
  const routes = await prisma.route.findMany({
    include: { originCity: { select: { name: true } }, destinationCity: { select: { name: true } } },
  })
  const vehicles = await prisma.vehicle.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' } })

  const changes = []
  let missing = 0
  for (const r of routes) {
    const i = idxByName.get(r.originCity.name)
    const j = idxByName.get(r.destinationCity.name)
    if (i == null || j == null) continue
    const meters = matrix[i][j]
    if (meters == null) { missing++; continue }
    const km = Math.max(1, Math.round(meters / 1000))
    const old = r.distanceKm ? Number(r.distanceKm) : null
    if (old !== km) changes.push({ id: r.id, from: r.originCity.name, to: r.destinationCity.name, old, km })
  }

  console.log(`Routes: ${routes.length} | to update: ${changes.length} | no distance: ${missing}`)

  // Show a few sample corrections
  const interesting = ['Bagasara', 'Amreli', 'Bhavnagar', 'Sihor', 'Ahmedabad', 'Surat']
  console.log('\nSample corrections:')
  changes
    .filter((c) => interesting.includes(c.from) || interesting.includes(c.to))
    .slice(0, 15)
    .forEach((c) => console.log(`  ${c.from} → ${c.to}:  ${c.old} km  →  ${c.km} km`))

  if (!APPLY) {
    console.log('\n(dry run — re-run with --apply to write)')
    return
  }

  console.log('\nStep 3: Updating route distances...')
  const ROUTE_BATCH = 300
  for (let i = 0; i < changes.length; i += ROUTE_BATCH) {
    const batch = changes.slice(i, i + ROUTE_BATCH)
    await prisma.$transaction(
      batch.map((c) =>
        prisma.route.update({
          where: { id: c.id },
          data: { distanceKm: c.km, estimatedHours: Math.round((c.km / 50) * 10) / 10 },
        })
      )
    )
    process.stdout.write(`\r  Routes: ${Math.min(i + ROUTE_BATCH, changes.length)}/${changes.length}`)
  }
  console.log('\n')

  console.log('Step 4: Recalculating fares...')
  let fareCount = 0
  for (let i = 0; i < changes.length; i += ROUTE_BATCH) {
    const batch = changes.slice(i, i + ROUTE_BATCH)
    const ops = []
    for (const c of batch) {
      for (const v of vehicles) {
        const ow = calcFare(c.km, Number(v.perKmRate), Number(v.minimumFare), v.minimumBillableKm ? Number(v.minimumBillableKm) : null)
        const rt = Math.ceil((ow * Number(v.roundTripRateMultiplier)) / 100) * 100
        ops.push(
          prisma.routePrice.upsert({
            where: { routeId_vehicleId: { routeId: c.id, vehicleId: v.id } },
            update: { oneWayFare: ow, roundTrip: rt, isActive: true },
            create: { routeId: c.id, vehicleId: v.id, oneWayFare: ow, roundTrip: rt, isActive: true },
          })
        )
      }
    }
    // chunk the transaction itself
    for (let k = 0; k < ops.length; k += 500) {
      await prisma.$transaction(ops.slice(k, k + 500))
      fareCount += Math.min(500, ops.length - k)
    }
    process.stdout.write(`\r  Fares: ${fareCount}`)
  }
  console.log('\n\n✅ Done.')
}

main().catch((e) => { console.error('\nError:', e.message); process.exit(1) }).finally(() => prisma.$disconnect())
