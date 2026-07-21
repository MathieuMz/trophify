import type { FastifyInstance } from 'fastify'
import { supabase } from '../lib/supabase'

export async function votesRoutes(app: FastifyInstance) {
  app.post<{ Params: { code: string } }>('/events/:code/votes', async (request, reply) => {
    const { code } = request.params
    const body = request.body as { categoryId?: string; candidateId?: string; voterId?: string }

    if (!body?.categoryId || !body?.candidateId || !body?.voterId) {
      return reply.status(400).send({ error: 'categoryId, candidateId and voterId are required' })
    }

    const { data: event } = await supabase
      .from('events')
      .select('id, phase')
      .eq('code', code)
      .maybeSingle()

    if (!event) return reply.status(404).send({ error: 'Event not found' })
    if (event.phase !== 'voting') return reply.status(403).send({ error: 'Voting is not open' })

    if (body.voterId === body.candidateId) {
      return reply.status(400).send({ error: 'Cannot vote for yourself' })
    }

    const { error } = await supabase.from('votes').upsert(
      {
        event_id: event.id,
        category_id: body.categoryId,
        voter_id: body.voterId,
        candidate_id: body.candidateId,
      },
      { onConflict: 'category_id,voter_id' }
    )

    if (error) {
      request.log.error(error)
      return reply.status(500).send({ error: 'Failed to cast vote' })
    }

    return reply.status(200).send({ ok: true })
  })

  app.get<{ Params: { code: string }; Querystring: { voterId?: string } }>(
    '/events/:code/votes/mine',
    async (request, reply) => {
      const { code } = request.params
      const { voterId } = request.query

      if (!voterId) return reply.status(400).send({ error: 'voterId is required' })

      const { data: event } = await supabase
        .from('events')
        .select('id')
        .eq('code', code)
        .maybeSingle()

      if (!event) return reply.status(404).send({ error: 'Event not found' })

      const { data: votes } = await supabase
        .from('votes')
        .select('category_id, candidate_id')
        .eq('event_id', event.id)
        .eq('voter_id', voterId)

      const result: Record<string, string> = {}
      for (const v of votes ?? []) {
        result[v.category_id] = v.candidate_id
      }

      return result
    }
  )
}
