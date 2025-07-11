'use client'

import { useState, useEffect } from 'react'
import { Save, Trash2, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useNotesStore } from '@/store/notes'
import { CreateNoteRequest, UpdateNoteRequest } from '@/types'
import { TagInput } from '@/components/notes/tag-input'
import { AIAssistant } from '@/components/ai/ai-assistant'

export function NoteEditor() {
  const {
    selectedNoteId,
    getSelectedNote,
    addNote,
    updateNote,
    deleteNote,
    setSelectedNoteId
  } = useNotesStore()

  const selectedNote = getSelectedNote()
  const isNewNote = !selectedNoteId
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title)
      setContent(selectedNote.content)
      setTags(selectedNote.tags)
    } else {
      setTitle('')
      setContent('')
      setTags([])
    }
    setError(null)
  }, [selectedNote])

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    if (!content.trim()) {
      setError('Content is required')
      return
    }
    if (tags.length === 0) {
      setError('At least one tag is required')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      if (isNewNote) {
        const noteData: CreateNoteRequest = {
          title: title.trim(),
          content: content.trim(),
          tags
        }

        const response = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(noteData)
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Failed to create note')
        }

        addNote(data.note)
        setSelectedNoteId(data.note.id)
      } else {
        const updates: UpdateNoteRequest = {
          title: title.trim(),
          content: content.trim(),
          tags
        }

        const response = await fetch(`/api/notes/${selectedNoteId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Failed to update note')
        }

        updateNote(selectedNoteId, updates)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save note')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedNoteId || !confirm('Are you sure you want to delete this note?')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/notes/${selectedNoteId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete note')
      }

      deleteNote(selectedNoteId)
      setSelectedNoteId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAIResult = (result: string, type: 'title' | 'content') => {
    if (type === 'title') {
      setTitle(result)
    } else {
      setContent(result)
    }
  }

  const hasChanges = selectedNote && (
    selectedNote.title !== title ||
    selectedNote.content !== content ||
    JSON.stringify(selectedNote.tags.sort()) !== JSON.stringify(tags.sort())
  )

  const canSave = title.trim() && content.trim() && tags.length > 0 && 
    (isNewNote || hasChanges)

  if (!isNewNote && !selectedNote) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Select a note to edit</h3>
          <p className="text-muted-foreground">
            Choose a note from the sidebar or create a new one
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {isNewNote ? 'New Note' : 'Edit Note'}
            </h2>
            <div className="flex gap-2">
              {!isNewNote && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              )}
              <Button
                onClick={handleSave}
                disabled={!canSave || isSaving}
                size="sm"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
            </div>
          </div>

          {error && (
            <div className="text-destructive text-sm mb-4 p-2 bg-destructive/10 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium"
            />
            
            <TagInput
              tags={tags}
              onChange={setTags}
              placeholder="Add tags (press Enter or comma to add)"
            />
          </div>
        </div>

        <div className="flex-1 p-4">
          <Textarea
            placeholder="Start writing your note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="h-full resize-none text-sm leading-relaxed"
          />
        </div>
      </div>

      <AIAssistant content={content} onResult={handleAIResult} />
    </div>
  )
}
