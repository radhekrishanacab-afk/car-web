/**
 * GET /api/admin/routes/distance?origin=Ahmedabad&dest=Surat
 * Returns real road distance in km using Google Maps Distance Matrix API.
 * Falls back to our verified distance table if API key not set.
 */
import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'

// Verified distance table (from Excel data) - fallback when no Google API key
const VERIFIED_KM: Record<string, number> = {
  'Ahmedabad|Surat':269,'Surat|Ahmedabad':269,'Ahmedabad|Vadodara':124,'Vadodara|Ahmedabad':124,
  'Ahmedabad|Rajkot':258,'Rajkot|Ahmedabad':258,'Ahmedabad|Bhuj':359,'Bhuj|Ahmedabad':359,
  'Ahmedabad|Jamnagar':348,'Jamnagar|Ahmedabad':348,'Ahmedabad|Bhavnagar':241,'Bhavnagar|Ahmedabad':241,
  'Ahmedabad|Junagadh':338,'Junagadh|Ahmedabad':338,'Ahmedabad|Gandhinagar':27,'Gandhinagar|Ahmedabad':27,
  'Ahmedabad|Mehsana':79,'Mehsana|Ahmedabad':79,'Ahmedabad|Palanpur':158,'Palanpur|Ahmedabad':158,
  'Ahmedabad|Surendranagar':138,'Surendranagar|Ahmedabad':138,'Ahmedabad|Anand':78,'Anand|Ahmedabad':78,
  'Ahmedabad|Nadiad':63,'Nadiad|Ahmedabad':63,'Ahmedabad|Bharuch':198,'Bharuch|Ahmedabad':198,
  'Ahmedabad|Morbi':212,'Morbi|Ahmedabad':212,'Ahmedabad|Dwarka':479,'Dwarka|Ahmedabad':479,
  'Ahmedabad|Somnath':422,'Somnath|Ahmedabad':422,'Ahmedabad|Porbandar':421,'Porbandar|Ahmedabad':421,
  'Ahmedabad|Mumbai Airport':527,'Mumbai Airport|Ahmedabad':527,'Ahmedabad|Pune':618,'Pune|Ahmedabad':618,
  'Ahmedabad|Delhi':882,'Delhi|Ahmedabad':882,'Ahmedabad|Jaipur':623,'Jaipur|Ahmedabad':623,
  'Ahmedabad|Udaipur':250,'Udaipur|Ahmedabad':250,'Ahmedabad|Abu':223,'Abu|Ahmedabad':223,
  'Surat|Vadodara':150,'Vadodara|Surat':150,'Surat|Mumbai Airport':258,'Mumbai Airport|Surat':258,
  'Surat|Bharuch':71,'Bharuch|Surat':71,'Surat|Bardoli':35,'Bardoli|Surat':35,
  'Surat|Navsari':33,'Navsari|Surat':33,'Surat|Vapi':99,'Vapi|Surat':99,
  'Surat|Valsad':73,'Valsad|Surat':73,'Surat|Daman':98,'Daman|Surat':98,
  'Surat|Thane':242,'Thane|Surat':242,'Surat|Pune':349,'Pune|Surat':349,
  'Vadodara|Anand':46,'Anand|Vadodara':46,'Vadodara|Bharuch':79,'Bharuch|Vadodara':79,
  'Vadodara|Mumbai Airport':408,'Mumbai Airport|Vadodara':408,'Rajkot|Jamnagar':90,'Jamnagar|Rajkot':90,
  'Rajkot|Morbi':69,'Morbi|Rajkot':69,'Rajkot|Gondal':46,'Gondal|Rajkot':46,
  'Rajkot|Junagadh':110,'Junagadh|Rajkot':110,'Rajkot|Bhavnagar':198,'Bhavnagar|Rajkot':198,
  'Bhuj|Gandhidham':61,'Gandhidham|Bhuj':61,'Bhuj|Morbi':147,'Morbi|Bhuj':147,
  'Bhuj|Mundra':54,'Mundra|Bhuj':54,'Bhuj|Kandla':70,'Kandla|Bhuj':70,
  'Bhuj|Mandvi':67,'Mandvi|Bhuj':67,'Bhuj|Kutch':22,'Kutch|Bhuj':22,
  'Jamnagar|Dwarka':131,'Dwarka|Jamnagar':131,'Jamnagar|Khambhaliya':62,'Khambhaliya|Jamnagar':62,
  'Dwarka|Okha':33,'Okha|Dwarka':33,'Dwarka|Porbandar':109,'Porbandar|Dwarka':109,
  'Junagadh|Somnath':84,'Somnath|Junagadh':84,'Junagadh|Veraval':78,'Veraval|Junagadh':78,
  'Somnath|Veraval':6,'Veraval|Somnath':6,'Somnath|Kodinar':40,'Kodinar|Somnath':40,
  'Mumbai Airport|Mumbai Central':17,'Mumbai Central|Mumbai Airport':17,
  'Mumbai Airport|Thane':22,'Thane|Mumbai Airport':22,'Mumbai Airport|Pune':139,'Pune|Mumbai Airport':139,
  'Mumbai Airport|Daman':166,'Daman|Mumbai Airport':166,'Mumbai Airport|Vapi':165,'Vapi|Mumbai Airport':165,
  'Delhi|Jaipur':259,'Jaipur|Delhi':259,'Delhi|Chandigarh':263,'Chandigarh|Delhi':263,
  'Jaipur|Ajmer':143,'Ajmer|Jaipur':143,'Jaipur|Jodhpur':322,'Jodhpur|Jaipur':322,
  'Jaipur|Kota':208,'Kota|Jaipur':208,'Udaipur|Chittorgarh':112,'Chittorgarh|Udaipur':112,
  'Udaipur|Abu':115,'Abu|Udaipur':115,'Udaipur|Sirohi':105,'Sirohi|Udaipur':105,
  'Jodhpur|Ajmer':179,'Ajmer|Jodhpur':179,'Jodhpur|Pali':72,'Pali|Jodhpur':72,
  'Jodhpur|Luni':32,'Luni|Jodhpur':32,'Jodhpur|Barmer':189,'Barmer|Jodhpur':189,
  'Bikaner|Jaisalmer':294,'Jaisalmer|Bikaner':294,'Bikaner|Jodhpur':220,'Jodhpur|Bikaner':220,
  'Ahmedabad|Amreli':281,'Amreli|Ahmedabad':281,'Ahmedabad|Bhilwara':392,'Bhilwara|Ahmedabad':392,
  'Ahmedabad|Ajmer':518,'Ajmer|Ahmedabad':518,'Ahmedabad|Chandigarh':1083,'Chandigarh|Ahmedabad':1083,
  'Ahmedabad|Bikaner':647,'Bikaner|Ahmedabad':647,'Ahmedabad|Kota':510,'Kota|Ahmedabad':510,
  'Gandhidham|Kandla':12,'Kandla|Gandhidham':12,'Gandhidham|Mundra':60,'Mundra|Gandhidham':60,
  'Bhavnagar|Palitana':52,'Palitana|Bhavnagar':52,'Bhavnagar|Sihor':24,'Sihor|Bhavnagar':24,
  'Bhavnagar|Alang':49,'Alang|Bhavnagar':49,'Bharuch|Ankleshwar':11,'Ankleshwar|Bharuch':11,
  'Surendranagar|Wadhwan':6,'Wadhwan|Surendranagar':6,'Wadhwan|Limdi':24,'Limdi|Wadhwan':24,
  'Morbi|Wankaner':30,'Wankaner|Morbi':30,'Wankaner|Rajkot':44,'Rajkot|Wankaner':44,
  'Anand|Vallabh Vidyanagar':2,'Vallabh Vidyanagar|Anand':2,'Anand|Nadiad':19,'Nadiad|Anand':19,
  'Anand|Borsad':21,'Borsad|Anand':21,'Anand|Khambhat':51,'Khambhat|Anand':51,
  'Gondal|Jetpur':35,'Jetpur|Gondal':35,'Gondal|Jasdan':52,'Jasdan|Gondal':52,
  'Jetpur|Upleta':43,'Upleta|Jetpur':43,'Keshod|Veraval':53,'Veraval|Keshod':53,
  'Manavadar|Junagadh':12,'Junagadh|Manavadar':12,'Manavadar|Keshod':28,'Keshod|Manavadar':28,
  'Upleta|Junagadh':36,'Junagadh|Upleta':36,'Una|Delvada':7,'Delvada|Una':7,
  'Himatnagar|Idar':32,'Idar|Himatnagar':32,'Modasa|Himatnagar':45,'Himatnagar|Modasa':45,
  'Unjha|Patan':33,'Patan|Unjha':33,'Unjha|Visnagar':23,'Visnagar|Unjha':23,
  'Vadnagar|Visnagar':16,'Visnagar|Vadnagar':16,'Palanpur|Deesa':32,'Deesa|Palanpur':32,
  'Palanpur|Ambaji':54,'Ambaji|Palanpur':54,'Abu|Sirohi':43,'Sirohi|Abu':43,
  'Ambaji|Abu':38,'Abu|Ambaji':38,'Deesa|Ambaji':77,'Ambaji|Deesa':77,
  'Dholka|Bawla':19,'Bawla|Dholka':19,'Sanand|Bawla':19,'Bawla|Sanand':19,
  'Viramgam|Sanand':45,'Sanand|Viramgam':45,'Dakor|Balasinor':36,'Balasinor|Dakor':36,
  'Dakor|Godhra':57,'Godhra|Dakor':57,'Dakor|Halol':52,'Halol|Dakor':52,
  'Godhra|Halol':41,'Halol|Godhra':41,'Halol|Vadodara':44,'Vadodara|Halol':44,
  'Songadh|Vyara':23,'Vyara|Songadh':23,'Navsari|Sachin':21,'Sachin|Navsari':21,
  'Navsari|Bardoli':30,'Bardoli|Navsari':30,'Valsad|Navsari':46,'Navsari|Valsad':46,
  'Vapi|Valsad':28,'Valsad|Vapi':28,'Daman|Vapi':10,'Vapi|Daman':10,
  'Sachin|Surat':13,'Surat|Sachin':13,'Sihor|Palitana':31,'Palitana|Sihor':31,
  'Alang|Talaja':21,'Talaja|Alang':21,'Talaja|Mahuva':48,'Mahuva|Talaja':48,
  'Mahuva|Alang':68,'Alang|Mahuva':68,'Amreli|Bagasara':33,'Bagasara|Amreli':33,
  'Amreli|Jasdan':58,'Jasdan|Amreli':58,'Botad|Jasdan':60,'Jasdan|Botad':60,
  'Botad|Surendranagar':71,'Surendranagar|Botad':71,'Botad|Limdi':56,'Limdi|Botad':56,
  'Limdi|Bagodara':52,'Bagodara|Limdi':52,'Bagodara|Bawla':65,'Bawla|Bagodara':65,
  'Bagodara|Dholka':55,'Dholka|Bagodara':55,'Kandla|Morbi':77,'Morbi|Kandla':77,
  'Surendranagar|Dhrangadhra':41,'Dhrangadhra|Surendranagar':41,'Halvad|Dhrangadhra':35,'Dhrangadhra|Halvad':35,
  'Halvad|Morbi':50,'Morbi|Halvad':50,'Wadhwan|Dhrangadhra':47,'Dhrangadhra|Wadhwan':47,
  'Viramgam|Ahmedabad':67,'Ahmedabad|Viramgam':67,'Ranip|Ahmedabad':9,'Ahmedabad|Ranip':9,
  'Kadi|Mehsana':39,'Mehsana|Kadi':39,'Kalol|Gandhinagar':18,'Gandhinagar|Kalol':18,
  'Kadi|Kalol':21,'Kalol|Kadi':21,'Patan|Mehsana':46,'Mehsana|Patan':46,
  'Patan|Palanpur':57,'Palanpur|Patan':57,'Radhanpur|Deesa':87,'Deesa|Radhanpur':87,
  'Tharad|Deesa':70,'Deesa|Tharad':70,'Tharad|Palanpur':97,'Palanpur|Tharad':97,
  'Karjan|Vadodara':35,'Vadodara|Karjan':35,'Karjan|Bharuch':49,'Bharuch|Karjan':49,
  'Dahej|Bharuch':58,'Bharuch|Dahej':58,'Ankleshwar|Dahej':61,'Dahej|Ankleshwar':61,
  'Dhrangadhra|Gandhidham':165,'Gandhidham|Dhrangadhra':165,'Bhuj|Halvad':196,'Halvad|Bhuj':196,
  'Delvada|Kodinar':41,'Kodinar|Delvada':41,'Delvada|Bagasara':91,'Bagasara|Delvada':91,
  'Sihor|Mahuva':82,'Mahuva|Sihor':82,'Una|Somnath':75,'Somnath|Una':75,
  'Una|Veraval':80,'Veraval|Una':80,'Una|Kodinar':41,'Kodinar|Una':41,
  'Luni|Balotra':91,'Balotra|Luni':91,'Barmer|Balotra':98,'Balotra|Barmer':98,
  'Pali|Balotra':124,'Balotra|Pali':124,'Pali|Ajmer':167,'Ajmer|Pali':167,
  'Bhilwara|Ajmer':141,'Ajmer|Bhilwara':141,'Bhilwara|Chittorgarh':60,'Chittorgarh|Bhilwara':60,
  'Bhilwara|Kota':142,'Kota|Bhilwara':142,'Rajsamand|Bhilwara':93,'Bhilwara|Rajsamand':93,
  'Rajsamand|Chittorgarh':89,'Chittorgarh|Rajsamand':89,'Rajsamand|Udaipur':68,'Udaipur|Rajsamand':68,
  'Rajsamand|Ajmer':200,'Ajmer|Rajsamand':200,'Rajsamand|Jodhpur':171,'Jodhpur|Rajsamand':171,
  'Ajmer|Kota':203,'Kota|Ajmer':203,'Ajmer|Bikaner':241,'Bikaner|Ajmer':241,
  'Ajmer|Luni':186,'Luni|Ajmer':186,'Ajmer|Beawar':60,'Beawar|Ajmer':60,
  'Beawar|Jodhpur':148,'Jodhpur|Beawar':148,'Beawar|Kota':202,'Kota|Beawar':202,
  'Jaisalmer|Barmer':158,'Barmer|Jaisalmer':158,'Jaisalmer|Jodhpur':246,'Jodhpur|Jaisalmer':246,
  'Jaisalmer|Jaipur':567,'Jaipur|Jaisalmer':567,'Bikaner|Luni':249,'Luni|Bikaner':249,
  'Sirohi|Jodhpur':166,'Jodhpur|Sirohi':166,'Sirohi|Pali':124,'Pali|Sirohi':124,
  'Sirohi|Balotra':139,'Balotra|Sirohi':139,'Sirohi|Ambaji':70,'Ambaji|Sirohi':70,
  'Chandigarh|Bikaner':496,'Bikaner|Chandigarh':496,'Chandigarh|Jaipur':479,'Jaipur|Chandigarh':479,
  'Modasa|Kadi':122,'Kadi|Modasa':122,'Godhra|Ahmedabad':156,'Ahmedabad|Godhra':156,
  'Dahod|Godhra':76,'Godhra|Dahod':76,'Dahod|Modasa':137,'Modasa|Dahod':137,
  'Kheda|Anand':39,'Anand|Kheda':39,'Kheda|Dholka':30,'Dholka|Kheda':30,
  'Kheda|Bawla':42,'Bawla|Kheda':42,'Borsad|Nadiad':38,'Nadiad|Borsad':38,
  'Borsad|Khambhat':37,'Khambhat|Borsad':37,'Kapadvanj|Balasinor':34,'Balasinor|Kapadvanj':34,
  'Kathlal|Anand':12,'Anand|Kathlal':12,'Kathlal|Vallabh Vidyanagar':14,'Vallabh Vidyanagar|Kathlal':14,
  'Nadiad|Kathlal':12,'Kathlal|Nadiad':12,'Nadiad|Dakor':36,'Dakor|Nadiad':36,
  'Nadiad|Vallabh Vidyanagar':20,'Vallabh Vidyanagar|Nadiad':20,
}

