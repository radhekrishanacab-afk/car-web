import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding tourist places...')

  const gj = await prisma.indianState.upsert({
    where: { slug: 'gujarat' }, update: {},
    create: { name: 'Gujarat', slug: 'gujarat', code: 'GJ', region: 'Western India', isActive: true },
  })
  const uk = await prisma.indianState.upsert({
    where: { slug: 'uttarakhand' }, update: {},
    create: { name: 'Uttarakhand', slug: 'uttarakhand', code: 'UK', region: 'North India', isActive: true },
  })

  const temple = await prisma.placeCategory.upsert({
    where: { slug: 'temple' }, update: {},
    create: { name: 'Temple', slug: 'temple', icon: '🛕', displayOrder: 1 },
  })
  const nature = await prisma.placeCategory.upsert({
    where: { slug: 'nature' }, update: {},
    create: { name: 'Nature', slug: 'nature', icon: '🌿', displayOrder: 2 },
  })
  const wildlife = await prisma.placeCategory.upsert({
    where: { slug: 'wildlife' }, update: {},
    create: { name: 'Wildlife', slug: 'wildlife', icon: '🦁', displayOrder: 3 },
  })

  const places = [
    {
      name: 'Saputara Hill Station',
      slug: 'saputara-hill-station',
      shortDescription: "Gujarat's only hill station at 1000m altitude. Famous for cool climate, scenic Saptashrungi Lake, and stunning sunrise views over the Sahyadri mountains.",
      description: "Saputara is Gujarat's only hill station located in the Dang district at 1000 metres altitude. Surrounded by dense forests and waterfalls, it is a perfect retreat from the summer heat. Popular for boating, rope-way rides, and trekking.",
      featuredImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Saputara_Lake.jpg/1280px-Saputara_Lake.jpg',
      latitude: 20.5754, longitude: 73.7446,
      stateId: gj.id, categoryId: nature.id,
      cityName: 'Saputara', address: 'Dang District, Gujarat',
      bestTimeToVisit: 'June to February', visitDuration: '1-2 days',
      entryFee: 'Free (activity charges extra)',
      tags: 'hill station, nature, Gujarat, Sahyadri, lake',
      status: 'PUBLISHED', isFeatured: true,
      seoTitle: 'Saputara Hill Station Gujarat | Tourist Guide & Cab Booking',
      seoDescription: 'Visit Saputara, Gujarat\'s only hill station. Book cab from Ahmedabad to Saputara with Radhe Krishna Cab.',
    },
    {
      name: 'Kedarnath Temple',
      slug: 'kedarnath-temple',
      shortDescription: "One of the holiest Hindu shrines and a Jyotirlinga of Lord Shiva, situated at 3,583m in the Himalayas. A must-visit pilgrimage destination in India.",
      description: "Kedarnath is one of the 12 Jyotirlingas and part of the Char Dham pilgrimage. Located at 3583 metres in Uttarakhand, the ancient stone temple is surrounded by snow-capped peaks and glaciers. Open from May to November.",
      featuredImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Kedarnath_Temple.jpg/1280px-Kedarnath_Temple.jpg',
      latitude: 30.7352, longitude: 79.0669,
      stateId: uk.id, categoryId: temple.id,
      cityName: 'Kedarnath', address: 'Rudraprayag District, Uttarakhand',
      bestTimeToVisit: 'May to June, September to October',
      visitDuration: '1-2 days', entryFee: 'Free',
      tags: 'pilgrimage, Jyotirlinga, Shiva, Char Dham, Himalaya',
      status: 'PUBLISHED', isFeatured: true,
      seoTitle: 'Kedarnath Temple | Pilgrimage Guide & Cab Booking',
      seoDescription: 'Plan your Kedarnath pilgrimage with complete travel guide. Book cab service with Radhe Krishna Cab.',
    },
    {
      name: 'Somnath Temple',
      slug: 'somnath-temple',
      shortDescription: "The first of the 12 Jyotirlingas, Somnath Temple stands majestically on the shores of the Arabian Sea. A sacred pilgrimage site with magnificent architecture.",
      description: "Somnath Temple in Prabhas Patan, Veraval is one of the most sacred Hindu temples. It has been rebuilt 17 times after repeated demolitions. The temple stands on the seafront of Saurashtra with a sound and light show every evening.",
      featuredImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Somnath_temple_1.jpg/1280px-Somnath_temple_1.jpg',
      latitude: 20.8880, longitude: 70.4013,
      stateId: gj.id, categoryId: temple.id,
      cityName: 'Veraval', address: 'Prabhas Patan, Veraval, Gujarat',
      bestTimeToVisit: 'October to March', visitDuration: 'Half day to 1 day',
      entryFee: 'Free',
      tags: 'Somnath, Jyotirlinga, temple, pilgrimage, Gujarat, Arabian Sea',
      status: 'PUBLISHED', isFeatured: false,
      seoTitle: 'Somnath Temple Gujarat | Jyotirlinga Pilgrimage & Cab Booking',
      seoDescription: 'Visit Somnath Temple, first Jyotirlinga on the Arabian Sea coast. Book Ahmedabad to Somnath cab with Radhe Krishna Cab.',
    },
    {
      name: 'Sasan Gir National Park',
      slug: 'sasan-gir-national-park',
      shortDescription: "The last sanctuary of the Asiatic Lion in the world. Sasan Gir offers thrilling jeep safaris and an unforgettable wildlife experience in the heart of Gujarat.",
      description: "Gir National Park and Wildlife Sanctuary is the only place in the world outside Africa where you can see lions in the wild. Located in Junagadh district, it covers 1412 sq km and is home to over 500 Asiatic lions along with leopards, deer, and 300+ bird species.",
      featuredImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Asiatic_Lion_and_Lioness.jpg/1280px-Asiatic_Lion_and_Lioness.jpg',
      latitude: 21.1243, longitude: 70.7982,
      stateId: gj.id, categoryId: wildlife.id,
      cityName: 'Sasan Gir', address: 'Junagadh District, Gujarat',
      bestTimeToVisit: 'December to March', visitDuration: '1-2 days',
      entryFee: '₹75 per person (Indian) + jeep charges',
      tags: 'lion, wildlife, safari, Gir, Gujarat, national park',
      status: 'PUBLISHED', isFeatured: false,
      seoTitle: 'Sasan Gir National Park | Asiatic Lion Safari & Cab Booking',
      seoDescription: 'Visit Sasan Gir, home of Asiatic Lions. Book Ahmedabad to Gir cab with Radhe Krishna Cab for an unforgettable safari.',
    },
    {
      name: 'Rann of Kutch',
      slug: 'rann-of-kutch',
      shortDescription: "The world's largest salt desert, transformed into a magical white landscape under the full moon. Home to the famous Rann Utsav festival every winter.",
      description: "The Great Rann of Kutch is a seasonal salt marsh in the Thar Desert. Spanning 7500 sq km, it becomes a dazzling white desert during winter. The annual Rann Utsav festival (November-February) draws thousands of visitors with folk music, crafts, and camel rides.",
      featuredImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Rann_of_Kutch.jpg/1280px-Rann_of_Kutch.jpg',
      latitude: 23.7337, longitude: 69.8597,
      stateId: gj.id, categoryId: nature.id,
      cityName: 'Bhuj', address: 'Kutch District, Gujarat',
      bestTimeToVisit: 'November to February (Rann Utsav)', visitDuration: '2-3 days',
      entryFee: '₹100 per person',
      tags: 'Rann of Kutch, salt desert, Rann Utsav, Gujarat, Kutch',
      status: 'PUBLISHED', isFeatured: false,
      seoTitle: 'Rann of Kutch Gujarat | White Desert & Rann Utsav Guide',
      seoDescription: 'Experience the magical Rann of Kutch white desert. Book Ahmedabad to Bhuj cab with Radhe Krishna Cab.',
    },
    {
      name: 'Statue of Unity',
      slug: 'statue-of-unity',
      shortDescription: "The world's tallest statue at 182 metres, dedicated to Sardar Vallabhbhai Patel. A marvel of modern engineering rising above the Narmada River in Gujarat.",
      description: "The Statue of Unity stands 182 metres tall, making it the world's tallest statue, nearly twice the height of the Statue of Liberty. Located near Kevadia in Narmada district, it faces the Sardar Sarovar Dam. The complex includes a museum, valley of flowers, jungle safari, and a viewing gallery at 153 metres.",
      featuredImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Statue_of_Unity_India.jpg/800px-Statue_of_Unity_India.jpg',
      latitude: 21.8380, longitude: 73.7190,
      stateId: gj.id, categoryId: nature.id,
      cityName: 'Kevadia', address: 'Narmada District, Gujarat',
      bestTimeToVisit: 'October to March', visitDuration: '1 day',
      entryFee: '₹150 per person (viewing gallery ₹350)',
      tags: 'Statue of Unity, Sardar Patel, Gujarat, Narmada, Kevadia',
      status: 'PUBLISHED', isFeatured: false,
      seoTitle: 'Statue of Unity Gujarat | World Tallest Statue Visit Guide',
      seoDescription: "Visit Statue of Unity, world's tallest statue. Book Vadodara or Ahmedabad to Kevadia cab with Radhe Krishna Cab.",
    },
  ]

  for (const place of places) {
    await prisma.touristPlace.upsert({
      where: { slug: place.slug },
      update: place,
      create: place,
    })
    console.log('✓', place.name)
  }

  console.log('\n✅ 6 tourist places seeded!')
}

main()
  .catch(e => { console.error('Error:', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
