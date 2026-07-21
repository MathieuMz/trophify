import type { FastifyInstance } from 'fastify'
import { supabase } from '../lib/supabase'
import { generateUniqueCode } from '../lib/code'
import { requireOrganizer } from '../lib/admin'

export async function eventsRoutes(app: FastifyInstance) {
  app.post('/events', async (request, reply) => {
    const body = request.body as { name?: string }
    if (!body?.name?.trim()) {
      return reply.status(400).send({ error: 'name is required' })
    }

    const code = await generateUniqueCode()

    const { data: event, error } = await supabase
      .from('events')
      .insert({ name: body.name.trim(), code })
      .select()
      .single()

    if (error || !event) {
      request.log.error({ supabaseError: error }, 'Failed to create event')
      return reply.status(500).send({ error: 'Failed to create event', detail: error?.message })
    }

    return reply.status(201).send({
      event: { id: event.id, name: event.name, code: event.code, phase: event.phase },
      organizerToken: event.organizer_token,
      code: event.code,
    })
  })

  app.get<{ Params: { code: string } }>('/events/:code', async (request, reply) => {
    const { code } = request.params

    const { data: event } = await supabase
      .from('events')
      .select('*')
      .eq('code', code)
      .maybeSingle()

    if (!event) return reply.status(404).send({ error: 'Event not found' })

    const [{ data: participants }, { data: categories }] = await Promise.all([
      supabase.from('participants').select('*').eq('event_id', event.id).order('created_at'),
      supabase.from('categories').select('*').eq('event_id', event.id).order('position').order('created_at'),
    ])

    const payload: Record<string, unknown> = {
      event: { id: event.id, name: event.name, code: event.code, phase: event.phase },
      participants: participants ?? [],
      categories: categories ?? [],
    }

    if (event.phase === 'revealed') {
      const cats = categories ?? []
      const participantMap = Object.fromEntries(
        (participants ?? []).map((p: { id: string; name: string; image_url?: string | null }) => [p.id, p])
      )

      const results = await Promise.all(
        cats.map(async (cat) => {
          const { data: rows } = await supabase
            .from('votes')
            .select('candidate_id')
            .eq('category_id', cat.id)

          const counts: Record<string, number> = {}
          for (const row of rows ?? []) {
            counts[row.candidate_id] = (counts[row.candidate_id] ?? 0) + 1
          }

          const top = Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([id, votes]) => ({ ...participantMap[id], votes }))

          return { categoryId: cat.id, top }
        })
      )
      payload.results = results
    }

    return payload
  })

  app.patch<{ Params: { code: string } }>('/events/:code/phase', async (request, reply) => {
    const { code } = request.params
    const event = await requireOrganizer(request, code)
    const body = request.body as { phase?: string }

    const transitions: Record<string, string> = { setup: 'voting', voting: 'revealed' }
    const next = body?.phase
    if (!next || transitions[event.phase] !== next) {
      return reply.status(400).send({ error: `Invalid phase transition: ${event.phase} → ${next}` })
    }

    await supabase.from('events').update({ phase: next }).eq('id', event.id)
    return { phase: next }
  })
}
