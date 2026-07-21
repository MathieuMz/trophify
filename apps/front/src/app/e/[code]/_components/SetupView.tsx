'use client'

import { useState } from 'react'
import {
  addParticipant,
  deleteParticipant,
  addCategory,
  deleteCategory,
  setPhase,
} from '@/lib/api'
import type { TrophifyEvent, Participant, Category } from '@/lib/types'

type SetupStep = 'participants' | 'categories'

interface Props {
  code: string
  event: TrophifyEvent
  participants: Participant[]
  categories: Category[]
  organizerToken: string | null
  onRefresh: () => void
}

export default function SetupView({ code, event, participants, categories, organizerToken, onRefresh }: Props) {
  const [step, setStep] = useState<SetupStep>('participants')

  if (!organizerToken) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-4xl">⏳</p>
        <p className="text-lg font-medium">En attente de l&apos;organisateur</p>
        <p className="text-gray-500 text-sm">Les votes n&apos;ont pas encore été ouverts.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <StepTabs step={step} onStep={setStep} />

      {step === 'participants' && (
        <ParticipantsSection
          code={code}
          participants={participants}
          token={organizerToken}
          onRefresh={onRefresh}
          onNext={() => setStep('categories')}
        />
      )}

      {step === 'categories' && (
        <CategoriesSection
          code={code}
          event={event}
          participants={participants}
          categories={categories}
          token={organizerToken}
          onRefresh={onRefresh}
          onBack={() => setStep('participants')}
        />
      )}
    </div>
  )
}

function StepTabs({ step, onStep }: { step: SetupStep; onStep: (s: SetupStep) => void }) {
  return (
    <div className="flex rounded-xl border border-gray-200 overflow-hidden text-sm font-medium">
      <button
        onClick={() => onStep('participants')}
        className={`flex-1 py-2.5 transition-colors ${
          step === 'participants'
            ? 'bg-gray-900 text-white'
            : 'bg-white text-gray-500 hover:bg-gray-50'
        }`}
      >
        1 · Participants
      </button>
      <button
        onClick={() => onStep('categories')}
        className={`flex-1 py-2.5 transition-colors border-l border-gray-200 ${
          step === 'categories'
            ? 'bg-gray-900 text-white'
            : 'bg-white text-gray-500 hover:bg-gray-50'
        }`}
      >
        2 · Catégories
      </button>
    </div>
  )
}

function ParticipantsSection({
  code, participants, token, onRefresh, onNext,
}: {
  code: string
  participants: Participant[]
  token: string
  onRefresh: () => void
  onNext: () => void
}) {
  const [name, setName] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      await addParticipant(code, { name: name.trim(), imageUrl: imageUrl.trim() || undefined }, token)
      setName('')
      setImageUrl('')
      onRefresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    await deleteParticipant(code, id, token)
    onRefresh()
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {participants.map((p) => (
          <li key={p.id} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100">
            <Avatar participant={p} size={32} />
            <span className="flex-1 text-sm font-medium">{p.name}</span>
            <button
              onClick={() => handleDelete(p.id)}
              className="text-gray-300 hover:text-red-500 transition-colors text-xs"
            >
              ✕
            </button>
          </li>
        ))}
        {participants.length === 0 && (
          <li className="text-sm text-gray-400 py-2">Aucun participant pour l&apos;instant</li>
        )}
      </ul>

      <form onSubmit={handleAdd} className="space-y-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom du participant"
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="URL de photo (optionnel)"
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="bg-gray-800 hover:bg-gray-900 disabled:opacity-40 text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-colors"
        >
          + Ajouter
        </button>
      </form>

      <div className="pt-2 border-t border-gray-100">
        <button
          onClick={onNext}
          disabled={participants.length < 2}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
        >
          Suivant — Catégories →
        </button>
        {participants.length < 2 && (
          <p className="text-xs text-gray-400 text-center mt-2">Ajoutez au moins 2 participants</p>
        )}
      </div>
    </div>
  )
}

function CategoriesSection({
  code, event, participants, categories, token, onRefresh, onBack,
}: {
  code: string
  event: TrophifyEvent
  participants: Participant[]
  categories: Category[]
  token: string
  onRefresh: () => void
  onBack: () => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [openLoading, setOpenLoading] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      await addCategory(code, { name: name.trim(), description: description.trim() || undefined }, token)
      setName('')
      setDescription('')
      onRefresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    await deleteCategory(code, id, token)
    onRefresh()
  }

  async function handleOpen() {
    setOpenLoading(true)
    try {
      await setPhase(code, 'voting', token)
      onRefresh()
    } finally {
      setOpenLoading(false)
    }
  }

  const canOpen = participants.length >= 2 && categories.length >= 1

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100">
            <span className="flex-1">
              <span className="text-sm font-medium">{c.name}</span>
              {c.description && <span className="text-xs text-gray-400 ml-2">{c.description}</span>}
            </span>
            <button
              onClick={() => handleDelete(c.id)}
              className="text-gray-300 hover:text-red-500 transition-colors text-xs"
            >
              ✕
            </button>
          </li>
        ))}
        {categories.length === 0 && (
          <li className="text-sm text-gray-400 py-2">Aucune catégorie pour l&apos;instant</li>
        )}
      </ul>

      <form onSubmit={handleAdd} className="space-y-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom de la catégorie"
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optionnel)"
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="bg-gray-800 hover:bg-gray-900 disabled:opacity-40 text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-colors"
        >
          + Ajouter
        </button>
      </form>

      <div className="pt-2 border-t border-gray-100 space-y-2">
        <button
          onClick={handleOpen}
          disabled={!canOpen || openLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
        >
          {openLoading ? 'Ouverture…' : '🗳️ Ouvrir le vote'}
        </button>
        {!canOpen && (
          <p className="text-xs text-gray-400 text-center">Ajoutez au moins 1 catégorie</p>
        )}
        <button
          onClick={onBack}
          className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors"
        >
          ← Retour aux participants
        </button>
      </div>
    </div>
  )
}

export function Avatar({ participant, size = 40 }: { participant: Participant; size?: number }) {
  if (participant.image_url) {
    return (
      <img
        src={participant.image_url}
        alt={participant.name}
        width={size}
        height={size}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
        onError={(e) => {
          e.currentTarget.style.display = 'none'
        }}
      />
    )
  }

  const initials = participant.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div
      className="rounded-full bg-blue-100 text-blue-600 font-semibold flex items-center justify-center flex-shrink-0 text-xs"
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  )
}
