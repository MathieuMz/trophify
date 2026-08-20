'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createEvent, addParticipant } from '@/lib/api'

type Draft = { name: string; imageUrl: string }

function DraftAvatar({ name, imageUrl, size = 32 }: { name: string; imageUrl: string; size?: number }) {
  const [imgFailed, setImgFailed] = useState(false)

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (imageUrl && !imgFailed) {
    return (
      <img
        src={imageUrl}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
        onError={() => setImgFailed(true)}
      />
    )
  }

  return (
    <div
      className="rounded-full bg-blue-100 text-blue-600 font-semibold flex items-center justify-center flex-shrink-0 text-xs"
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  )
}

export default function CreatePage() {
  const router = useRouter()
  const [eventName, setEventName] = useState('')
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [inputName, setInputName] = useState('')
  const [inputImageUrl, setInputImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleAddDraft(e: React.FormEvent) {
    e.preventDefault()
    if (!inputName.trim()) return
    setDrafts((prev) => [...prev, { name: inputName.trim(), imageUrl: inputImageUrl.trim() }])
    setInputName('')
    setInputImageUrl('')
  }

  function handleRemoveDraft(idx: number) {
    setDrafts((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!eventName.trim()) return
    setLoading(true)
    setError(null)
    try {
      const result = await createEvent(eventName.trim())
      localStorage.setItem(`trophify_admin_${result.code}`, result.organizerToken)

      for (let i = 0; i < drafts.length; i++) {
        const d = drafts[i]
        const participant = await addParticipant(
          result.code,
          { name: d.name, imageUrl: d.imageUrl || undefined },
          result.organizerToken
        )
        if (i === 0) {
          localStorage.setItem(`trophify_participant_${result.code}`, JSON.stringify(participant))
        }
      }

      router.push(`/e/${result.code}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">← Retour</Link>
          <h1 className="text-2xl font-bold">Créer un événement</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label htmlFor="eventName" className="text-sm font-medium text-gray-700">
              Nom de l&apos;événement
            </label>
            <input
              id="eventName"
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Ex : Awards 2026 — Équipe Produit"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">
              Participants <span className="text-gray-400 font-normal">(optionnel)</span>
            </p>

            {drafts.length > 0 && (
              <ul className="space-y-2">
                {drafts.map((d, idx) => (
                  <li key={idx} className="flex items-center gap-3 bg-white rounded-xl px-4 py-2.5 border border-gray-100">
                    <DraftAvatar name={d.name} imageUrl={d.imageUrl} size={32} />
                    <span className="flex-1 text-sm font-medium">
                      {d.name}
                      {idx === 0 && <span className="ml-2 text-xs text-blue-500 font-normal">vous</span>}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDraft(idx)}
                      className="text-gray-300 hover:text-red-500 transition-colors text-xs"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="space-y-2">
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder={drafts.length === 0 ? 'Votre nom' : 'Nom du participant'}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="url"
                value={inputImageUrl}
                onChange={(e) => setInputImageUrl(e.target.value)}
                placeholder="URL de photo (optionnel)"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddDraft}
                disabled={!inputName.trim()}
                className="bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700 text-sm font-medium py-2 px-4 rounded-xl transition-colors"
              >
                + Ajouter
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading || !eventName.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            {loading ? 'Création…' : 'Créer'}
          </button>
        </form>
      </div>
    </main>
  )
}
