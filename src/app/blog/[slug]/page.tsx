import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import { prisma } from '@/lib/prisma'
import { ArrowLeft, ArrowRight, MapPin, MessageCircle, Tag } from 'lucide-react'
import { blogLocationLabel } from '@/lib/blog-location'
import { buildWAUrl, buildBlogInquiryMessage } from '@/lib/whatsapp'
import styles from '../BlogPages.module.css'

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

function buildWhatsAppMsg(post: { title: string; category?: string | null; showCategory?: boolean }): string {
  return buildBlogInquiryMessage({
    title: post.title,
    category: post.showCategory ? post.category : null,
    source: 'Blog Page',
  })
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({ where: { slug } }).catch(() => null)
  if (!post || post.status !== 'PUBLISHED') notFound()

  const location = blogLocationLabel(post)

  const related = await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED', id: { not: post.id }, ...(post.category ? { category: post.category } : {}) },
    orderBy: { publishedAt: 'desc' },
    take: 3,
  }).catch(() => [])

  return (
    <>
      <Header />
      <main className={styles.articlePage}>
        {post.featuredImage ? (
          <section className={styles.articleHero}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={styles.articleHeroImage} src={post.featuredImage} alt={post.title} />
            <div className={styles.articleHeroShade} />
            <div className={styles.articleHeroContent}>
              {post.showCategory && post.category && <p className={styles.eyebrow}>{post.category}</p>}
              <h1>{post.title}</h1>
              <p className={styles.authorLine}>By {post.authorName}</p>
              {location && (
                <p className={styles.articleLocation}><MapPin size={14} aria-hidden="true" />{location}</p>
              )}
            </div>
          </section>
        ) : (
          <section className={styles.articleTitleBand}>
            <div className={styles.articleTitleInner}>
              {post.showCategory && post.category && <p className={styles.eyebrow}>{post.category}</p>}
              <h1>{post.title}</h1>
              <p className={styles.authorLine}>By {post.authorName}</p>
              {location && (
                <p className={styles.articleLocation}><MapPin size={14} aria-hidden="true" />{location}</p>
              )}
            </div>
          </section>
        )}

        <div className={styles.articleLayout}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/">Home</Link><span>/</span>
            <Link href="/blog">Blog</Link><span>/</span>
            <span className={styles.currentCrumb}>{post.title}</span>
          </nav>

          <article className={styles.articleCard}>
            {post.excerpt && <p className={styles.articleLead}>{post.excerpt}</p>}
            {/* Only render the body if it differs from the excerpt to avoid duplicate content */}
            {post.content && post.content.trim() !== (post.excerpt ?? '').trim() && (
              <div
                className={styles.articleBody}
                dangerouslySetInnerHTML={{ __html: post.content.includes('<') ? post.content : post.content.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('') }}
              />
            )}
            {post.tags && (
              <div className={styles.tags}>
                <Tag size={16} aria-hidden="true" />
                {post.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            )}
          </article>

          <aside className={styles.cta}>
            <div className={styles.ctaCopy}>
              <p className={styles.ctaEyebrow}>Need a reliable ride?</p>
              <h2>Plan your trip with Radhe Krishna Cab</h2>
              <p>Comfortable AC vehicles, verified drivers and 24/7 support.</p>
            </div>
            <a href={buildWAUrl(buildWhatsAppMsg(post), WA)}
              target="_blank" rel="noopener noreferrer" className={styles.whatsappButton}>
              <MessageCircle size={18} /> Book on WhatsApp
            </a>
          </aside>

          {related.length > 0 && (
            <section className={styles.relatedSection}>
              <div className={styles.relatedHeading}>
                <div>
                  <p className={styles.eyebrow}>Keep exploring</p>
                  <h2>More travel guides</h2>
                </div>
                <Link href="/blog" className={styles.allPostsLink}>All posts <ArrowRight size={17} /></Link>
              </div>
              <div className={styles.relatedGrid}>
                {related.map(r => (
                  <Link key={r.id} href={`/blog/${r.slug}`} className={styles.relatedLink}>
                    <article className={styles.relatedCard}>
                      <div className={styles.relatedImage}>
                        {r.featuredImage
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={r.featuredImage} alt={r.title} loading="lazy" />
                          : <div className={styles.imageFallback} />}
                      </div>
                      <div className={styles.relatedBody}>
                        {r.showCategory && r.category && <p className={styles.cardCategory}>{r.category}</p>}
                        {blogLocationLabel(r) && (
                          <p className={styles.cardLocation}><MapPin size={13} aria-hidden="true" />{blogLocationLabel(r)}</p>
                        )}
                        <h3>{r.title}</h3>
                        <span className={styles.readMore}>Read guide <ArrowRight size={15} /></span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <Link href="/blog" className={styles.backLink}><ArrowLeft size={16} /> Back to all articles</Link>
        </div>
      </main>
      <Footer />
      <WhatsAppButton variant="floating" />
    </>
  )
}
