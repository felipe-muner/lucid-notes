export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateNoteRequest {
  title: string
  content: string
  tags: string[]
}

export interface UpdateNoteRequest {
  title?: string
  content?: string
  tags?: string[]
}

export interface Tag {
  name: string
  count: number
  color?: string
}

export interface AnalyticsData {
  totalNotes: number
  notesThisWeek: number
  notesThisMonth: number
  aiUsageCount: number
  dailyNoteCount: { date: string; count: number }[]
  weeklyNoteCount: { week: string; count: number }[]
  tagPopularity: Tag[]
  aiFeatureUsage: {
    summarize: number
    autoTitle: number
    generate: number
  }
}

export interface AIResponse {
  success: boolean
  result?: string
  error?: string
}

export interface SearchFilters {
  query: string
  tags: string[]
  sortBy: 'createdAt' | 'updatedAt' | 'title'
  sortOrder: 'asc' | 'desc'
}

export type Theme = 'light' | 'dark' | 'system'

export interface AppSettings {
  theme: Theme
  aiEnabled: boolean
  autoSave: boolean
}