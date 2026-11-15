import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import { prisma } from '@/lib/prisma'
import { ArrowRight } from 'lucide-react'
import styles from './BlogPages.module.css'

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
      <main className={styles.listPage}>
        <section className={styles.listHero}>
          <div className={styles.listHeroInner}>
            <p className={styles.eyebrow}>Radhe Krishna Cab</p>
            <h1>
              Travel Blog & Cab Guides
            </h1>
            <p className={styles.listHeroDescription}>
              Tips, guides and stories to help you travel smarter across India.
            </p>
          </div>
        </section>

        <div className={styles.listContent}>
          {posts.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyIcon}>✍️</p>
              <h2>No posts yet</h2>
              <p>Check back soon for travel tips and guides.</p>
            </div>
          ) : (
            <>
              {featured && (
                <Link href={`/blog/${featured.slug}`} className={styles.featuredLink}>
                  <article className={styles.featuredCard}>
                    <div className={styles.featuredImage}>
                      {featured.featuredImage
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={featured.featuredImage} alt={featured.title} />
                        : <div className={styles.imageFallback}>✍️</div>
                      }
                      <span className={styles.featuredBadge}>Featured</span>
                    </div>
                    <div className={styles.featuredBody}>
                      {featured.showCategory && featured.category && <p className={styles.cardCategory}>{featured.category}</p>}
                      <h2>{featured.title}</h2>
                      {featured.excerpt && <p className={styles.featuredExcerpt}>{featured.excerpt}</p>}
                      <span className={styles.readMore}>Read the guide <ArrowRight size={17} /></span>
                    </div>
                  </article>
                </Link>
              )}

              {rest.length > 0 && (
                <div className={styles.postGrid}>
                  {rest.map(post => (
                    <Link key={post.id} href={`/blog/${post.slug}`} className={styles.postLink}>
                      <article className={styles.postCard}>
                        <div className={styles.postImage}>
                          {post.featuredImage
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={post.featuredImage} alt={post.title} />
                            : <div className={styles.imageFallback}>✍️</div>
                          }
                          {post.showCategory && post.category && (
                            <span className={styles.categoryBadge}>
                              {post.category}
                            </span>
                          )}
                        </div>
                        <div className={styles.postBody}>
                          <h2>{post.title}</h2>
                          {post.excerpt && (
                            <p className={styles.postExcerpt}>
                              {post.excerpt}
                            </p>
                          )}
                          <span className={styles.readMore}>Read the guide <ArrowRight size={16} /></span>
                        </div>
                      </article>
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
