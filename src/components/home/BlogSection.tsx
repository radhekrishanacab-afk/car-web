import Link from 'next/link'
import { ArrowRight, Clock, MessageCircle } from 'lucide-react'
import { prisma } from '@/lib/prisma'

async function getLatestPosts() {
  return prisma.blogPost.findMany({
    where: { status: 'PUBLISHED', homepagePosition: { not: null } },
    orderBy: { homepagePosition: 'asc' },
    take: 4,
  }).catch(() => [])
}

export default async function BlogSection() {
  const [posts, sectionSettings, contactSettings] = await Promise.all([
    getLatestPosts(),
    prisma.homepageBlogSettings.findUnique({ where: { id: 1 } }).catch(() => null),
    prisma.contactSettings.findFirst().catch(() => null),
  ])
  if (posts.length === 0) return null
  const heading = sectionSettings?.heading ?? 'TRAVEL BLOG'
  const description = sectionSettings?.description ?? 'Tips, Guides & Destinations'
  const whatsappNumber = (contactSettings?.whatsappNumber ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919723097832').replace(/\D/g, '')

  return (
    <section style={{ background: '#f8fafc', padding: '64px 16px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 36 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', letterSpacing: '0.1em', marginBottom: 6 }}>{heading}</p>
            <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, color: '#0a1628', margin: 0, lineHeight: 1.2 }}>
              {description}
            </h2>
          </div>
          <Link href="/blog"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#0a1628', textDecoration: 'none', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: 8, background: '#fff' }}>
            View All Posts <ArrowRight size={14} />
          </Link>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 24 }}>
          {posts.map((post) => {
            const title = post.homepageTitle || post.title
            const cardDescription = post.homepageDescription || post.excerpt
            const image = post.homepageImage || post.featuredImage
            const message = post.homepageWhatsappMessage || `Hello! I saw "${title}" on your website and would like more information.`
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`

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
                    <div style={{ position: 'absolute', top: 12, left: 12, background: '#f59e0b', color: '#0a1628', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 50 }}>
                      FEATURED
                    </div>
                  )}
                  {post.category && (
                    <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(10,22,40,0.75)', color: '#fff', fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 50 }}>
                      {post.category}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: '20px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0a1628', margin: '0 0 8px', lineHeight: 1.4 }}>
                    {title}
                  </h3>
                  {cardDescription && (
                    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: '0 0 14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                      {cardDescription}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', fontSize: 12, color: '#94a3b8' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} /> {post.readingMinutes} min read
                    </span>
                    <Link href={`/blog/${post.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#0a1628', fontWeight: 600, textDecoration: 'none' }}>
                      Read More <ArrowRight size={11} />
                    </Link>
                  </div>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, padding: '10px 12px', background: '#16a34a', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                    <MessageCircle size={15} /> {post.homepageButtonLabel || 'Enquire on WhatsApp'}
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
