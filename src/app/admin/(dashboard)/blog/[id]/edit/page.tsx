import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import BlogPostForm from '@/components/admin/BlogPostForm'

export const metadata: Metadata = { title: 'Edit Blog Post' }

interface PageProps { params: Promise<{ id: string }> }

export default async function EditBlogPostPage({ params }: PageProps) {
  const { id } = await params
  const post = await prisma.blogPost.findUnique({ where: { id: parseInt(id) } }).catch(() => null)
  if (!post) notFound()

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/blog" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Blog Posts
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
      </div>
      <BlogPostForm post={post} />
    </div>
  )
}
