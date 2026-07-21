'use client'

import type { Category, Participant, CategoryResult } from '@/lib/types'
import { Avatar } from './SetupView'

interface Props {
  categories: Category[]
  participants: Participant[]
  results: CategoryResult[]
}

const MEDALS = ['🥇', '🥈', '🥉']

export default function ResultsView({ categories, results }: Props) {
  const resultsByCategory = Object.fromEntries(results.map((r) => [r.categoryId, r]))

  return (
    <div className="space-y-8">
      <div className="text-center space-y-1">
        <p className="text-3xl">🏆</p>
        <h2 className="text-xl font-bold">Résultats</h2>
      </div>

      {categories.map((cat) => {
        const result = resultsByCategory[cat.id]
        const top = result?.top ?? []
        const winner = top[0]

        return (
          <div key={cat.id} className="space-y-3">
            <h3 className="font-semibold text-gray-700">{cat.name}</h3>

            {top.length === 0 ? (
              <p className="text-sm text-gray-400">Aucun vote pour cette catégorie</p>
            ) : (
              <div className="space-y-2">
                {winner && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-4 flex items-center gap-4">
                    <span className="text-3xl">🏆</span>
                    <Avatar participant={winner} size={48} />
                    <div className="flex-1">
                      <p className="font-bold text-lg">{winner.name}</p>
                      <p className="text-xs text-yellow-700">{winner.votes} vote{winner.votes > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                )}

                {top.slice(1).map((candidate, idx) => (
                  <div
                    key={candidate.id}
                    className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3"
                  >
                    <span className="text-xl w-8 text-center">{MEDALS[idx + 1]}</span>
                    <Avatar participant={candidate} size={36} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{candidate.name}</p>
                      <p className="text-xs text-gray-400">{candidate.votes} vote{candidate.votes > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
