import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import { prisma } from '@/lib/prisma'
import { Calendar, Clock, ArrowLeft, MessageCircle, Tag } from 'lucide-react'

interface PageProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({ where: { slug } }).catch(() => null)
  if (!post) return {}
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || undefined,
    openGraph: { title: post.seoTitle || post.title, description: post.seoDescription || post.excerpt || undefined, images: post.featuredImage ? [post.featuredImage] : [] },
  }
}

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919723097832'

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({ where: { slug } }).catch(() => null)
  if (!post || post.status !== 'PUBLISHED') notFound()

  const related = await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED', id: { not: post.id }, ...(post.category ? { category: post.category } : {}) },
    orderBy: { publishedAt: 'desc' },
    take: 3,
  }).catch(() => [])

  return (
    <>
      <Header />
      <main style={{ minHeight: '100vh', background: '#f8fafc' }}>

        {/* Hero */}
        {post.featuredImage && (
          <div style={{ position: 'relative', height: 420, background: '#0a1628' }}>
            <Image src={post.featuredImage} alt={post.title} fill sizes="100vw" style={{ objectFit: 'cover', opacity: 0.6 }} priority />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(10,22,40,0.9))' }} />
            <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 800, padding: '0 20px' }}>
              {post.category && <p style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', letterSpacing: '0.1em', marginBottom: 10 }}>{post.category.toUpperCase()}</p>}
              <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2.25rem)', fontWeight: 800, color: '#fff', margin: '0 0 12px', lineHeight: 1.3 }}>{post.title}</h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 13, color: '#cbd5e1' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Calendar size={13} />{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Clock size={13} />{post.readingMinutes} min read</span>
                <span style={{ color: '#94a3b8' }}>By {post.authorName}</span>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>

          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#94a3b8', marginBottom: 28 }}>
            <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Home</Link>
            <span>/</span>
            <Link href="/blog" style={{ color: '#94a3b8', textDecoration: 'none' }}>Blog</Link>
            <span>/</span>
            <span style={{ color: '#475569' }}>{post.title.substring(0, 40)}{post.title.length > 40 ? '…' : ''}</span>
          </nav>

          {/* Title (if no featured image) */}
          {!post.featuredImage && (
            <div style={{ marginBottom: 28 }}>
              {post.category && <p style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', letterSpacing: '0.1em', marginBottom: 10 }}>{post.category.toUpperCase()}</p>}
              <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2.25rem)', fontWeight: 800, color: '#0a1628', margin: '0 0 14px', lineHeight: 1.3 }}>{post.title}</h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 13, color: '#94a3b8' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Calendar size={13} />{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Clock size={13} />{post.readingMinutes} min read</span>
              </div>
            </div>
          )}

          {/* Article body */}
          <article style={{ background: '#fff', borderRadius: 16, padding: '36px 40px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(10,22,40,.05)', marginBottom: 32 }}>
            {post.excerpt && (
              <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.8, fontWeight: 500, borderLeft: '4px solid #f59e0b', paddingLeft: 16, marginBottom: 28 }}>
                {post.excerpt}
              </p>
            )}
            <div
              style={{ fontSize: 15, color: '#374151', lineHeight: 1.85 }}
              dangerouslySetInnerHTML={{ __html: post.content.includes('<') ? post.content : post.content.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('') }}
            />
            {post.tags && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 32, paddingTop: 24, borderTop: '1px solid #f1f5f9' }}>
                <Tag size={14} style={{ color: '#94a3b8', marginTop: 2 }} />
                {post.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                  <span key={tag} style={{ fontSize: 12, background: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: 50, fontWeight: 500 }}>{tag}</span>
                ))}
              </div>
            )}
          </article>

          {/* CTA */}
          <div style={{ background: '#0a1628', borderRadius: 14, padding: '28px 32px', marginBottom: 40, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>Plan Your Trip with Radhe Krishna Cab</h3>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>AC vehicles · Verified drivers · Fixed fares · 24/7 support</p>
            </div>
            <a href={`https://wa.me/${WA}?text=${encodeURIComponent('Hello! I read your blog and want to book a taxi.')}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#22c55e', color: '#fff', fontWeight: 700, fontSize: 13, padding: '11px 22px', borderRadius: 50, textDecoration: 'none' }}>
              <MessageCircle size={15} /> Book on WhatsApp
            </a>
          </div>

          {/* Related posts */}
          {related.length > 0 && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0a1628', marginBottom: 20 }}>More Posts</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
                {related.map(r => (
                  <Link key={r.id} href={`/blog/${r.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                      <div style={{ position: 'relative', height: 140, background: '#e8edf5' }}>
                        {r.featuredImage ? <Image src={r.featuredImage} alt={r.title} fill sizes="280px" style={{ objectFit: 'cover' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 32 }}>✍️</div>}
                      </div>
                      <div style={{ padding: '14px 16px' }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#0a1628', margin: '0 0 6px', lineHeight: 1.4 }}>{r.title}</p>
                        <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{r.readingMinutes} min read</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <Link href="/blog" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', fontWeight: 500 }}>← Back to Blog</Link>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton variant="floating" />
    </>
  )
}
