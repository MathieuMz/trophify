'use client'

import type { Participant } from '@/lib/types'
import { Avatar } from './SetupView'

interface Props {
  participants: Participant[]
  onSelect: (p: Participant) => void
}

export default function ParticipantPicker({ participants, onSelect }: Props) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold">Qui es-tu ?</h2>
        <p className="text-gray-500 text-sm">Sélectionne ton nom pour voter</p>
      </div>

      <ul className="space-y-2">
        {participants.map((p) => (
          <li key={p.id}>
            <button
              onClick={() => onSelect(p)}
              className="w-full flex items-center gap-3 bg-white hover:bg-blue-50 border border-gray-100 hover:border-blue-200 rounded-xl px-4 py-3 transition-colors text-left"
            >
              <Avatar participant={p} size={40} />
              <span className="font-medium">{p.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
