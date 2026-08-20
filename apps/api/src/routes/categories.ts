import type { FastifyInstance } from 'fastify'
import { supabase } from '../lib/supabase'
import { requireOrganizer } from '../lib/admin'

export async function categoriesRoutes(app: FastifyInstance) {
  app.post<{ Params: { code: string } }>('/events/:code/categories', async (request, reply) => {
    const { code } = request.params
    const event = await requireOrganizer(request, code)
    const body = request.body as { name?: string; description?: string; nameEn?: string; descriptionEn?: string; imageUrl?: string }

    if (!body?.name?.trim()) {
      return reply.status(400).send({ error: 'name is required' })
    }

    const { data: existing } = await supabase
      .from('categories')
      .select('position')
      .eq('event_id', event.id)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle()

    const position = existing ? (existing.position as number) + 1 : 0

    const { data, error } = await supabase
      .from('categories')
      .insert({
        event_id: event.id,
        name: body.name.trim(),
        description: body.description?.trim() ?? null,
        name_en: body.nameEn?.trim() ?? null,
        description_en: body.descriptionEn?.trim() ?? null,
        image_url: body.imageUrl?.trim() ?? null,
        position,
      })
      .select()
      .single()

    if (error || !data) {
      request.log.error(error)
      return reply.status(500).send({ error: 'Failed to add category' })
    }

    return reply.status(201).send(data)
  })

  app.delete<{ Params: { code: string; id: string } }>('/events/:code/categories/:id', async (request, reply) => {
    const { code, id } = request.params
    const event = await requireOrganizer(request, code)

    await supabase.from('categories').delete().eq('id', id).eq('event_id', event.id)
    return reply.status(204).send()
  })
}
