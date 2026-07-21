import type { FastifyInstance } from 'fastify'
import { supabase } from '../lib/supabase'
import { requireOrganizer } from '../lib/admin'

export async function participantsRoutes(app: FastifyInstance) {
  app.post<{ Params: { code: string } }>('/events/:code/participants', async (request, reply) => {
    const { code } = request.params
    const event = await requireOrganizer(request, code)
    const body = request.body as { name?: string; imageUrl?: string }

    if (!body?.name?.trim()) {
      return reply.status(400).send({ error: 'name is required' })
    }

    const { data, error } = await supabase
      .from('participants')
      .insert({
        event_id: event.id,
        name: body.name.trim(),
        image_url: body.imageUrl?.trim() ?? null,
      })
      .select()
      .single()

    if (error || !data) {
      request.log.error(error)
      return reply.status(500).send({ error: 'Failed to add participant' })
    }

    return reply.status(201).send(data)
  })

  app.delete<{ Params: { code: string; id: string } }>('/events/:code/participants/:id', async (request, reply) => {
    const { code, id } = request.params
    const event = await requireOrganizer(request, code)

    await supabase.from('participants').delete().eq('id', id).eq('event_id', event.id)
    return reply.status(204).send()
  })
}
