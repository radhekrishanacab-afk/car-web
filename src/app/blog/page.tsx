import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import { prisma } from '@/lib/prisma'
import { Calendar, Clock, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog — Travel Tips & Cab Guides | Radhe Krishna Cab',
  description: 'Travel tips, cab booking guides, and destination stories from Radhe Krishna Cab. Plan your trip better.',
}

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
  }).catch(() => [])

  const featured = posts.find(p => p.isFeatured) ?? posts[0]
  const rest = posts.filter(p => p.id !== featured?.id)

  return (
    <>
      <Header />
      <main style={{ minHeight: '100vh', background: '#f8fafc' }}>

        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg,#0a1628 0%,#1a3a6b 100%)', padding: '52px 20px 40px', color: '#fff' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: 12, letterSpacing: '0.1em', color: '#f59e0b', fontWeight: 600, marginBottom: 10 }}>RADHE KRISHNA CAB</p>
            <h1 style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 800, margin: '0 0 12px' }}>
              Travel Blog & Cab Guides
            </h1>
            <p style={{ fontSize: 15, color: '#94a3b8', margin: 0 }}>
              Tips, guides and stories to help you travel smarter across India.
            </p>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 16px' }}>

          {posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 16, border: '1px dashed #e2e8f0' }}>
              <p style={{ fontSize: 48, marginBottom: 12 }}>✍️</p>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#475569', margin: '0 0 8px' }}>No posts yet</h2>
              <p style={{ fontSize: 14, color: '#94a3b8' }}>Check back soon for travel tips and guides.</p>
            </div>
          ) : (
            <>
              {/* Featured post */}
              {featured && (
                <Link href={`/blog/${featured.slug}`} style={{ display: 'block', textDecoration: 'none', marginBottom: 40 }}>
                  <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(10,22,40,.07)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}>
                    <div style={{ position: 'relative', minHeight: 260, background: '#e8edf5' }}>
                      {featured.featuredImage
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={featured.featuredImage} alt={featured.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 260 }} />
                        : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 260, fontSize: 64 }}>✍️</div>
                      }
                      <div style={{ position: 'absolute', top: 14, left: 14, background: '#f59e0b', color: '#0a1628', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 50 }}>FEATURED</div>
                    </div>
                    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      {featured.category && <p style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', letterSpacing: '0.08em', marginBottom: 10 }}>{featured.category.toUpperCase()}</p>}
                      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0a1628', margin: '0 0 12px', lineHeight: 1.3 }}>{featured.title}</h2>
                      {featured.excerpt && <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, margin: '0 0 20px' }}>{featured.excerpt}</p>}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: '#94a3b8' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} />{featured.publishedAt ? new Date(featured.publishedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} />{featured.readingMinutes} min read</span>
                      </div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 20, color: '#0a1628', fontWeight: 700, fontSize: 13 }}>
                        Read More <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* Rest of posts grid */}
              {rest.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 24 }}>
                  {rest.map(post => (
                    <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                      <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(10,22,40,.05)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ position: 'relative', height: 200, background: '#e8edf5', flexShrink: 0 }}>
                          {post.featuredImage
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={post.featuredImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 48 }}>✍️</div>
                          }
                          {post.category && (
                            <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(10,22,40,.75)', color: '#fff', fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 50 }}>
                              {post.category}
                            </div>
                          )}
                        </div>
                        <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0a1628', margin: '0 0 8px', lineHeight: 1.4 }}>{post.title}</h3>
                          {post.excerpt && (
                            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: '0 0 14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                              {post.excerpt}
                            </p>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginTop: 'auto' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} />{post.readingMinutes} min</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#0a1628', fontWeight: 600 }}>Read More <ArrowRight size={11} /></span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppButton variant="floating" />
    </>
  )
}
