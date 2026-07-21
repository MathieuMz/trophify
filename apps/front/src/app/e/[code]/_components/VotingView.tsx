'use client'

import { useEffect, useState } from 'react'
import { castVote, getMyVotes, setPhase } from '@/lib/api'
import type { Participant, Category } from '@/lib/types'
import { Avatar } from './SetupView'

interface Props {
  code: string
  participants: Participant[]
  categories: Category[]
  voter: Participant
  organizerToken: string | null
  onRefresh: () => void
}

export default function VotingView({ code, participants, categories, voter, organizerToken, onRefresh }: Props) {
  const [votes, setVotes] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [revealLoading, setRevealLoading] = useState(false)

  const candidates = participants.filter((p) => p.id !== voter.id)

  useEffect(() => {
    getMyVotes(code, voter.id).then(setVotes).catch(() => {})
  }, [code, voter.id])

  function handleSelect(categoryId: string, candidateId: string) {
    setVotes((prev) => ({ ...prev, [categoryId]: candidateId }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    try {
      await Promise.all(
        Object.entries(votes).map(([categoryId, candidateId]) =>
          castVote(code, categoryId, candidateId, voter.id)
        )
      )
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  async function handleReveal() {
    if (!organizerToken) return
    setRevealLoading(true)
    try {
      await setPhase(code, 'revealed', organizerToken)
      onRefresh()
    } finally {
      setRevealLoading(false)
    }
  }

  const allVoted = categories.every((c) => votes[c.id])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Avatar participant={voter} size={36} />
        <div>
          <p className="font-semibold">{voter.name}</p>
          <p className="text-xs text-gray-400">C&apos;est toi qui votes</p>
        </div>
      </div>

      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50">
              <h3 className="font-semibold">{cat.name}</h3>
              {cat.description && <p className="text-xs text-gray-400 mt-0.5">{cat.description}</p>}
            </div>
            <div className="divide-y divide-gray-50">
              {candidates.map((c) => {
                const selected = votes[cat.id] === c.id
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelect(cat.id, c.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                      selected ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                        selected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                      }`}
                    >
                      {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <Avatar participant={c} size={32} />
                    <span className={`text-sm font-medium ${selected ? 'text-blue-700' : ''}`}>{c.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {saved && (
          <p className="text-center text-sm text-green-600 font-medium">✓ Votes enregistrés</p>
        )}
        <button
          onClick={handleSave}
          disabled={saving || !allVoted}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
        >
          {saving ? 'Enregistrement…' : `Envoyer mes votes (${Object.keys(votes).length}/${categories.length})`}
        </button>
      </div>

      {organizerToken && (
        <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Zone organisateur</p>
          <button
            onClick={handleReveal}
            disabled={revealLoading}
            className="w-full bg-gray-900 hover:bg-black disabled:opacity-40 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            {revealLoading ? 'Révélation…' : '🎉 Révéler les résultats'}
          </button>
        </div>
      )}
    </div>
  )
}
