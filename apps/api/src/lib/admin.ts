import type { FastifyRequest } from 'fastify'
import { supabase } from './supabase'

export async function requireOrganizer(request: FastifyRequest, code: string) {
  const token = request.headers['x-organizer-token']
  if (!token || typeof token !== 'string') {
    throw { statusCode: 403, message: 'Missing organizer token' }
  }

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('code', code)
    .eq('organizer_token', token)
    .maybeSingle()

  if (!event) {
    throw { statusCode: 403, message: 'Invalid organizer token' }
  }

  return event
}
