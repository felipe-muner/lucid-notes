'use client'

import { useState, useEffect } from 'react'
import { Save, Trash2, FileText, Loader2, Sparkles, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useNotesStore } from '@/store/notes'
import { useAnalyticsStore } from '@/store/analytics'
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

  const { incrementAIUsage } = useAnalyticsStore()

  const selectedNote = getSelectedNote()
  const isNewNote = !selectedNoteId
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [isAILoading, setIsAILoading] = useState(false)
  const [generatePrompt, setGeneratePrompt] = useState('')

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
    setShowAIPanel(false) // Reset AI panel on note change
    setGeneratePrompt('') // Reset generate prompt
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

  const handleAIAction = async (action: 'summarize' | 'autoTitle' | 'generate') => {
    if (!content.trim() && action !== 'generate') {
      return
    }

    setIsAILoading(true)
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          content,
          prompt: action === 'generate' ? generatePrompt : undefined
        })
      })

      const data = await response.json()
      
      if (data.success) {
        incrementAIUsage(action)
        if (action === 'autoTitle') {
          setTitle(data.result)
        } else {
          setContent(data.result)
        }
      } else {
        // Use fallback if available
        if (data.fallback) {
          if (action === 'autoTitle') {
            setTitle(data.fallback)
          } else {
            setContent(data.fallback)
          }
        }
      }
    } catch (error) {
      console.error('AI request failed:', error)
    } finally {
      setIsAILoading(false)
      if (action === 'generate') {
        setGeneratePrompt('')
      }
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
      <div className="flex items-center justify-center h-full p-8">
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
    <div className="flex h-full flex-col lg:flex-row">
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Editor Header */}
        <div className="border-b border-border p-3 lg:p-4">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <h2 className="text-base lg:text-lg font-semibold">
              {isNewNote ? 'New Note' : 'Edit Note'}
            </h2>
            <div className="flex gap-1 lg:gap-2">
              {!isNewNote && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="h-8 lg:h-9"
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
                className="h-8 lg:h-9"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
              {/* Mobile AI Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAIPanel(!showAIPanel)}
                className="h-8 lg:hidden"
              >
                <Sparkles className="h-4 w-4" />
                {showAIPanel ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </div>

          {error && (
            <div className="text-destructive text-sm mb-3 lg:mb-4 p-2 bg-destructive/10 rounded">
              {error}
            </div>
          )}

          <div className="space-y-3 lg:space-y-4">
            <Input
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base lg:text-lg font-medium h-9 lg:h-10"
            />
            
            <TagInput
              tags={tags}
              onChange={setTags}
              placeholder="Add tags (press Enter or comma to add)"
            />
          </div>
        </div>

        {/* Mobile AI Panel */}
        {showAIPanel && (
          <div className="lg:hidden border-b border-border p-3 bg-muted/30">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4" />
                <h3 className="font-medium">AI Assistant</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAIAction('summarize')}
                  disabled={isAILoading || !content.trim()}
                  className="text-xs"
                >
                  {isAILoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    'Summarize'
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAIAction('autoTitle')}
                  disabled={isAILoading || !content.trim()}
                  className="text-xs"
                >
                  {isAILoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    'Auto-Title'
                  )}
                </Button>
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Describe what to generate..."
                  value={generatePrompt}
                  onChange={(e) => setGeneratePrompt(e.target.value)}
                  disabled={isAILoading}
                  className="text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAIAction('generate')}
                  disabled={isAILoading || !generatePrompt.trim()}
                  className="w-full text-xs"
                >
                  {isAILoading ? (
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3 mr-2" />
                  )}
                  Generate Note
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Content Editor */}
        <div className="flex-1 p-3 lg:p-4 min-h-0">
          <Textarea
            placeholder="Start writing your note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="h-full resize-none text-sm leading-relaxed"
          />
        </div>
      </div>

      {/* Desktop AI Assistant */}
      <div className="hidden lg:block">
        <AIAssistant content={content} onResult={handleAIResult} />
      </div>
    </div>
  )
}