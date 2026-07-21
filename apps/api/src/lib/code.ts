import { supabase } from './supabase'

const ADJECTIVES = [
  'swift', 'brave', 'calm', 'dark', 'epic', 'fair', 'glad', 'huge',
  'icy', 'jade', 'keen', 'lazy', 'mild', 'neat', 'odd', 'pale',
  'quick', 'rare', 'safe', 'tall', 'vast', 'warm', 'wild', 'zeal',
]

const NOUNS = [
  'bear', 'boat', 'cake', 'deer', 'drum', 'fish', 'frog', 'hawk',
  'jade', 'kite', 'lake', 'lion', 'moon', 'nest', 'oak', 'pine',
  'reef', 'rose', 'sage', 'ship', 'star', 'swan', 'tide', 'wolf',
]

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateSlug(): string {
  const adj = randomItem(ADJECTIVES)
  const noun = randomItem(NOUNS)
  const num = String(Math.floor(Math.random() * 90) + 10)
  return `${adj}-${noun}-${num}`
}

export async function generateUniqueCode(maxAttempts = 5): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const code = generateSlug()
    const { data } = await supabase.from('events').select('id').eq('code', code).maybeSingle()
    if (!data) return code
  }
  throw new Error('Failed to generate a unique event code after max attempts')
}
