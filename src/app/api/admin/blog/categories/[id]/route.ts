import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Params) {
  if (!await getSession()) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json().catch(() => ({}))

  const name = body.name != null ? String(body.name).trim() : undefined
  const displayOrder = body.displayOrder != null ? parseInt(body.displayOrder) : undefined
  const isActive = body.isActive != null ? Boolean(body.isActive) : undefined

  const data: Record<string, unknown> = {}
  if (name !== undefined) {
    if (!name) return Response.json({ error: 'Category name cannot be empty' }, { status: 400 })
    data.name = name
    data.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').slice(0, 100)
  }
  if (displayOrder !== undefined) data.displayOrder = isNaN(displayOrder) ? 0 : displayOrder
  if (isActive !== undefined) data.isActive = isActive

  if (Object.keys(data).length === 0) {
    return Response.json({ error: 'No fields to update' }, { status: 400 })
  }

  try {
    const category = await prisma.blogCategory.update({
      where: { id: parseInt(id) },
      data,
    })
    return Response.json({ category })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to update category'
    if (msg.includes('Unique constraint')) {
      return Response.json({ error: 'A category with this name already exists' }, { status: 409 })
    }
    return Response.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  if (!await getSession()) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    await prisma.blogCategory.delete({ where: { id: parseInt(id) } })
    return Response.json({ success: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to delete category'
    return Response.json({ error: msg }, { status: 500 })
  }
}
