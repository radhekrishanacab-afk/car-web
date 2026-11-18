'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, MapPin, LayoutGrid } from 'lucide-react'
import styles from './BlogPages.module.css'

type PostItem = {
  id: number
  slug: string
  title: string
  excerpt: string | null
  featuredImage: string | null
  category: string | null
  showCategory: boolean | null
  isFeatured: boolean
  state: string | null
  district: string | null
  showState: boolean
  showDistrict: boolean
}

function locationLabel(post: PostItem): string | null {
  const parts: string[] = []
  if (post.showDistrict && post.district) parts.push(post.district)
  if (post.showState && post.state) parts.push(post.state)
  return parts.length ? parts.join(', ') : null
}

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); obs.disconnect() }
      },
      { threshold: 0.06, rootMargin: '0px 0px -30px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return { ref, visible }
}

function FeaturedCard({ post }: { post: PostItem }) {
  const { ref, visible } = useReveal()
  const loc = locationLabel(post)

  return (
    <div ref={ref} className={`${styles.featuredReveal} ${visible ? styles.featuredRevealVisible : ''}`}>
      <Link href={`/blog/${post.slug}`} className={styles.featuredLink}>
        <article className={styles.featuredCard}>
          <div className={styles.featuredImage}>
            {post.featuredImage
              ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.featuredImage} alt={post.title}
                  className={styles.lazyImg} loading="lazy"
                  onLoad={e => (e.currentTarget as HTMLImageElement).classList.add(styles.lazyImgLoaded)} />
              )
              : <div className={styles.imgBlank} />
            }
            <span className={styles.featuredBadge}>Featured</span>
          </div>
          <div className={styles.featuredBody}>
            {post.showCategory && post.category && <p className={styles.cardCategory}>{post.category}</p>}
            {loc && <p className={styles.cardLocation}><MapPin size={13} aria-hidden="true" />{loc}</p>}
            <h2>{post.title}</h2>
            {post.excerpt && <p className={styles.featuredExcerpt}>{post.excerpt}</p>}
            <span className={styles.readMore}>Read the guide <ArrowRight size={17} /></span>
          </div>
        </article>
      </Link>
    </div>
  )
}

function PostCard({ post, index }: { post: PostItem; index: number }) {
  const { ref, visible } = useReveal()
  const loc = locationLabel(post)

  return (
    <div ref={ref}
      className={`${styles.postReveal} ${visible ? styles.postRevealVisible : ''}`}
      style={{ transitionDelay: visible ? `${index * 0.06}s` : '0s' }}>
      <Link href={`/blog/${post.slug}`} className={styles.postLink}>
        <article className={styles.postCard}>
          <div className={styles.postImage}>
            {post.featuredImage
              ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.featuredImage} alt={post.title}
                  className={styles.lazyImg} loading="lazy"
                  onLoad={e => (e.currentTarget as HTMLImageElement).classList.add(styles.lazyImgLoaded)} />
              )
              : <div className={styles.imgBlank} />
            }
            {post.showCategory && post.category && (
              <span className={styles.categoryBadge}>{post.category}</span>
            )}
          </div>
          <div className={styles.postBody}>
            {loc && <p className={styles.cardLocation}><MapPin size={13} aria-hidden="true" />{loc}</p>}
            <h2>{post.title}</h2>
            {post.excerpt && <p className={styles.postExcerpt}>{post.excerpt}</p>}
            <span className={styles.readMore}>Read the guide <ArrowRight size={16} /></span>
          </div>
        </article>
      </Link>
    </div>
  )
}

export default function BlogClientPage({
  posts,
  categories,
  featured,
  rest,
}: {
  posts: PostItem[]
  categories: string[]
  featured: PostItem | null
  rest: PostItem[]
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const isFiltering = activeCategory !== null
  const filteredPosts = isFiltering ? posts.filter(p => p.category === activeCategory) : null
  const filteredFeatured = isFiltering
    ? (filteredPosts!.find(p => p.isFeatured) ?? filteredPosts![0] ?? null)
    : featured
  const filteredRest = isFiltering
    ? filteredPosts!.filter(p => p.id !== filteredFeatured?.id).slice(0, 11)
    : rest

  const isEmpty = isFiltering && !filteredFeatured && filteredRest.length === 0

  return (
    <div className={styles.listContent}>

      {/* ── Category Filter Bar ── */}
      {categories.length > 0 && (
        <div className={styles.catSection}>
          <div className={styles.catScrollArea}>
            {/* All button */}
            <button
              className={`${styles.catBtn} ${!activeCategory ? styles.catBtnActive : ''}`}
              onClick={() => setActiveCategory(null)}
            >
              <LayoutGrid size={13} />
              All
            </button>

            {/* Category buttons */}
            {categories.map(cat => {
              const count = posts.filter(p => p.category === cat).length
              return (
                <button
                  key={cat}
                  className={`${styles.catBtn} ${activeCategory === cat ? styles.catBtnActive : ''}`}
                  onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                >
                  {cat}
                  {count > 0 && (
                    <span className={`${styles.catCount} ${activeCategory === cat ? styles.catCountActive : ''}`}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Empty category state ── */}
      {isEmpty && (
        <div className={styles.emptyCategory}>
          <div className={styles.emptyCategoryIcon}>📂</div>
          <h3>No posts in &ldquo;{activeCategory}&rdquo; yet</h3>
          <p>Articles for this category are coming soon.</p>
          <button className={styles.catClearBtn} onClick={() => setActiveCategory(null)}>
            View all posts
          </button>
        </div>
      )}

      {/* ── Featured Post ── */}
      {!isEmpty && filteredFeatured && <FeaturedCard post={filteredFeatured} />}

      {/* ── Post Grid ── */}
      {!isEmpty && filteredRest.length > 0 && (
        <div className={styles.postGrid}>
          {filteredRest.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
