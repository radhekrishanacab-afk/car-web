import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Plus, FileText, Eye, EyeOff } from 'lucide-react'
import DeleteBlogPost from '@/components/admin/DeleteBlogPost'

export const metadata: Metadata = { title: 'Blog Posts' }

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>
}

export default async function BlogAdminPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const page   = Math.max(1, parseInt(sp.page ?? '1'))
  const search = sp.search ?? ''
  const status = sp.status ?? ''
  const perPage = 20

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (search) where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { category: { contains: search, mode: 'insensitive' } }]

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page-1)*perPage, take: perPage }),
    prisma.blogPost.count({ where }),
  ])
  const pages = Math.ceil(total / perPage)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} total</p>
        </div>
        <Link href="/admin/blog/new"
          className="flex items-center gap-2 bg-[#0a1628] hover:bg-[#1a3a6b] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Post
        </Link>
      </div>

      {/* Filters */}
      <form className="flex flex-wrap gap-3 mb-6">
        <input type="text" name="search" defaultValue={search} placeholder="Search posts…"
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a1628] w-56" />
        <select name="status" defaultValue={status}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a1628]">
          <option value="">All Status</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-[#0a1628] text-white rounded-lg text-sm font-medium hover:bg-[#1a3a6b]">Search</button>
        {(search || status) && <Link href="/admin/blog" className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Clear</Link>}
      </form>

      {posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400">
          <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">{search ? `No posts matching "${search}"` : 'No blog posts yet.'}</p>
          <p className="text-sm mt-1"><Link href="/admin/blog/new" className="text-blue-600 hover:underline">Write your first post</Link></p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium text-gray-500">Title</th>
                <th className="px-4 py-3 font-medium text-gray-500">Category</th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500">Featured</th>
                <th className="px-4 py-3 font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 max-w-xs truncate">{p.title}</div>
                    <div className="text-xs text-gray-400 font-mono">{p.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{p.category ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.isFeatured ? <Eye className="w-4 h-4 text-amber-500" /> : <EyeOff className="w-4 h-4 text-gray-300" />}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/blog/${p.id}/edit`} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Edit</Link>
                      {p.status === 'PUBLISHED' && <Link href={`/blog/${p.slug}`} target="_blank" className="text-xs text-green-600 hover:text-green-800 font-medium">View</Link>}
                      <DeleteBlogPost id={p.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">Page {page} of {pages}</p>
          <div className="flex gap-2">
            {page > 1 && <Link href={`/admin/blog?page=${page-1}&search=${search}&status=${status}`} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">← Prev</Link>}
            {page < pages && <Link href={`/admin/blog?page=${page+1}&search=${search}&status=${status}`} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Next →</Link>}
          </div>
        </div>
      )}
    </div>
  )
}
