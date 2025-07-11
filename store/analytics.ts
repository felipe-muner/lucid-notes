import { create } from 'zustand'
import { AnalyticsData, Note } from '@/types'
import { startOfWeek, format, subDays, subWeeks } from 'date-fns'

interface AnalyticsStore {
  aiUsageCount: number
  aiFeatureUsage: {
    summarize: number
    autoTitle: number
    generate: number
  }

  incrementAIUsage: (feature: 'summarize' | 'autoTitle' | 'generate') => void
  resetAnalytics: () => void
  getAnalyticsData: (notes: Note[]) => AnalyticsData
}

export const useAnalyticsStore = create<AnalyticsStore>((set, get) => ({
  aiUsageCount: 0,
  aiFeatureUsage: {
    summarize: 0,
    autoTitle: 0,
    generate: 0
  },

  incrementAIUsage: (feature) => set((state) => ({
    aiUsageCount: state.aiUsageCount + 1,
    aiFeatureUsage: {
      ...state.aiFeatureUsage,
      [feature]: state.aiFeatureUsage[feature] + 1
    }
  })),

  resetAnalytics: () => set({
    aiUsageCount: 0,
    aiFeatureUsage: {
      summarize: 0,
      autoTitle: 0,
      generate: 0
    }
  }),

  getAnalyticsData: (notes: Note[]): AnalyticsData => {
    const { aiUsageCount, aiFeatureUsage } = get()
    const now = new Date()
    const weekStart = startOfWeek(now)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const notesThisWeek = notes.filter(note => 
      new Date(note.createdAt) >= weekStart
    ).length

    const notesThisMonth = notes.filter(note => 
      new Date(note.createdAt) >= monthStart
    ).length

    const dailyNoteCount = []
    for (let i = 6; i >= 0; i--) {
      const date = subDays(now, i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const count = notes.filter(note => 
        format(new Date(note.createdAt), 'yyyy-MM-dd') === dateStr
      ).length
      dailyNoteCount.push({ date: format(date, 'MMM dd'), count })
    }

    const weeklyNoteCount = []
    for (let i = 3; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(now, i))
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      
      const count = notes.filter(note => {
        const noteDate = new Date(note.createdAt)
        return noteDate >= weekStart && noteDate <= weekEnd
      }).length
      
      weeklyNoteCount.push({ 
        week: format(weekStart, 'MMM dd'), 
        count 
      })
    }

    const tagCounts: { [key: string]: number } = {}
    notes.forEach(note => {
      note.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })

    const tagPopularity = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return {
      totalNotes: notes.length,
      notesThisWeek,
      notesThisMonth,
      aiUsageCount,
      dailyNoteCount,
      weeklyNoteCount,
      tagPopularity,
      aiFeatureUsage
    }
  }
}))
