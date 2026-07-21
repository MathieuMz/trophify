'use client'

import { useState, useEffect } from 'react'
import type { Participant } from '@/lib/types'

interface EventIdentity {
  participant: Participant | null
  organizerToken: string | null
  setParticipant: (p: Participant | null) => void
  setOrganizerToken: (token: string) => void
  isOrganizer: boolean
  ready: boolean
}

export function useEventIdentity(code: string): EventIdentity {
  const [participant, setParticipantState] = useState<Participant | null>(null)
  const [organizerToken, setOrganizerTokenState] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const storedP = localStorage.getItem(`trophify_participant_${code}`)
      if (storedP) setParticipantState(JSON.parse(storedP))

      const storedT = localStorage.getItem(`trophify_admin_${code}`)
      if (storedT) setOrganizerTokenState(storedT)
    } catch {
      // ignore parse errors
    }
    setReady(true)
  }, [code])

  function setParticipant(p: Participant | null) {
    setParticipantState(p)
    if (p) localStorage.setItem(`trophify_participant_${code}`, JSON.stringify(p))
    else localStorage.removeItem(`trophify_participant_${code}`)
  }

  function setOrganizerToken(token: string) {
    setOrganizerTokenState(token)
    localStorage.setItem(`trophify_admin_${code}`, token)
  }

  return {
    participant,
    organizerToken,
    setParticipant,
    setOrganizerToken,
    isOrganizer: Boolean(organizerToken),
    ready,
  }
}
