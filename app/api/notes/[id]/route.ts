import { NextRequest, NextResponse } from 'next/server'
import { Note, UpdateNoteRequest } from '@/types'

let notes: Note[] = []
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await delay(200)
    
    if (notes.length === 0) {
      const mockNotes = await import('@/db.json')
      notes = mockNotes.notes as Note[]
    }
    
    const note = notes.find(n => n.id === params.id)
    
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }
    
    return NextResponse.json({ note })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await delay(400)
    
    const body: UpdateNoteRequest = await request.json()
    const noteIndex = notes.findIndex(n => n.id === params.id)
    
    if (noteIndex === -1) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }
    
    if (body.tags && body.tags.length === 0) {
      return NextResponse.json({ error: 'At least one tag is required' }, { status: 400 })
    }
    
    const updatedNote = {
      ...notes[noteIndex],
      ...body,
      updatedAt: new Date().toISOString()
    }
    
    notes[noteIndex] = updatedNote
    
    return NextResponse.json({ note: updatedNote })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await delay(300)
    
    const noteIndex = notes.findIndex(n => n.id === params.id)
    
    if (noteIndex === -1) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }
    
    const deletedNote = notes[noteIndex]
    notes.splice(noteIndex, 1)
    
    return NextResponse.json({ note: deletedNote })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
  }
}
