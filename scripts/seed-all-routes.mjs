/**
 * Fast batch seed — all city routes + fares + full CSV export
 */
import { PrismaClient } from '@prisma/client'
import { writeFileSync } from 'fs'

const prisma = new PrismaClient()

const AHM_DISTANCES = {
  'abu':230,'ahmedabad':0,'ajmer':520,'alang':215,'ambaji':175,'amreli':245,
  'anand':75,'ankleshwar':160,'bagasara':295,'bagodara':95,'balasinor':100,
  'balotra':490,'bardoli':220,'barmer':650,'bawla':40,'beawar':550,
  'bharuch':165,'bhavnagar':205,'bhilwara':600,'bhuj':340,'bikaner':680,
  'borsad':80,'botad':165,'chandigarh':1300,'chittorgarh':570,'dahej':170,
  'dahod':180,'dakor':90,'daman':250,'deesa':185,'delhi':950,'delvada':270,
  'dholka':45,'dhrangadhra':185,'dwarka':450,'gandhinagar':30,'gandhidham':355,
  'godhra':120,'gondal':285,'halol':105,'halvad':210,'himatnagar':100,'idar':130,
  'jaipur':665,'jaisalmer':830,'jamnagar':310,'jasdan':270,'jetpur':290,
  'jodhpur':560,'junagadh':320,'kadi':70,'kalol':45,'kandla':360,'kapadvanj':100,
  'karjan':140,'kathlal':90,'keshod':360,'khambhaliya':375,'khambhat':100,
  'kheda':65,'kodinar':340,'kota':595,'kutch':350,'limdi':205,'luni':565,
  'mahuva':235,'manavadar':330,'mandvi':370,'mehsana':80,'modasa':115,'morbi':260,
  'mumbai-airport':525,'mumbai-central':530,'mundra':380,'nadiad':60,'navsari':250,
  'nizar':185,'okha':480,'palanpur':155,'palitana':215,'pali':490,'patan':120,
  'porbandar':390,'pune':680,'radhanpur':210,'rajkot':245,'rajsamand':610,
  'ranip':15,'sachin':235,'sanand':30,'savarkundla':280,'sihor':220,'sirohi':260,
  'somnath':390,'songadh':290,'surendranagar':185,'surat':265,'talaja':230,
  'thane':510,'tharad':250,'udaipur':445,'unjha':110,'una':310,'upleta':295,
  'vadnagar':105,'vadodara':115,'vallabh-vidyanagar':80,'valsad':285,'vapi':270,
  'veraval':375,'viramgam':55,'visnagar':95,'vyara':240,'wadhwan':195,'wankaner':265,
}

function km(oSlug, dSlug) {
  const dO = AHM_DISTANCES[oSlug] ?? 200
  const dD = AHM_DISTANCES[dSlug] ?? 200
  if (oSlug === dSlug) return 0
  if (dO === 0) return dD
  if (dD === 0) return dO
  return Math.max(Math.round((Math.abs(dO-dD)*1.3+Math.min(dO,dD)*0.2)/5)*5, 50)
}

function fare(distKm, perKm, minFare, minKm=100) {
  return Math.ceil(Math.max(Math.max(distKm,minKm)*perKm, minFare)/100)*100
}

const VCFG = [
  {slug:'sedan',      perKm:14, minFare:1200},
  {slug:'suv-6',      perKm:18, minFare:1800},
  {slug:'suv-7',      perKm:20, minFare:2000},
  {slug:'premium-suv',perKm:24, minFare:2500},
]

