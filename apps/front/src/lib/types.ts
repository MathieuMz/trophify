export type EventPhase = 'setup' | 'voting' | 'revealed'

export interface TrophifyEvent {
  id: string
  name: string
  code: string
  phase: EventPhase
}

export interface Participant {
  id: string
  name: string
  image_url: string | null
}

export interface Category {
  id: string
  name: string
  description: string | null
  position: number
  name_en: string | null
  description_en: string | null
  image_url: string | null
}

export interface TopCandidate extends Participant {
  votes: number
}

export interface CategoryResult {
  categoryId: string
  top: TopCandidate[]
}

export interface EventData {
  event: TrophifyEvent
  participants: Participant[]
  categories: Category[]
  results?: CategoryResult[]
}