function getVerifiedKm(origin: string, dest: string): number | null {
  return VERIFIED_KM[`${origin}|${dest}`] || VERIFIED_KM[`${dest}|${origin}`] || null
}

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const origin = searchParams.get('origin') ?? ''
  const dest   = searchParams.get('dest') ?? ''

  if (!origin || !dest) return Response.json({ error: 'origin and dest required' }, { status: 400 })
  if (origin === dest)   return Response.json({ error: 'Origin and destination are the same' }, { status: 400 })

  // Try Google Maps Distance Matrix API first
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (apiKey) {
    try {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin + ', India')}&destinations=${encodeURIComponent(dest + ', India')}&key=${apiKey}&units=metric`
      const res = await fetch(url)
      const data = await res.json()

      if (data.status === 'OK' && data.rows?.[0]?.elements?.[0]?.status === 'OK') {
        const meters = data.rows[0].elements[0].distance.value
        const km = Math.round(meters / 1000)
        const durationSec = data.rows[0].elements[0].duration.value
        const hrs = Math.round((durationSec / 3600) * 10) / 10
        return Response.json({ km, hrs, source: 'google_maps' })
      }
    } catch {
      // fall through to verified table
    }
  }

  // Fall back to verified distance table
  const km = getVerifiedKm(origin, dest)
  if (km) {
    const hrs = Math.round((km / 50) * 10) / 10
    return Response.json({ km, hrs, source: 'verified_table' })
  }

  // Estimate from coordinate distance (rough fallback)
  return Response.json({ km: null, hrs: null, source: 'unknown', message: 'Distance not found. Please enter manually.' })
}
