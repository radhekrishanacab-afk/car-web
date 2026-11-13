/**
 * Updates all route distances from verified Excel data
 * Then recalculates fares based on vehicle per-km rates
 */
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Verified distances from Excel file
// Format: 'Origin|Destination': km
const DISTANCES = {
'Abu|Ahmedabad':223,'Abu|Ajmer':334,'Abu|Alang':490,'Abu|Ambaji':38,'Abu|Amreli':486,'Abu|Anand':292,'Abu|Ankleshwar':423,'Abu|Bagasara':503,'Abu|Bagodara':309,'Abu|Balasinor':231,'Abu|Balotra':166,'Abu|Bardoli':489,'Abu|Barmer':237,'Abu|Bawla':243,'Abu|Beawar':288,'Abu|Bharuch':413,'Abu|Bhavnagar':445,'Abu|Bhilwara':255,'Abu|Bhuj':518,'Abu|Bikaner':430,'Abu|Borsad':313,'Abu|Botad':368,'Abu|Chandigarh':891,'Abu|Chittorgarh':227,'Abu|Dahej':471,'Abu|Dahod':301,'Abu|Dakor':266,'Abu|Daman':581,'Abu|Deesa':74,'Abu|Delhi':718,'Abu|Delvada':595,'Abu|Dholka':260,'Abu|Dhrangadhra':295,'Abu|Dwarka':638,'Abu|Gandhidham':460,'Abu|Gandhinagar':198,'Abu|Godhra':273,'Abu|Gondal':463,'Abu|Halol':294,'Abu|Halvad':330,'Abu|Himatnagar':133,'Abu|Idar':101,'Abu|Jaipur':476,'Abu|Jaisalmer':363,'Abu|Jamnagar':507,'Abu|Jasdan':427,'Abu|Jetpur':490,'Abu|Jodhpur':209,'Abu|Junagadh':527,'Abu|Kadi':183,'Abu|Kalol':192,'Abu|Kandla':448,'Abu|Kapadvanj':228,'Abu|Karjan':365,'Abu|Kathlal':280,'Abu|Keshod':562,'Abu|Khambhaliya':569,'Abu|Khambhat':322,'Abu|Kheda':262,'Abu|Kodinar':597,'Abu|Kota':375,'Abu|Kutch':515,'Abu|Limdi':316,'Abu|Luni':185,'Abu|Mahuva':522,'Abu|Manavadar':538,'Abu|Mandvi':560,'Abu|Mehsana':144,'Abu|Modasa':163,'Abu|Morbi':371,'Abu|Mumbai Airport':742,'Abu|Mumbai Central':755,'Abu|Mundra':515,'Abu|Nadiad':279,'Abu|Navsari':515,'Abu|Nizar':473,'Abu|Okha':623,'Abu|Palanpur':65,'Abu|Pali':167,'Abu|Palitana':470,'Abu|Patan':123,'Abu|Porbandar':610,'Abu|Pune':833,'Abu|Radhanpur':161,'Abu|Rajkot':417,'Abu|Rajsamand':162,'Abu|Ranip':214,'Abu|Sachin':494,'Abu|Sanand':224,'Abu|Savarkundla':522,'Abu|Sihor':440,'Abu|Sirohi':43,'Abu|Somnath':611,'Abu|Songadh':523,'Abu|Surat':484,'Abu|Surendranagar':298,'Abu|Talaja':488,'Abu|Thane':726,'Abu|Tharad':127,'Abu|Udaipur':115,'Abu|Una':588,'Abu|Unjha':115,'Abu|Upleta':533,'Abu|Vadnagar':103,'Abu|Vadodara':334,'Abu|Vallabh Vidyanagar':294,'Abu|Valsad':557,'Abu|Vapi':582,'Abu|Veraval':605,'Abu|Viramgam':226,'Abu|Visnagar':120,'Abu|Vyara':524,'Abu|Wadhwan':297,'Abu|Wankaner':373,
'Ahmedabad|Abu':223,'Ahmedabad|Ajmer':518,'Ahmedabad|Alang':286,'Ahmedabad|Ambaji':193,'Ahmedabad|Amreli':281,'Ahmedabad|Anand':78,'Ahmedabad|Ankleshwar':208,'Ahmedabad|Bagasara':299,'Ahmedabad|Bagodara':97,'Ahmedabad|Balasinor':120,'Ahmedabad|Balotra':390,'Ahmedabad|Bardoli':274,'Ahmedabad|Barmer':383,'Ahmedabad|Bawla':35,'Ahmedabad|Beawar':458,'Ahmedabad|Bharuch':198,'Ahmedabad|Bhavnagar':241,'Ahmedabad|Bhilwara':392,'Ahmedabad|Bhuj':359,'Ahmedabad|Bikaner':647,'Ahmedabad|Borsad':98,'Ahmedabad|Botad':164,'Ahmedabad|Chandigarh':1083,'Ahmedabad|Chittorgarh':362,'Ahmedabad|Dahej':256,'Ahmedabad|Dahod':227,'Ahmedabad|Dakor':99,'Ahmedabad|Daman':366,'Ahmedabad|Deesa':174,'Ahmedabad|Delhi':882,'Ahmedabad|Delvada':391,'Ahmedabad|Dholka':43,'Ahmedabad|Dhrangadhra':135,'Ahmedabad|Dwarka':479,'Ahmedabad|Gandhidham':300,'Ahmedabad|Gandhinagar':27,'Ahmedabad|Godhra':156,'Ahmedabad|Gondal':276,'Ahmedabad|Halol':142,'Ahmedabad|Halvad':171,'Ahmedabad|Himatnagar':92,'Ahmedabad|Idar':125,'Ahmedabad|Jaipur':623,'Ahmedabad|Jaisalmer':540,'Ahmedabad|Jamnagar':348,'Ahmedabad|Jasdan':223,'Ahmedabad|Jetpur':301,'Ahmedabad|Jodhpur':427,'Ahmedabad|Junagadh':338,'Ahmedabad|Kadi':49,'Ahmedabad|Kalol':31,'Ahmedabad|Kandla':289,'Ahmedabad|Kapadvanj':86,'Ahmedabad|Karjan':150,'Ahmedabad|Kathlal':75,'Ahmedabad|Keshod':373,'Ahmedabad|Khambhaliya':410,'Ahmedabad|Khambhat':98,'Ahmedabad|Kheda':39,'Ahmedabad|Kodinar':393,'Ahmedabad|Kota':510,'Ahmedabad|Kutch':355,'Ahmedabad|Limdi':108,'Ahmedabad|Luni':403,'Ahmedabad|Mahuva':318,'Ahmedabad|Manavadar':349,'Ahmedabad|Mandvi':401,'Ahmedabad|Mehsana':79,'Ahmedabad|Modasa':110,'Ahmedabad|Morbi':212,'Ahmedabad|Mumbai Airport':527,'Ahmedabad|Mumbai Central':541,'Ahmedabad|Mundra':355,'Ahmedabad|Nadiad':63,'Ahmedabad|Navsari':300,'Ahmedabad|Nizar':259,'Ahmedabad|Okha':463,'Ahmedabad|Palanpur':158,'Ahmedabad|Pali':385,'Ahmedabad|Palitana':266,'Ahmedabad|Patan':125,'Ahmedabad|Porbandar':421,'Ahmedabad|Pune':618,'Ahmedabad|Radhanpur':170,'Ahmedabad|Rajkot':258,'Ahmedabad|Rajsamand':318,'Ahmedabad|Ranip':9,'Ahmedabad|Sachin':279,'Ahmedabad|Sanand':24,'Ahmedabad|Savarkundla':318,'Ahmedabad|Sihor':236,'Ahmedabad|Sirohi':261,'Ahmedabad|Somnath':422,'Ahmedabad|Songadh':309,'Ahmedabad|Surat':269,'Ahmedabad|Surendranagar':138,'Ahmedabad|Talaja':284,'Ahmedabad|Thane':511,'Ahmedabad|Tharad':215,'Ahmedabad|Udaipur':250,'Ahmedabad|Una':384,'Ahmedabad|Unjha':108,'Ahmedabad|Upleta':343,'Ahmedabad|Vadnagar':121,'Ahmedabad|Vadodara':124,'Ahmedabad|Vallabh Vidyanagar':79,'Ahmedabad|Valsad':342,'Ahmedabad|Vapi':367,'Ahmedabad|Veraval':416,'Ahmedabad|Viramgam':67,'Ahmedabad|Visnagar':105,'Ahmedabad|Vyara':309,'Ahmedabad|Wadhwan':132,'Ahmedabad|Wankaner':214,
'Amreli|Bagasara':33,'Amreli|Bagodara':189,'Bagasara|Amreli':33,'Bagasara|Ahmedabad':299,'Bagasara|Bagodara':207,
'Surat|Ahmedabad':269,'Surat|Vadodara':150,'Surat|Mumbai Airport':258,'Surat|Mumbai Central':273,'Surat|Bharuch':71,'Surat|Ankleshwar':65,'Surat|Bardoli':35,'Surat|Sachin':13,'Surat|Navsari':33,'Surat|Vapi':99,'Surat|Valsad':73,'Surat|Daman':98,'Surat|Thane':242,
'Vadodara|Ahmedabad':124,'Vadodara|Surat':150,'Vadodara|Anand':46,'Vadodara|Bharuch':79,'Vadodara|Halol':44,'Vadodara|Godhra':78,
'Rajkot|Ahmedabad':258,'Rajkot|Jamnagar':90,'Rajkot|Gondal':46,'Rajkot|Morbi':69,'Rajkot|Wankaner':44,'Rajkot|Jasdan':61,'Rajkot|Jetpur':73,'Rajkot|Junagadh':110,
'Jamnagar|Ahmedabad':348,'Jamnagar|Rajkot':90,'Jamnagar|Dwarka':131,'Jamnagar|Morbi':158,'Jamnagar|Khambhaliya':62,'Jamnagar|Gondal':135,
'Bhuj|Ahmedabad':359,'Bhuj|Gandhidham':61,'Bhuj|Kutch':22,'Bhuj|Mundra':54,'Bhuj|Kandla':70,'Bhuj|Mandvi':67,'Bhuj|Morbi':147,
'Bhavnagar|Ahmedabad':241,'Bhavnagar|Alang':49,'Bhavnagar|Sihor':24,'Bhavnagar|Palitana':52,'Bhavnagar|Talaja':57,'Bhavnagar|Botad':77,
'Junagadh|Rajkot':110,'Junagadh|Keshod':39,'Junagadh|Jetpur':37,'Junagadh|Gondal':72,'Junagadh|Somnath':84,'Junagadh|Manavadar':12,'Junagadh|Veraval':78,'Junagadh|Porbandar':99,
'Gandhinagar|Ahmedabad':27,'Gandhinagar|Mehsana':66,'Gandhinagar|Kalol':18,'Gandhinagar|Kadi':39,
'Mehsana|Ahmedabad':79,'Mehsana|Gandhinagar':66,'Mehsana|Patan':46,'Mehsana|Unjha':29,'Mehsana|Visnagar':26,'Mehsana|Vadnagar':42,
'Palanpur|Deesa':32,'Palanpur|Ambaji':54,'Palanpur|Abu':65,'Palanpur|Radhanpur':120,'Palanpur|Patan':57,
'Surendranagar|Ahmedabad':138,'Surendranagar|Wadhwan':6,'Surendranagar|Dhrangadhra':41,'Surendranagar|Morbi':113,'Surendranagar|Limdi':31,
'Anand|Vallabh Vidyanagar':2,'Anand|Nadiad':19,'Anand|Borsad':21,'Anand|Khambhat':51,'Anand|Kheda':39,
'Somnath|Veraval':6,'Somnath|Kodinar':40,'Somnath|Delvada':76,'Somnath|Una':75,'Somnath|Junagadh':84,
'Veraval|Somnath':6,'Veraval|Keshod':53,'Veraval|Kodinar':45,'Veraval|Delvada':81,'Veraval|Una':80,
'Delvada|Una':7,'Una|Delvada':7,'Una|Kodinar':41,'Una|Somnath':75,'Una|Veraval':80,
'Dwarka|Okha':33,'Okha|Dwarka':33,'Dwarka|Jamnagar':131,'Dwarka|Khambhaliya':80,'Dwarka|Porbandar':109,
'Nadiad|Kathlal':12,'Nadiad|Anand':19,'Nadiad|Kheda':24,'Nadiad|Dakor':36,'Nadiad|Vallabh Vidyanagar':20,
'Kathlal|Anand':12,'Kathlal|Vallabh Vidyanagar':14,'Vallabh Vidyanagar|Anand':2,
'Wadhwan|Surendranagar':6,'Wadhwan|Limdi':24,'Morbi|Wankaner':30,'Wankaner|Morbi':30,'Wankaner|Rajkot':44,
}

