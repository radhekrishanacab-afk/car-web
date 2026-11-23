import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import { prisma } from '@/lib/prisma'
import styles from './BlogPages.module.css'
import BlogClientPage from './BlogClientPage'
import { pageMetadata } from '@/lib/site'

export const revalidate = 3600

export const metadata: Metadata = pageMetadata({
  title: 'Blog — Travel Tips & Cab Guides',
  description: 'Travel tips, cab booking guides, and destination stories from Radhe Krishna Cab. Plan your trip better.',
  path: '/blog',
  keywords: ['travel blog Gujarat', 'cab booking guide', 'road trip tips India'],
})

export default async function BlogPage() {
  const [allPosts, dbCategories] = await Promise.all([
    prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
    }).catch(() => []),
    prisma.blogCategory.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      select: { name: true },
    }).catch(() => [] as { name: string }[]),
  ])

  // Show ALL active admin categories (regardless of post count)
  // Empty categories show with empty state when clicked
  const categories = dbCategories.map(c => c.name)

  const featured = allPosts.find(p => p.isFeatured) ?? allPosts[0] ?? null
  const rest = allPosts.filter(p => p.id !== featured?.id).slice(0, 9)

  const postsForClient = allPosts.map(p => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    featuredImage: p.featuredImage,
    category: p.category,
    showCategory: p.showCategory,
    isFeatured: p.isFeatured,
    state: p.state ?? null,
    district: p.district ?? null,
    showState: p.showState,
    showDistrict: p.showDistrict,
  }))

  return (
    <>
      <Header />
      <main className={styles.listPage}>
        {/* ── Hero ── */}
        <section className={styles.listHero} data-no-reveal>
          <div className={styles.listHeroInner}>
            <p className={`${styles.eyebrow} ${styles.slideUp}`}>Radhe Krishna Cab</p>
            <h1 className={styles.slideUp} style={{ animationDelay: '0.1s' }}>
              Travel Blog &amp; Cab Guides
            </h1>
            <p className={`${styles.listHeroDescription} ${styles.slideUp}`} style={{ animationDelay: '0.2s' }}>
              Tips, guides and stories to help you travel smarter across India.
            </p>
          </div>
        </section>

        {allPosts.length === 0 ? (
          <div className={styles.listContent}>
            <div className={styles.emptyState}>
              <p className={styles.emptyIcon}>✍️</p>
              <h2>No posts yet</h2>
              <p>Check back soon for travel tips and guides.</p>
            </div>
          </div>
        ) : (
          <BlogClientPage
            posts={postsForClient}
            categories={categories}
            featured={featured ? postsForClient.find(p => p.id === featured.id)! : null}
            rest={rest.map(p => postsForClient.find(r => r.id === p.id)!)}
          />
        )}
      </main>
      <Footer />
      <WhatsAppButton variant="floating" />
    </>
  )
}
