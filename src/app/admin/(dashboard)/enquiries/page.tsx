import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import EnquiryActions from '@/components/admin/EnquiryActions'
import { Mail } from 'lucide-react'

export const metadata: Metadata = { title: 'Enquiries' }

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string; unread?: string }>
}

export default async function EnquiriesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1'))
  const search = params.search ?? ''
  const unreadOnly = params.unread === 'true'
  const perPage = 20

  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { message: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (unreadOnly) where.isRead = false

  const [enquiries, total, unreadCount] = await Promise.all([
    prisma.contactEnquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.contactEnquiry.count({ where }),
    prisma.contactEnquiry.count({ where: { isRead: false } }),
  ])

  const pages = Math.ceil(total / perPage)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Enquiries</h1>
          <p className="text-gray-500 text-sm mt-1">
            {total} total · {unreadCount} unread
          </p>
        </div>
      </div>

      <form className="flex flex-wrap gap-3 mb-6">
        <input type="text" name="search" defaultValue={search}
          placeholder="Search name, phone, email…"
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a1628] w-64" />
        <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer hover:bg-gray-50">
          <input type="checkbox" name="unread" value="true" defaultChecked={unreadOnly}
            className="w-3.5 h-3.5 text-[#0a1628] rounded border-gray-300" />
          Unread only
        </label>
        <button type="submit" className="px-4 py-2 bg-[#0a1628] text-white rounded-lg text-sm font-medium hover:bg-[#1a3a6b] transition-colors">Filter</button>
        {(search || unreadOnly) && <Link href="/admin/enquiries" className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Clear</Link>}
      </form>

      {enquiries.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400">
          <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
          {search || unreadOnly ? 'No matching enquiries.' : 'No enquiries yet.'}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium text-gray-500">Sender</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Subject</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Message</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Date</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((q) => (
                  <tr key={q.id} className={`border-b border-gray-50 hover:bg-gray-50 ${!q.isRead ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{q.name}</div>
                      <a href={`tel:${q.phone}`} className="text-xs text-[#1a3a6b] hover:text-[#f59e0b]">{q.phone}</a>
                      {q.email && <div className="text-xs text-gray-400">{q.email}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-xs">{q.subject ?? '—'}</td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-xs text-gray-600 line-clamp-2">{q.message}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(q.createdAt).toLocaleDateString('en-IN')}
                      <div className="text-gray-400">{new Date(q.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${!q.isRead ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                        {q.isRead ? 'Read' : 'New'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <EnquiryActions enquiryId={q.id} isRead={q.isRead} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">Page {page} of {pages}</p>
          <div className="flex gap-2">
            {page > 1 && <Link href={`/admin/enquiries?page=${page - 1}&search=${search}${unreadOnly ? '&unread=true' : ''}`} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">← Prev</Link>}
            {page < pages && <Link href={`/admin/enquiries?page=${page + 1}&search=${search}${unreadOnly ? '&unread=true' : ''}`} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Next →</Link>}
          </div>
        </div>
      )}
    </div>
  )
}