async function main() {
  console.log('Loading data from database...')
  const cities   = await prisma.city.findMany({where:{isActive:true},orderBy:{name:'asc'}})
  const vehicles = await prisma.vehicle.findMany({where:{isActive:true},orderBy:{displayOrder:'asc'}})
  const vMap = vehicles.map(v => ({
    ...v,
    ...(VCFG.find(c => v.slug === c.slug) ?? VCFG[0])
  }))

  // Load existing to skip
  const existing = await prisma.route.findMany({select:{originCityId:true,destinationCityId:true,slug:true}})
  const existKeys  = new Set(existing.map(r=>`${r.originCityId}-${r.destinationCityId}`))
  const existSlugs = new Set(existing.map(r=>r.slug))
  console.log(`Cities: ${cities.length} | Vehicles: ${vehicles.length} | Existing routes: ${existKeys.size}`)

  // Build CSV
  const csvLines = [`Origin City,Destination City,Distance KM,Estimated Hours,${vehicles.map(v=>`${v.name} Fare`).join(',')}`]

  // Build all new route data
  const newRoutes = []
  for (const o of cities) {
    for (const d of cities) {
      if (o.id === d.id) continue
      const key = `${o.id}-${d.id}`
      const distKm = km(o.slug, d.slug)
      const hrs    = Math.round((distKm/50)*10)/10
      const fares  = vMap.map(v => fare(distKm, v.perKm, v.minFare))

      // Always add to CSV
      csvLines.push(`"${o.name}","${d.name}",${distKm},${hrs},${fares.join(',')}`)

      if (existKeys.has(key)) continue

      let slug = `${o.slug}-to-${d.slug}-taxi`
      if (existSlugs.has(slug)) slug = `${o.slug}-to-${d.slug}-taxi-${o.id}-${d.id}`
      existKeys.add(key)
      existSlugs.add(slug)

      newRoutes.push({ o, d, slug, distKm, hrs, fares })
    }
  }

  // Write CSV immediately (doesn't need DB)
  writeFileSync('routes-full.csv', csvLines.join('\n'), 'utf8')
  console.log(`\n📊 CSV written: routes-full.csv (${csvLines.length-1} routes)`)

  if (newRoutes.length === 0) {
    console.log('✅ All routes already in database!')
    return
  }

  console.log(`\nInserting ${newRoutes.length} new routes in batches...`)

  // Batch createMany for routes
  const BATCH = 200
  let created = 0
  for (let i = 0; i < newRoutes.length; i += BATCH) {
    const batch = newRoutes.slice(i, i+BATCH)
    try {
      await prisma.route.createMany({
        data: batch.map(r => ({
          originCityId:      r.o.id,
          destinationCityId: r.d.id,
          slug:              r.slug,
          distanceKm:        r.distKm,
          estimatedHours:    r.hrs,
          isActive:          true,
        })),
        skipDuplicates: true,
      })
      created += batch.length
    } catch(e) {
      console.error('Batch error:', e.message.substring(0,80))
    }
    process.stdout.write(`\r  Routes: ${Math.min(created, newRoutes.length)}/${newRoutes.length}`)
  }

  // Now add prices — load newly created routes
  console.log('\n\nAdding prices...')
  const allRoutes = await prisma.route.findMany({
    select: { id:true, originCityId:true, destinationCityId:true, distanceKm:true },
  })
  const cityById = new Map(cities.map(c=>[c.id,c]))

  let priceCount = 0
  for (let i = 0; i < allRoutes.length; i += BATCH) {
    const batch = allRoutes.slice(i, i+BATCH)
    const priceData = []
    for (const route of batch) {
      const oCity = cityById.get(route.originCityId)
      const dCity = cityById.get(route.destinationCityId)
      if (!oCity || !dCity) continue
      const distKm = route.distanceKm ? Number(route.distanceKm) : km(oCity.slug, dCity.slug)
      for (const v of vMap) {
        priceData.push({
          routeId:   route.id,
          vehicleId: v.id,
          oneWayFare: fare(distKm, v.perKm, v.minFare),
          roundTrip:  Math.ceil(fare(distKm, v.perKm, v.minFare)*1.9/100)*100,
          isActive:   true,
        })
      }
    }
    try {
      await prisma.routePrice.createMany({ data: priceData, skipDuplicates: true })
      priceCount += priceData.length
    } catch(e) {
      // skip
    }
    process.stdout.write(`\r  Prices: ${Math.min(priceCount, allRoutes.length*vMap.length)}/${allRoutes.length*vMap.length}`)
  }

  console.log('\n\n✅ Seeding complete!')
  const finalCount = await prisma.route.count()
  console.log(`   Total routes in DB: ${finalCount}`)
  console.log(`   CSV file: routes-full.csv`)
}

main()
  .catch(e => { console.error('\nError:', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
