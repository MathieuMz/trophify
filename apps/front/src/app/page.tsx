'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LandingPage() {
  const router = useRouter()
  const [input, setInput] = useState('')

  function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    const raw = input.trim()
    if (!raw) return
    // Accept full URL (e.g. http://localhost:3000/e/swift-boat-42) or bare slug
    const match = raw.match(/\/e\/([a-z0-9-]+)\/?$/)
    const code = match ? match[1] : raw
    router.push(`/e/${code}`)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">🏆 Trophify</h1>
          <p className="text-gray-500">Votez pour les awards de votre groupe</p>
        </div>

        <Link
          href="/create"
          className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
        >
          Créer un événement
        </Link>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-gray-50 text-gray-400">ou</span>
          </div>
        </div>

        <form onSubmit={handleJoin} className="space-y-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Coller un lien ou un code"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            Rejoindre
          </button>
        </form>
      </div>
    </main>
  )
}
