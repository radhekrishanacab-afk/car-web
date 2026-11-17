import Link from 'next/link'
import { ArrowRight, MapPin, MessageCircle } from 'lucide-react'
import { blogLocationLabel } from '@/lib/blog-location'
import { prisma } from '@/lib/prisma'

const SITE_NAVY = '#10264A'
const SITE_CYAN = '#08A9EE'

async function getLatestPosts() {
  return prisma.blogPost.findMany({
    where: { status: 'PUBLISHED', homepagePosition: { not: null } },
    orderBy: { homepagePosition: 'asc' },
    take: 4,
  }).catch(() => [])
}

export default async function BlogSection() {
  const [posts, contactSettings] = await Promise.all([
    getLatestPosts(),
    prisma.contactSettings.findFirst().catch(() => null),
  ])
  if (posts.length === 0) return null
  const whatsappNumber = (contactSettings?.whatsappNumber ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919723097832').replace(/\D/g, '')

  return (
    <section style={{ background: '#f8fafc', padding: '64px 16px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 36 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: SITE_CYAN, letterSpacing: '0.1em', marginBottom: 6 }}>TRAVEL BLOG</p>
            <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, color: SITE_NAVY, margin: 0, lineHeight: 1.2 }}>
              Tips, Guides &amp; <span style={{ color: SITE_CYAN }}>Destinations</span>
            </h2>
          </div>
          <Link href="/blog" className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, textDecoration: 'none', padding: '9px 16px', borderRadius: 8 }}>
            View All Posts <ArrowRight size={14} />
          </Link>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 24 }} data-reveal-stagger>
          {posts.map((post) => {
            const title = post.title
            const cardDescription = post.excerpt
            const image = post.featuredImage
            const message = `Hello! I saw "${title}" on your website and would like more information.`
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
            const location = blogLocationLabel(post)

            return (
              <article key={post.id} style={{
                background: '#fff', borderRadius: 16, overflow: 'hidden',
                border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(10,22,40,.06)',
                display: 'flex', flexDirection: 'column', height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}>
                {/* Image */}
                <div style={{ position: 'relative', height: 200, background: '#e8edf5', flexShrink: 0 }}>
                  {image
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 48 }}>✍️</div>
                  }
                  {post.isFeatured && (
                    <div style={{ position: 'absolute', top: 12, left: 12, background: SITE_CYAN, color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 50 }}>
                      FEATURED
                    </div>
                  )}
                  {post.showCategory && post.category && (
                    <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(16,38,74,0.88)', color: '#fff', fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 50 }}>
                      {post.category}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: '20px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {location && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>
                      <MapPin size={12} /> {location}
                    </div>
                  )}
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: SITE_NAVY, margin: '0 0 8px', lineHeight: 1.4 }}>
                    {title}
                  </h3>
                  {cardDescription && (
                    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: '0 0 14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                      {cardDescription}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: 'auto', fontSize: 12, color: '#94a3b8' }}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-[#08A9EE] hover:text-[#0284c7] transition-colors"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700, textDecoration: 'none' }}>
                      Read More <ArrowRight size={11} />
                    </Link>
                  </div>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, padding: '10px 12px', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                    <MessageCircle size={15} /> Enquire on WhatsApp
                  </a>
                </div>
              </article>
            )
          })}
        </div>

      </div>
    </section>
  )
}
