'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { getEvent } from '@/lib/api'
import { useEventIdentity } from '@/hooks/useEventIdentity'
import type { EventData } from '@/lib/types'
import SetupView from './_components/SetupView'
import VotingView from './_components/VotingView'
import ResultsView from './_components/ResultsView'
import ParticipantPicker from './_components/ParticipantPicker'

export default function EventPage() {
  const { code } = useParams<{ code: string }>()
  const identity = useEventIdentity(code)
  const [data, setData] = useState<EventData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const result = await getEvent(code)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue')
    }
  }, [code])

  useEffect(() => {
    refresh()
  }, [refresh])

  if (!identity.ready || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        {error ?? 'Chargement…'}
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    )
  }

  const { event, participants, categories } = data

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg leading-tight">{event.name}</h1>
          <p className="text-xs text-gray-400 mt-0.5">{phaseLabel(event.phase)}</p>
        </div>
        <button
          onClick={() => {
            const url = `${window.location.origin}/e/${event.code}`
            navigator.clipboard.writeText(url)
          }}
          className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors text-gray-600"
        >
          Copier le lien
        </button>
      </header>

      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        {event.phase === 'setup' && (
          <SetupView
            code={code}
            event={event}
            participants={participants}
            categories={categories}
            organizerToken={identity.organizerToken}
            onRefresh={refresh}
            onSetOrganizerToken={identity.setOrganizerToken}
          />
        )}

        {event.phase === 'voting' && (
          <>
            {!identity.participant ? (
              <ParticipantPicker
                participants={participants}
                onSelect={identity.setParticipant}
              />
            ) : (
              <VotingView
                code={code}
                participants={participants}
                categories={categories}
                voter={identity.participant}
                organizerToken={identity.organizerToken}
                onRefresh={refresh}
              />
            )}
          </>
        )}

        {event.phase === 'revealed' && (
          <ResultsView
            categories={categories}
            participants={participants}
            results={data.results ?? []}
          />
        )}
      </main>
    </div>
  )
}

function phaseLabel(phase: string): string {
  if (phase === 'setup') return 'Configuration en cours'
  if (phase === 'voting') return 'Vote ouvert'
  if (phase === 'revealed') return 'Résultats révélés'
  return phase
}
