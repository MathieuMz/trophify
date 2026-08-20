import type { EventData, Participant, Category } from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL!

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const { headers: extraHeaders, ...rest } = init ?? {}
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? 'API error')
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export function createEvent(name: string): Promise<{ event: { id: string; name: string; code: string; phase: string }; organizerToken: string; code: string }> {
  return json('/events', { method: 'POST', body: JSON.stringify({ name }) })
}

export function getEvent(code: string): Promise<EventData> {
  return json(`/events/${code}`)
}

export function addParticipant(
  code: string,
  data: { name: string; imageUrl?: string },
  organizerToken: string
): Promise<Participant> {
  return json(`/events/${code}/participants`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'x-organizer-token': organizerToken },
  })
}

export function deleteParticipant(code: string, id: string, organizerToken: string): Promise<void> {
  return json(`/events/${code}/participants/${id}`, {
    method: 'DELETE',
    headers: { 'x-organizer-token': organizerToken },
  })
}

export function addCategory(
  code: string,
  data: { name: string; description?: string; nameEn?: string; descriptionEn?: string; imageUrl?: string },
  organizerToken: string
): Promise<Category> {
  return json(`/events/${code}/categories`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'x-organizer-token': organizerToken },
  })
}

export function deleteCategory(code: string, id: string, organizerToken: string): Promise<void> {
  return json(`/events/${code}/categories/${id}`, {
    method: 'DELETE',
    headers: { 'x-organizer-token': organizerToken },
  })
}

export function setPhase(code: string, phase: 'voting' | 'revealed', organizerToken: string): Promise<{ phase: string }> {
  return json(`/events/${code}/phase`, {
    method: 'PATCH',
    body: JSON.stringify({ phase }),
    headers: { 'x-organizer-token': organizerToken },
  })
}

export function castVote(
  code: string,
  categoryId: string,
  candidateId: string,
  voterId: string
): Promise<{ ok: boolean }> {
  return json(`/events/${code}/votes`, {
    method: 'POST',
    body: JSON.stringify({ categoryId, candidateId, voterId }),
  })
}

export function getMyVotes(code: string, voterId: string): Promise<Record<string, string>> {
  return json(`/events/${code}/votes/mine?voterId=${voterId}`)
}
