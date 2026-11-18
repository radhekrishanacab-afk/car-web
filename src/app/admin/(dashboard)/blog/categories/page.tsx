import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Tags } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import BlogCategoryManager from '@/components/admin/BlogCategoryManager'

export const metadata: Metadata = { title: 'Blog Categories' }

export default async function BlogCategoriesPage() {
  const categories = await prisma.blogCategory.findMany({
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
  })

  // Post count per category name
  const postCounts: Record<string, number> = {}
  const postsByCat = await prisma.blogPost.groupBy({
    by: ['category'],
    where: { status: 'PUBLISHED', category: { not: null } },
    _count: { _all: true },
  })
  for (const row of postsByCat) {
    if (row.category) postCounts[row.category] = row._count._all
  }

  // Legacy categories from posts not in BlogCategory table
  const legacyPosts = await prisma.blogPost.findMany({
    select: { category: true },
    where: { AND: [{ category: { not: null } }, { category: { not: '' } }] },
    distinct: ['category'],
  })
  const managedNames = new Set(categories.map(c => c.name.toLowerCase()))
  const legacy = legacyPosts
    .map(p => p.category)
    .filter((c): c is string => !!c && !managedNames.has(c.toLowerCase()))

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/blog" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Blog Posts
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Blog Categories</h1>
      </div>

      <p className="text-gray-500 text-sm mb-6 flex items-center gap-2">
        <Tags className="w-4 h-4" />
        Manage blog categories. Set order and visibility on the public blog page.
      </p>

      <BlogCategoryManager
        initialCategories={categories}
        legacyCategories={legacy}
        postCounts={postCounts}
      />
    </div>
  )
}
