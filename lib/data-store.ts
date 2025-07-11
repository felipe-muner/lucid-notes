import { Note } from '@/types'

// Shared in-memory data store
let notes: Note[] = []

export const getNotesStore = () => {
  return notes
}

export const setNotesStore = (newNotes: Note[]) => {
  notes = newNotes
}

export const addNoteToStore = (note: Note) => {
  notes.unshift(note)
}

export const updateNoteInStore = (id: string, updates: Partial<Note>) => {
  const index = notes.findIndex(n => n.id === id)
  if (index !== -1) {
    notes[index] = { ...notes[index], ...updates }
    return notes[index]
  }
  return null
}

export const deleteNoteFromStore = (id: string) => {
  const index = notes.findIndex(n => n.id === id)
  if (index !== -1) {
    return notes.splice(index, 1)[0]
  }
  return null
}

export const findNoteInStore = (id: string) => {
  return notes.find(n => n.id === id) || null
}

// Initialize with mock data if empty
export const initializeStore = async () => {
  if (notes.length === 0) {
    try {
      const mockData = await import('@/db.json')
      notes = mockData.notes as Note[]
    } catch (error) {
      console.error('Failed to load mock data:', error)
    }
  }
}
