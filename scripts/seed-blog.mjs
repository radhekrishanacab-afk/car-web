import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const posts = [
  {
    title: 'Ahmedabad to Surat Taxi — Complete Travel Guide 2024',
    slug: 'ahmedabad-to-surat-taxi-guide',
    excerpt: 'Planning a trip from Ahmedabad to Surat? Everything you need to know about booking a one-way cab, fare estimates, and travel tips.',
    content: `<h2>Ahmedabad to Surat Taxi Service</h2>
<p>The distance from Ahmedabad to Surat is approximately 265 km and takes around 4-5 hours by road. Radhe Krishna Cab offers comfortable, air-conditioned one-way taxi service on this popular route.</p>
<h2>Fare Estimate</h2>
<p>Sedan: Starting from ₹3,200 | SUV Ertiga: Starting from ₹4,500 | Premium SUV Innova: Starting from ₹5,500</p>
<h2>Best Time to Travel</h2>
<p>Early morning departures (6-8 AM) are recommended to avoid traffic in both cities. The NH-48 highway is well-maintained and offers a smooth journey.</p>
<h2>Why Choose Radhe Krishna Cab?</h2>
<p>✓ Fixed fares, no hidden charges<br/>✓ AC vehicles with experienced drivers<br/>✓ 24/7 availability<br/>✓ Door-to-door pickup and drop</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80',
    category: 'Travel Guide',
    tags: 'Ahmedabad, Surat, taxi, one way cab, Gujarat',
    status: 'PUBLISHED',
    isFeatured: true,
    readingMinutes: 4,
    authorName: 'Radhe Krishna Cab',
    seoTitle: 'Ahmedabad to Surat Taxi | One Way Cab Fare & Booking | Radhe Krishna Cab',
    seoDescription: 'Book Ahmedabad to Surat taxi at best rates. AC cab, experienced drivers, fixed fares. Sedan from ₹3200. Call +91 97230 97832.',
    publishedAt: new Date(),
  },
  {
    title: 'Top 10 Tourist Places Near Ahmedabad You Must Visit',
    slug: 'top-tourist-places-near-ahmedabad',
    excerpt: 'Discover the most beautiful destinations within 200 km of Ahmedabad. From ancient temples to wildlife sanctuaries — plan your weekend getaway.',
    content: `<h2>Best Weekend Destinations Near Ahmedabad</h2>
<p>Ahmedabad is perfectly located for quick getaways to some of Gujarat's most stunning destinations.</p>
<h2>1. Modhera Sun Temple (102 km)</h2>
<p>One of India's most spectacular ancient temples, built in 1026 AD. Best visited during sunrise.</p>
<h2>2. Rani ki Vav, Patan (125 km)</h2>
<p>UNESCO World Heritage stepwell with over 500 major sculptures. An architectural marvel from the 11th century.</p>
<h2>3. Somnath Temple (390 km)</h2>
<p>One of the 12 Jyotirlingas, this sacred temple on the Arabian Sea coast is a must-visit.</p>
<h2>4. Gir National Park (360 km)</h2>
<p>Home to the last wild Asiatic lions. Book a jeep safari for an unforgettable wildlife experience.</p>
<h2>5. Dwarka (450 km)</h2>
<p>Sacred city on the western tip of Gujarat, home to the famous Dwarkadhish Temple.</p>
<p>Book your cab with Radhe Krishna Cab for comfortable travel to all these destinations.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80',
    category: 'Tourism',
    tags: 'Ahmedabad, tourist places, Gujarat tourism, weekend trip',
    status: 'PUBLISHED',
    isFeatured: false,
    readingMinutes: 5,
    authorName: 'Radhe Krishna Cab',
    seoTitle: 'Top 10 Tourist Places Near Ahmedabad | Weekend Getaway Guide',
    seoDescription: 'Explore the best tourist destinations near Ahmedabad within 200-400 km. Plan your Gujarat trip with Radhe Krishna Cab.',
    publishedAt: new Date(),
  },
  {
    title: 'How to Book an Outstation Cab — Tips for First-Time Travelers',
    slug: 'how-to-book-outstation-cab-tips',
    excerpt: 'Booking your first outstation cab? Essential tips to ensure a safe, comfortable, and affordable intercity taxi experience.',
    content: `<h2>Guide to Booking Your First Outstation Cab</h2>
<p>Whether you are planning a pilgrimage, business trip, or family vacation, an outstation cab is often the most convenient option for intercity travel.</p>
<h2>1. Book in Advance</h2>
<p>Always book your cab at least 24 hours in advance, especially during festivals, weekends, and holidays.</p>
<h2>2. Confirm the Fare Structure</h2>
<p>Ask about one-way vs round-trip pricing. One-way fares are ideal if you do not need a return cab.</p>
<h2>3. Check What Is Included</h2>
<p>Clarify: ✓ Toll charges ✓ Driver allowance ✓ Fuel costs ✓ Night charges (if applicable)</p>
<h2>4. Share Your Itinerary</h2>
<p>Let the cab company know your pickup location, destination, and expected return time.</p>
<h2>5. Save the Driver Contact</h2>
<p>Always save your driver's phone number before starting your journey.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80',
    category: 'Travel Tips',
    tags: 'outstation cab, travel tips, cab booking, taxi guide',
    status: 'PUBLISHED',
    isFeatured: false,
    readingMinutes: 3,
    authorName: 'Radhe Krishna Cab',
    seoTitle: 'How to Book Outstation Cab — Complete Guide for New Travelers',
    seoDescription: 'First time booking an outstation taxi? Read our complete guide with tips on fare structure, safety, and booking process.',
    publishedAt: new Date(),
  },
  {
    title: 'Ahmedabad to Rajkot Cab — Distance, Fare & Road Guide',
    slug: 'ahmedabad-to-rajkot-cab-guide',
    excerpt: 'Complete guide for Ahmedabad to Rajkot taxi service. Know the route, distance, estimated fares, and travel tips.',
    content: `<h2>Ahmedabad to Rajkot Taxi Service</h2>
<p>Rajkot, the fourth-largest city of Gujarat, is 245 km from Ahmedabad via NH-47. The journey takes approximately 3.5-4 hours by road.</p>
<h2>Route Information</h2>
<p>Ahmedabad → Surendranagar → Wadhwan → Rajkot via NH-47. Excellent highway with multiple rest stops.</p>
<h2>Fare Estimate</h2>
<p>• Sedan (Swift Dzire): ₹2,800 - ₹3,200<br/>• SUV Ertiga: ₹3,500 - ₹4,000<br/>• Innova Crysta: ₹4,500 - ₹5,000</p>
<h2>Best Places to Visit in Rajkot</h2>
<p>• Jubilee Garden<br/>• Kaba Gandhi No Delo<br/>• Watson Museum<br/>• Aji Dam</p>
<h2>Book Your Cab</h2>
<p>Call or WhatsApp Radhe Krishna Cab at +91 97230 97832 for instant booking confirmation.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    category: 'Travel Guide',
    tags: 'Ahmedabad, Rajkot, taxi, cab, Gujarat travel',
    status: 'PUBLISHED',
    isFeatured: false,
    readingMinutes: 4,
    authorName: 'Radhe Krishna Cab',
    seoTitle: 'Ahmedabad to Rajkot Taxi | Cab Fare, Distance & Booking',
    seoDescription: 'Book Ahmedabad to Rajkot cab at best price. 245 km in 3.5 hrs. AC taxi with verified drivers. Call +91 97230 97832.',
    publishedAt: new Date(),
  },
  {
    title: 'Gujarat Pilgrimage Tour — Somnath, Dwarka & Ambaji by Cab',
    slug: 'gujarat-pilgrimage-tour-somnath-dwarka-ambaji',
    excerpt: 'Plan the perfect Gujarat pilgrimage covering Somnath, Dwarka, and Ambaji. Complete 3-day itinerary and cab booking guide.',
    content: `<h2>Gujarat Pilgrimage Circuit</h2>
<p>Gujarat is home to some of India's most sacred pilgrimage sites. Somnath, Dwarka, and Ambaji form a beautiful spiritual circuit across the state.</p>
<h2>Somnath Temple</h2>
<p>One of the 12 Jyotirlingas, located on the shores of the Arabian Sea.</p>
<p><strong>Distance from Ahmedabad:</strong> 390 km | <strong>Travel time:</strong> ~6 hours</p>
<h2>Dwarka Temple</h2>
<p>The legendary city of Lord Krishna. The Dwarkadhish Temple is one of the four sacred dhams.</p>
<p><strong>From Ahmedabad:</strong> 450 km</p>
<h2>Ambaji Temple</h2>
<p>One of Gujarat's most visited religious sites with millions of devotees annually.</p>
<p><strong>Distance from Ahmedabad:</strong> 175 km</p>
<h2>Recommended 3-Day Itinerary</h2>
<p>Day 1: Ahmedabad → Somnath (stay overnight)<br/>Day 2: Somnath → Dwarka (stay overnight)<br/>Day 3: Dwarka → Ambaji → Ahmedabad</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1570458436416-b8fcccfe883f?w=800&q=80',
    category: 'Pilgrimage',
    tags: 'Somnath, Dwarka, Ambaji, pilgrimage, Gujarat tour',
    status: 'PUBLISHED',
    isFeatured: false,
    readingMinutes: 6,
    authorName: 'Radhe Krishna Cab',
    seoTitle: 'Gujarat Pilgrimage Tour — Somnath Dwarka Ambaji | Radhe Krishna Cab',
    seoDescription: '3-day Gujarat pilgrimage tour guide covering Somnath, Dwarka and Ambaji with cab booking from Ahmedabad.',
    publishedAt: new Date(),
  },
]

async function main() {
  console.log('Adding 5 blog posts...')
  for (const post of posts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    })
    console.log('✓', post.title.substring(0, 55))
  }
  console.log('\n✅ Done! 5 posts added to blog.')
}

main()
  .catch(e => { console.error('Error:', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
