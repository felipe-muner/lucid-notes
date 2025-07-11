import { create } from 'zustand'
import { Note, CreateNoteRequest, UpdateNoteRequest, SearchFilters } from '@/types'

interface NotesStore {
  notes: Note[]
  isLoading: boolean
  error: string | null
  searchFilters: SearchFilters
  selectedNoteId: string | null

  setNotes: (notes: Note[]) => void
  addNote: (note: Note) => void
  updateNote: (id: string, updates: UpdateNoteRequest) => void
  deleteNote: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSearchFilters: (filters: Partial<SearchFilters>) => void
  setSelectedNoteId: (id: string | null) => void

  getFilteredNotes: () => Note[]
  getAllTags: () => string[]
  getSelectedNote: () => Note | null
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  isLoading: false,
  error: null,
  searchFilters: {
    query: '',
    tags: [],
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  },
  selectedNoteId: null,

  setNotes: (notes) => set({ notes }),
  
  addNote: (note) => set((state) => ({ 
    notes: [note, ...state.notes] 
  })),
  
  updateNote: (id, updates) => set((state) => ({
    notes: state.notes.map(note => 
      note.id === id 
        ? { ...note, ...updates, updatedAt: new Date().toISOString() }
        : note
    )
  })),
  
  deleteNote: (id) => set((state) => ({
    notes: state.notes.filter(note => note.id !== id),
    selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId
  })),
  
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  setSearchFilters: (filters) => set((state) => ({
    searchFilters: { ...state.searchFilters, ...filters }
  })),
  
  setSelectedNoteId: (selectedNoteId) => set({ selectedNoteId }),

  getFilteredNotes: () => {
    const { notes, searchFilters } = get()
    let filtered = [...notes]

    if (searchFilters.query) {
      const query = searchFilters.query.toLowerCase()
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    if (searchFilters.tags.length > 0) {
      filtered = filtered.filter(note =>
        searchFilters.tags.every(tag => note.tags.includes(tag))
      )
    }

    filtered.sort((a, b) => {
      const aVal = a[searchFilters.sortBy]
      const bVal = b[searchFilters.sortBy]
      
      if (searchFilters.sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
      }
    })

    return filtered
  },

  getAllTags: () => {
    const { notes } = get()
    const allTags = notes.flatMap(note => note.tags)
    return [...new Set(allTags)].sort()
  },

  getSelectedNote: () => {
    const { notes, selectedNoteId } = get()
    return notes.find(note => note.id === selectedNoteId) || null
  }
}))
