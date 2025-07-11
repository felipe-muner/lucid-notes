'use client'

import { useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { FileText, Tag, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useNotesStore } from '@/store/notes'
import { Note } from '@/types'

export function NotesList() {
  const { 
    notes,
    isLoading,
    error,
    selectedNoteId,
    setSelectedNoteId,
    getFilteredNotes,
    setNotes,
    setLoading,
    setError
  } = useNotesStore()

  useEffect(() => {
    const loadNotes = async () => {
      if (notes.length > 0) return
      
      setLoading(true)
      try {
        const response = await fetch('/api/notes')
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load notes')
        }
        
        setNotes(data.notes)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load notes')
      } finally {
        setLoading(false)
      }
    }

    loadNotes()
  }, [notes.length, setNotes, setLoading, setError])

  const filteredNotes = getFilteredNotes()

  const handleNoteSelect = (note: Note) => {
    setSelectedNoteId(note.id)
  }

  const truncateContent = (content: string, maxLength = 100) => {
    if (content.length <= maxLength) return content
    return content.slice(0, maxLength) + '...'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading notes...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-destructive text-sm">
          Error: {error}
        </div>
      </div>
    )
  }

  if (filteredNotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No notes found</h3>
        <p className="text-muted-foreground text-sm">
          {notes.length === 0 
            ? "Create your first note to get started"
            : "Try adjusting your search or filters"
          }
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2 p-4">
      {filteredNotes.map((note) => (
        <div
          key={note.id}
          onClick={() => handleNoteSelect(note)}
          className={`
            p-3 rounded-lg border cursor-pointer transition-all
            hover:bg-accent/50
            ${selectedNoteId === note.id 
              ? 'bg-accent border-primary' 
              : 'bg-card border-border'
            }
          `}
        >
          <h3 className="font-medium text-sm mb-2 line-clamp-1">
            {note.title}
          </h3>

          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {truncateContent(note.content)}
          </p>

          <div className="flex flex-wrap gap-1 mb-2">
            {note.tags.slice(0, 3).map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-xs px-1.5 py-0.5"
              >
                <Tag className="h-2.5 w-2.5 mr-1" />
                {tag}
              </Badge>
            ))}
            {note.tags.length > 3 && (
              <Badge 
                variant="outline" 
                className="text-xs px-1.5 py-0.5"
              >
                +{note.tags.length - 3}
              </Badge>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
          </div>
        </div>
      ))}
    </div>
  )
}