function calcFare(km, perKm, minFare, minKm = 100) {
  const billable = Math.max(km, minKm)
  return Math.ceil(Math.max(billable * perKm, minFare) / 100) * 100
}

async function main() {
  console.log('Loading data...')
  const cities = await prisma.city.findMany({ where: { isActive: true } })
  const vehicles = await prisma.vehicle.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' } })
  const routes = await prisma.route.findMany({
    include: {
      originCity: { select: { name: true } },
      destinationCity: { select: { name: true } },
    }
  })

  console.log(`Routes: ${routes.length}, Vehicles: ${vehicles.length}`)

  let updated = 0
  let pricesUpdated = 0

  // Build lookup for distances
  const getKm = (origin, dest) => {
    const key1 = `${origin}|${dest}`
    const key2 = `${dest}|${origin}`
    return DISTANCES[key1] || DISTANCES[key2] || null
  }

  // Also handle "Mumbai Airport" vs "Mumbai Airport" city name matching
  const normalise = (name) => name.replace(' Airport', ' Airport').replace(' Central', ' Central')

  console.log('Updating distances and recalculating fares...')

  const BATCH = 100
  for (let i = 0; i < routes.length; i += BATCH) {
    const batch = routes.slice(i, i + BATCH)
    for (const route of batch) {
      const oName = route.originCity.name
      const dName = route.destinationCity.name
      const verifiedKm = getKm(oName, dName)

      if (verifiedKm && verifiedKm > 0) {
        const km = Math.round(verifiedKm) // round decimal like 32.9 -> 33
        const hrs = Math.round((km / 50) * 10) / 10

        // Update route distance
        await prisma.route.update({
          where: { id: route.id },
          data: { distanceKm: km, estimatedHours: hrs }
        })

        // Recalculate prices for each vehicle
        for (const v of vehicles) {
          const ow = calcFare(km, Number(v.perKmRate), Number(v.minimumFare), v.minimumBillableKm ? Number(v.minimumBillableKm) : 100)
          const rt = Math.ceil(ow * Number(v.roundTripRateMultiplier) / 100) * 100
          await prisma.routePrice.upsert({
            where: { routeId_vehicleId: { routeId: route.id, vehicleId: v.id } },
            update: { oneWayFare: ow, roundTrip: rt, isActive: true },
            create: { routeId: route.id, vehicleId: v.id, oneWayFare: ow, roundTrip: rt, isActive: true }
          })
          pricesUpdated++
        }
        updated++
      }
    }

    if ((i + BATCH) % 1000 === 0 || i + BATCH >= routes.length) {
      process.stdout.write(`\r  Progress: ${Math.min(i + BATCH, routes.length)}/${routes.length} routes`)
    }
  }

  console.log(`\n\n✅ Done!`)
  console.log(`   Routes with verified distances updated: ${updated}`)
  console.log(`   Price entries updated: ${pricesUpdated}`)
  console.log(`\nVehicle rates used:`)
  vehicles.forEach(v => console.log(`  ${v.name}: ₹${Number(v.perKmRate)}/km, min ₹${Number(v.minimumFare)}`))
}

main()
  .catch(e => { console.error('\nError:', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
