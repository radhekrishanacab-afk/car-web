/**
 * Additional sample places for testing the full India → Gujarat → Ahmedabad flow.
 * Run: node scripts/seed-more-places.mjs
 */
import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

async function main() {
  // Get Gujarat state
  const gujarat = await p.indianState.findUnique({ where: { slug: 'gujarat' } })
  if (!gujarat) { console.error('Gujarat not found. Run seed-explore-india.mjs first.'); return }

  // Ensure Ahmedabad district exists
  const amdDist = await p.indianDistrict.upsert({
    where: { stateId_slug: { stateId: gujarat.id, slug: 'ahmedabad' } },
    update: { name: 'Ahmedabad', latitude: 23.0225, longitude: 72.5714 },
    create: { name: 'Ahmedabad', slug: 'ahmedabad', stateId: gujarat.id, latitude: 23.0225, longitude: 72.5714, isActive: true },
  })

  const narmadaDist = await p.indianDistrict.upsert({
    where: { stateId_slug: { stateId: gujarat.id, slug: 'narmada' } },
    update: { name: 'Narmada', latitude: 21.8719, longitude: 73.4757 },
    create: { name: 'Narmada', slug: 'narmada', stateId: gujarat.id, latitude: 21.8719, longitude: 73.4757, isActive: true },
  })

  // Get categories
  const temples   = await p.placeCategory.findUnique({ where: { slug: 'temples' } })
  const hist      = await p.placeCategory.findUnique({ where: { slug: 'historical' } })
  const wildlife  = await p.placeCategory.findUnique({ where: { slug: 'wildlife' } })
  const cultural  = await p.placeCategory.findUnique({ where: { slug: 'cultural-heritage' } })

  const places = [
    {
      name: 'Sabarmati Ashram',
      slug: 'sabarmati-ashram-ahmedabad',
      shortDescription: 'Mahatma Gandhi\'s historic ashram on the banks of the Sabarmati river in Ahmedabad, where he lived and launched the famous Dandi March.',
      description: 'Sabarmati Ashram, also known as Gandhi Ashram, is located on the banks of the Sabarmati river in Ahmedabad. Mahatma Gandhi established the ashram in 1917 and lived here until 1930 when he began the famous Dandi Salt March. The ashram is now a national monument and museum, preserving Gandhi\'s living quarters, his personal belongings, and photographs documenting his life and the Indian independence movement.',
      address: 'Gandhi Ashram Road, Ahmedabad, Gujarat 380027',
      latitude: 23.0611,
      longitude: 72.5803,
      stateId: gujarat.id,
      districtId: amdDist.id,
      cityName: 'Ahmedabad',
      categoryId: hist?.id ?? null,
      tags: 'Gandhi, Sabarmati, ashram, heritage, museum, Ahmedabad, independence',
      visitingHours: '8:30 AM – 6:30 PM (All days)',
      entryFee: 'Free',
      bestTimeToVisit: 'October to March',
      visitDuration: '1–2 hours',
      isFeatured: true,
      status: 'PUBLISHED',
      seoTitle: 'Sabarmati Ashram Ahmedabad — Gandhi Heritage Museum',
      seoDescription: 'Visit Sabarmati Ashram in Ahmedabad, where Mahatma Gandhi lived and planned the Dandi March. Book taxi with Radhe Krishna Cab.',
      featuredImage: null,
    },
    {
      name: 'Adalaj Stepwell',
      slug: 'adalaj-stepwell',
      shortDescription: 'A magnificent 15th-century stepwell in Adalaj village near Ahmedabad, known for its stunning Indo-Islamic architecture and intricate carvings.',
      description: 'Adalaj Stepwell, also called Adalaj ni Vav, is a historic stepwell located in the village of Adalaj, about 18 km from Ahmedabad. Built in 1498 by Queen Rudabai, it is a five-storey deep structure with elaborately carved walls, pillars, and niches featuring Hindu and Jain motifs. The stepwell is an outstanding example of Indo-Islamic architecture and one of Gujarat\'s most visited heritage sites.',
      address: 'Adalaj Village, Gandhinagar District, Gujarat 382421',
      latitude: 23.1643,
      longitude: 72.5800,
      stateId: gujarat.id,
      districtId: amdDist.id,
      cityName: 'Adalaj',
      categoryId: hist?.id ?? null,
      tags: 'stepwell, vav, heritage, architecture, Adalaj, Ahmedabad, UNESCO',
      visitingHours: '6:00 AM – 6:00 PM',
      entryFee: 'Free',
      bestTimeToVisit: 'October to March',
      visitDuration: '1 hour',
      isFeatured: false,
      status: 'PUBLISHED',
      seoTitle: 'Adalaj Stepwell — 15th Century Heritage Near Ahmedabad',
      seoDescription: 'Visit Adalaj Stepwell near Ahmedabad — a stunning 15th-century heritage monument. Book taxi with Radhe Krishna Cab.',
      featuredImage: null,
    },
    {
      name: 'Akshardham Temple Gandhinagar',
      slug: 'akshardham-temple-gandhinagar',
      shortDescription: 'The Akshardham Temple in Gandhinagar is a stunning Hindu temple complex dedicated to Bhagwan Swaminarayan, showcasing intricate pink sandstone carvings.',
      description: 'Akshardham Temple in Gandhinagar, Gujarat, is a sprawling Hindu temple complex dedicated to Bhagwan Swaminarayan. Built in 1992, it is constructed with 6,000 metric tonnes of pink Rajasthani sandstone without using steel. The complex features intricately carved pillars, domes, and friezes depicting deities, sages, and spiritual themes. It is one of the largest Hindu temples in India.',
      address: 'Akshardham Temple Road, Gandhinagar, Gujarat 382037',
      latitude: 23.2156,
      longitude: 72.6369,
      stateId: gujarat.id,
      districtId: amdDist.id,
      cityName: 'Gandhinagar',
      categoryId: temples?.id ?? null,
      tags: 'temple, Swaminarayan, Akshardham, Gandhinagar, Gujarat, Hindu',
      visitingHours: '9:30 AM – 6:30 PM (Closed Mondays)',
      entryFee: 'Free (exhibition charges apply)',
      bestTimeToVisit: 'October to March',
      visitDuration: '2–3 hours',
      isFeatured: true,
      status: 'PUBLISHED',
      seoTitle: 'Akshardham Temple Gandhinagar — Swaminarayan Temple Gujarat',
      seoDescription: 'Visit Akshardham Temple in Gandhinagar, Gujarat — a magnificent Swaminarayan temple. Book taxi with Radhe Krishna Cab.',
      featuredImage: null,
    },
    {
      name: 'Gir National Park',
      slug: 'gir-national-park',
      shortDescription: 'Gir National Park in Gujarat is the only habitat in the world for the Asiatic Lion, offering safaris through dry deciduous forest and grasslands.',
      description: 'Gir National Park and Wildlife Sanctuary, established in 1965, is the only natural habitat of the Asiatic lion in the world. Located in the Saurashtra region of Gujarat, it covers an area of 1,412 sq km. The park is home to over 600 Asiatic lions, as well as leopards, sloth bears, hyenas, crocodiles, and more than 300 species of birds. Jeep safaris and forest trails are available for visitors.',
      address: 'Sasan Gir, Junagadh District, Gujarat 362135',
      latitude: 21.1237,
      longitude: 70.7971,
      stateId: gujarat.id,
      districtId: null,
      cityName: 'Sasan Gir',
      categoryId: wildlife?.id ?? null,
      tags: 'Asiatic lion, wildlife, national park, safari, Gujarat, jungle',
      visitingHours: 'Safari timings: 6:00 AM – 9:00 AM, 3:00 PM – 6:00 PM',
      entryFee: '₹50 per person + safari charges',
      bestTimeToVisit: 'December to April',
      visitDuration: 'Half day to 1 day',
      isFeatured: true,
      status: 'PUBLISHED',
      seoTitle: 'Gir National Park Gujarat — Asiatic Lion Safari',
      seoDescription: 'Visit Gir National Park, the only habitat of the Asiatic lion in the world. Book outstation taxi with Radhe Krishna Cab.',
      featuredImage: null,
    },
    {
      name: 'Statue of Unity',
      slug: 'statue-of-unity',
      shortDescription: 'The world\'s tallest statue at 182 metres, dedicated to Sardar Vallabhbhai Patel, in Narmada district, Gujarat.',
      description: 'The Statue of Unity is the world\'s tallest statue at 182 metres (597 ft), a tribute to Sardar Vallabhbhai Patel, the first Deputy Prime Minister of India. Located near Kevadiya in the Narmada district of Gujarat, it faces the Sardar Sarovar Dam. Inaugurated on 31 October 2018, it includes a viewing gallery, museum, and valley of flowers.',
      address: 'Kevadiya Colony, Narmada District, Gujarat 393155',
      latitude: 21.8381,
      longitude: 73.7196,
      stateId: gujarat.id,
      districtId: narmadaDist.id,
      cityName: 'Kevadiya',
      categoryId: hist?.id ?? null,
      tags: 'Statue of Unity, Sardar Patel, Narmada, Gujarat, world tallest statue',
      visitingHours: '8:00 AM – 6:00 PM (Closed Mondays)',
      entryFee: '₹120 per adult (Indian)',
      bestTimeToVisit: 'October to March',
      visitDuration: '3–4 hours',
      isFeatured: true,
      status: 'PUBLISHED',
      featuredImage: '/images/destinations/statue-of-unity.jpg',
      seoTitle: 'Statue of Unity — World\'s Tallest Statue | Gujarat',
      seoDescription: 'Visit the Statue of Unity in Narmada, Gujarat. Book taxi from Ahmedabad, Surat, Vadodara with Radhe Krishna Cab.',
    },
  ]

  for (const pl of places) {
    await p.touristPlace.upsert({
      where: { slug: pl.slug },
      update: pl,
      create: pl,
    })
    console.log('  ✓', pl.name)
  }

  const total = await p.touristPlace.count({ where: { status: 'PUBLISHED' } })
  console.log('\n✅ Done. Total published places:', total)
}

main().catch(e => { console.error(e.message); process.exit(1) }).finally(() => p.$disconnect())
