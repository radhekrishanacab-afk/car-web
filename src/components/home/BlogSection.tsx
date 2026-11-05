import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Clock, Tag } from 'lucide-react'
import { prisma } from '@/lib/prisma'

async function getLatestPosts() {
  return prisma.blogPost.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
    take: 3,
  }).catch(() => [])
}

export default async function BlogSection() {
  const posts = await getLatestPosts()
  if (posts.length === 0) return null

  return (
    <section style={{ background: '#f8fafc', padding: '64px 16px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 36 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', letterSpacing: '0.1em', marginBottom: 6 }}>TRAVEL BLOG</p>
            <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, color: '#0a1628', margin: 0, lineHeight: 1.2 }}>
              Tips, Guides &amp; <span style={{ color: '#f59e0b' }}>Destinations</span>
            </h2>
          </div>
          <Link href="/blog"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#0a1628', textDecoration: 'none', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: 8, background: '#fff' }}>
            View All Posts <ArrowRight size={14} />
          </Link>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 24 }}>
          {posts.map((post, i) => (
            <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#fff', borderRadius: 16, overflow: 'hidden',
                border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(10,22,40,.06)',
                display: 'flex', flexDirection: 'column', height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}>
                {/* Image */}
                <div style={{ position: 'relative', height: 200, background: '#e8edf5', flexShrink: 0 }}>
                  {post.featuredImage
                    ? <Image src={post.featuredImage} alt={post.title} fill sizes="400px" style={{ objectFit: 'cover' }} />
                    : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 48 }}>✍️</div>
                  }
                  {i === 0 && post.isFeatured && (
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
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: '0 0 14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                      {post.excerpt}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', fontSize: 12, color: '#94a3b8' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} /> {post.readingMinutes} min read
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#0a1628', fontWeight: 600 }}>
                      Read More <ArrowRight size={11} />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}
